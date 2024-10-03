// init.js
const { shouldRenewCertificate, obtainCertificateWithRetry }= require('./util/certificateHelpers/RenewalFunctions');
const { createMainHttpsServer, makeHTTPSserver, HTTPS_app } = require('./util/Servers/serverCreator')
const { loadCertificate,  ensureCertificateExists } = require('./util/CertDBHandler'); // Assuming these functions are defined
const { setupServer, mainApp} = require('./Reverse_Proxy/server');
const serverManager = require('./serverManager');
const { config } = require('dotenv');
const path = require('path');

// Environment configuration
const envPath = path.resolve(__dirname, '.env');
config({ path: envPath });
const PORT = process.env.HTTPS_PORT;
const SECOND_PORT = process.env.PORT;
const DOMAIN = process.env.DOMAIN;
const EMAIL =process.env.EMAIL;
const ZEROSSL_API_KEY = process.env.ZEROSSL_API_KEY;

async function setupMainServer(key, cert, app) {
    try {
        const mainHttpsServer = await createMainHttpsServer(key, cert, app);
        mainHttpsServer.listen(PORT, () => {
            console.log(`[${new Date().toISOString()}] 📭 Production Main application 🔑 server running on https://${DOMAIN}:${PORT}`);
        });
        // set the server to global state to manage maintainence
        await serverManager.setMainServer(true);
        serverManager.setMainServerAsServer(mainHttpsServer);
        return mainHttpsServer;
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error setting up main HTTPS server:`, error);
        await serverManager.setMainServer(false);
        return null;
    }
}

async function setupSecondHTTPSServer(key, cert, app) {
    try {
        const secondHttpsServer = await makeHTTPSserver(key, cert, app);
        secondHttpsServer.listen(SECOND_PORT, () => {
            console.log(`[${new Date().toISOString()}] 📭 Second HTTPS server 🔒 running on https://${DOMAIN}:${SECOND_PORT}`);
        });
        // set the server to global state to manage maintainence
        await serverManager.setSecondServer(true);
        serverManager.setSecondServerAsServer(secondHttpsServer);
        return secondHttpsServer;
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error setting up second HTTPS server:`, error);
        await serverManager.setSecondServer(false);
        return null;
    }
}

async function loadOrObtainCertificates() {
    let k, c, a, credentials = null;
    const certFiles = ['private-key.pem', 'certificate.pem', 'ca_bundle.pem'];
    const missingFiles = [];
    try {
        console.log(`*loadOrObtainCertificates**************************************************`);
        // Check for existence of all certificate files
        for (const file of certFiles) {
            if (!(await ensureCertificateExists(file))) {
                missingFiles.push(file);
            }
        }

        // If all files exist, try to load them
        if (missingFiles.length === 0) {
            try {

                k = await loadCertificate('private-key.pem');
                c = await loadCertificate('certificate.pem');
                a = await loadCertificate('ca_bundle.pem');
                credentials = { key: k, cert: c, ca: a };

                console.log(`[${new Date().toISOString()}] All certificates loaded successfully.`);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Error loading certificates:`, error);
            }
        } else {
            console.log(`[${new Date().toISOString()}] Certificates not present...: ${missingFiles.join(', ')}`);
        }

    } catch (error) {
        console.log(`[${new Date().toISOString()}] Certificates not found. Will attempt to obtain new ones. Error:`, error);
    }

    if (!credentials || await shouldRenewCertificate()){
        console.log(`[${new Date().toISOString()}] Certificate not found or expiring soon. Obtaining a new one...`);
        try {
            console.log(`*!credentials || await shouldRenewCertificate()**************************************************`);
            let creds = await obtainCertificateWithRetry(DOMAIN, EMAIL, ZEROSSL_API_KEY);
            if (creds.status === 200){
                let data = creds.data
                // { key, cert, ca } = data
                console.log(`creds.status === 200**************************************************`);

                console.log(`[${new Date().toISOString()}] Verify recieved cedentials :: ${creds}`)

                k = await loadCertificate('private-key.pem'),
                c = await loadCertificate('certificate.pem'),
                a = await loadCertificate('ca_bundle.pem')

                credentials = {
                    key: k,
                    cert: c,
                    ca: a
                };
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error obtaining certificates:`, error);
        }
    }

    return { credentials };
}

async function start() {
    try {
        console.log(`*setupServer**************************************************`);
        // Set up the main HTTP server for ZeroSSL challenge
        await setupServer();

        // Load or obtain certificates
        const { credentials } = await loadOrObtainCertificates();
        const {key, cert, ca} = credentials

        console.log(`[${new Date().toISOString()}] Starting server setup...with credentials: ${credentials}`);

        if (key && cert) {
            // Set up main HTTPS server
            await setupMainServer(credentials, mainApp);

            // Set up second HTTPS server
            await setupSecondHTTPSServer(credentials, HTTPS_app);

            
            // Verify that servers are set in serverManager
           const status = await serverManager.getServerStatus();
           const mainServer = status.mainServer
           const secondServer = status.secondServer;

            if (mainServer && secondServer) {
                console.log(`[${new Date().toISOString()}] Both main and second servers are set up successfully.`);
            } else {
                console.error(`[${new Date().toISOString()}] Failed to set up one or both servers.`);
            }

        } else {
            console.log(`[${new Date().toISOString()}] Running in HTTP-only mode due to missing certificates.`);
        }

        console.log(`[${new Date().toISOString()}] Server setup completed.`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error during server setup:`, error);
    }
}
// setupServer();
// Start the server
start().catch(error => {
    console.error(`[${new Date().toISOString()}] Unhandled error during startup:`, error);
});