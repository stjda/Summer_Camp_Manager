const performSSLRenewal = require('./util/MaintenenceAndRenewals/ssl-renewal');
const serverManager = require('./serverManager');
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
const { config } = require('dotenv');
const path = require('path');
const { spawn } = require('child_process');

// Environment configuration
const envPath = path.resolve(__dirname, '.env');
config({ path: envPath });
const MAINTENANCE = process.env.MAINTENANCE === 'true';
const RENEWAL = process.env.RENEWAL === 'true';
const DOMAIN = process.env.DOMAIN;

myEmitter.on('alert', (data) => {
    console.log(`[DEBUG] Alert event emitted: ${JSON.stringify(data)}`);
    const alertScript = spawn('node', [path.join(__dirname, 'alerts', 'ssl-renewalAndMaintenance', 'alert.js')], {
      env: { ...process.env, ALERT_SUBJECT: data.subject, ALERT_MESSAGE: data.message },
      detached: true,
      stdio: 'ignore'
    });
    alertScript.unref();
});

async function sendAlert(subject, message) {
    try {
        myEmitter.emit('alert', { subject, message });
        console.log(`[SSL Renewal] Alert sent: ${subject}`);
    } catch (error) {
        console.error(`[SSL Renewal] Failed to send alert: ${subject}`, error);
    }
}

async function runSSLRenewal() {
    console.log('[SSL Renewal] runSSLRenewal function started');
    try {
        console.log(`[${new Date().toISOString()}] SSL renewal process started for domain: ${DOMAIN}`);
        await waitForServersAndMaintenance();
        
        console.log('[SSL Renewal] Performing SSL renewal...');
        await performSSLRenewal();
        console.log('[SSL Renewal] SSL renewal completed successfully.');
        
        await sendAlert("SSL Renewal Process Completed", `The SSL renewal process has completed successfully for domain: ${DOMAIN}`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error during SSL renewal:`, error);
        await sendAlert("SSL Renewal Process Failed", `The SSL renewal process has failed for domain: ${DOMAIN}. Error: ${error.message}`);
    }
    console.log('[SSL Renewal] runSSLRenewal function completed');
}

async function waitForServersAndMaintenance() {
    console.log('[SSL Renewal] Starting server and maintenance check.');
    while (true) {
        const status = await serverManager.getServerStatus();
        console.log(`[SSL Renewal] Current status: ${JSON.stringify(status)}`);
        if (status.mainServer && status.secondServer && status.maintenanceComplete) {
            console.log('[SSL Renewal] Servers are initialized and maintenance is complete.');
            return;
        }
        console.log('[SSL Renewal] Waiting for servers to initialize and maintenance to complete...');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

runSSLRenewal().catch((error) => {
    console.error(`[${new Date().toISOString()}] Unhandled error in SSL renewal process:`, error);
}).finally(() => {
    console.log('Process completed successfully');
    if (process.send) {
        process.send('ready');
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});