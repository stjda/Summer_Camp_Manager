// ssl-renewal.js
const { createMainHttpsServer, HTTPS_app, makeHTTPSserver } = require('../Servers/serverCreator');
const { renewCertificateIfNeeded } = require('../certificateHelpers/RenewalFunctions');
const { loadCertificate } = require('../CertDBHandler')
const { mainApp }= require('../../server');
const https = require('https');
const serverManager = require('../../serverManager');
const drainAndCloseServer = require('./ServerDrain');
const { config } = require('dotenv');
const path = require('path');
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
const { spawn } = require('child_process');

// Environment configuration
const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });

myEmitter.on('alert', (data) => {
    console.log(`[DEBUG] Alert event emitted: ${JSON.stringify(data)}`);
    const alertScript = spawn('node', [path.join(__dirname, '..', '..', 'alerts', 'ssl-renewalAndMaintenance', 'alert.js')], {
        env: { ...process.env, ALERT_SUBJECT: data.subject, ALERT_MESSAGE: data.message }
    });
  
    alertScript.stdout.on('data', (data) => {
      console.log(`Alert script output: ${data}`);
    });
  
    alertScript.stderr.on('data', (data) => {
      console.error(`Alert script error: ${data}`);
    });
  
    alertScript.on('close', (code) => {
      console.log(`Alert script exited with code ${code}`);
    });
});
/**
 * Sets up the certificate renewal process with minimal downtime.
 * @param {https.Server} mainServer - The main HTTPS server.
 * @param {https.Server} secondServer - The second HTTPS server.
 * @param {number} renewalCheckInterval - The interval in milliseconds between renewal checks.
 * @param {number} mainPort - The port for the main server.
 * @param {number} secondPort - The port for the second server.
 * @param {string} domain - The domain for the servers.
 */

async function RenewalProcess(mainServer, secondServer, renewalCheckInterval, mainPort, secondPort, domain) {
    console.log(`[${new Date().toISOString()}] Starting SSL renewal process...Checking if certificate renewal is needed...`);    
        try {
            const renewed = await renewCertificateIfNeeded();
            
            if (renewed) {
                console.log(`[${new Date().toISOString()}] Certificates renewed. Updating servers...`);
                
                try {
                    // Load new certificates
                    const key = await loadCertificate('private-key.pem');
                    const cert = await loadCertificate('certificate.pem');
                    const ca = await loadCertificate('ca_bundle.pem')
                    
                    if (key && cert && ca) {
                        const credentials = { key, cert, ca };
                        // Update main server
                        await updateServer(mainServer, createMainHttpsServer, credentials, mainApp, mainPort, domain, 'main');

                        // Update second server
                        await updateServer(secondServer, makeHTTPSserver, credentials, HTTPS_app, secondPort, domain, 'second');

                        console.log(`[${new Date().toISOString()}] Servers updated with new certificates.`);
                    } else {
                        console.error(`[${new Date().toISOString()}] Failed to load new certificates. Servers not updated.`);
                    }
                } catch (updateError) {
                    console.error(`[${new Date().toISOString()}] Error updating servers with new certificates:`, updateError);
                }
            } else {
                console.log(`[${new Date().toISOString()}] No certificate renewal needed. Servers not updated.`);
                            // Send alert about the failure
                try {

                    myEmitter.emit('alert', {
                        subject: `No certificate renewal needed. `,
                        message: `Servers not updated @ ${domain}`
                      });

                } catch (alertError) {
                    console.error(`[${new Date().toISOString()}] Failed to send alert email:`, alertError);
                }
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error during certificate renewal process:`, error);
        }
    
    console.log(`[${new Date().toISOString()}] Certificate renewal process completed, will check again in ${renewalCheckInterval / (60 * 60 * 1000)} hours.`);
}

/**
 * Updates a server with new certificates.
 * @param {https.Server} currentServer - The current server to update.
 * @param {Function} serverCreator - Function to create a new server.
 * @param {Buffer} key - The new private key.
 * @param {Buffer} cert - The new certificate.
 * @param {number} port - The port for the server.
 * @param {string} domain - The domain for the server.
 * @param {string} serverType - The type of server ('main' or 'second').
 */
async function updateServer(currentServer, serverCreator, credentials, app, port, domain, serverType) {
        let newServer;
        try {
            // Create the new server
            newServer = serverCreator(credentials, app);

            // Start the new server
            await new Promise((resolve, reject) => {
                newServer.listen(port, resolve)
                        .on('error', reject);
            });

            console.log(`[${new Date().toISOString()}] New ${serverType} HTTPS server running on https://${domain}:${port}`);

            // Update the server in serverManager
            if (serverType === 'main') {
                serverManager.setMainServer(newServer);
            } else {
                serverManager.setSecondServer(newServer);
            }

            // Drain and close the old server
            await drainAndCloseServer(currentServer, serverType);
            console.log(`[${new Date().toISOString()}] Old ${serverType} HTTPS server closed after draining connections`);

            // send a sucess message
            try {

                myEmitter.emit('alert', {
                    subject: `SSL Renewal Success, old server ${serverType} drained @ ${domain}`,
                    message: `Sucessfully updated ${serverType} server during SSL renewal.`
                  });
            
            } catch (alertError) {
                console.error(`[${new Date().toISOString()}] Failed to send alert email:`, alertError);
            }

            return newServer;
        }catch (error) {
            console.error(`[${new Date().toISOString()}] Error updating ${serverType} server:`, error);
    
            // Rollback: Keep using the current server
            if (serverType === 'main') {
                serverManager.setMainServer(currentServer);
            } else {
                serverManager.setSecondServer(currentServer);
            }

            // Close the new server if it was created but failed to start properly
            if (newServer) {
                newServer.close(() => {
                    console.log(`[${new Date().toISOString()}] Failed initialization of ${serverType} server, ${serverType} closed`);
                });
            }
            // Send alert about the failure
            try {

                myEmitter.emit('alert', {
                    subject: `SSL Renewal Failed for ${serverType} Server @ ${domain}`,
                    message: `Failed to update ${serverType} server during SSL renewal. Continuing with existing server. Error: ${error.message}`
                  });

            } catch (alertError) {
                console.error(`[${new Date().toISOString()}] Failed to send alert email:`, alertError);
            }

        // Return the current server since we're falling back to it
        return currentServer;
    }
}

async function performSSLRenewal() {
    try {
        
   
        const mainServer = serverManager.getMainServer()
        const secondServer = serverManager.getSecondServer()
        
        await RenewalProcess(
            mainServer,
            secondServer,
            process.env.RENEWAL_CHECK_INTERVAL,
            process.env.PORT,
            process.env.HTTPS_PORT,
            process.env.DOMAIN
        );

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error during SSL renewal:`, error);
    }
}
module.exports = performSSLRenewal ;
