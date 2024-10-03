// init_maintenance.js
const { performMaintenance } = require('./util/MaintenenceAndRenewals/PERFORM_MAINTENANCE_HERE');
const serverManager = require('./serverManager');
const { config } = require('dotenv');
const path = require('path');
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
const { spawn } = require('child_process');

// Environment configuration
const envPath = path.resolve(__dirname, '.env');
config({ path: envPath });
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

async function runMaintenance() {
    try {
        console.log(`[${new Date().toISOString()}] Maintenance process started for domain: ${DOMAIN}`);
        console.log('[Maintenance] Waiting for servers to initialize...');
        await waitForServersToInitialize();
        
        console.log('[Maintenance] Starting maintenance tasks...');
        await performMaintenance();

        // Set maintenance complete status
        await serverManager.setMaintenanceComplete(true);
        console.log('[Maintenance] Maintenance complete status set to true.');
        
        myEmitter.emit('alert', {
            subject: "Maintenance Completed",
            message: `The Server-Maintenance process has completed successfully for domain: ${DOMAIN}`
          });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error during maintenance:`, error);

        myEmitter.emit('error', {
            subject: "The Server-Maintenance process Failed",
            message: `The Server-Maintenance process has failed for domain: ${DOMAIN}. Error: ${error.message}`
          });
        // Log the error but don't exit immediately
        console.error(error);
    }
}

async function waitForServersToInitialize(timeout = 600000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (await checkIfServersAreInitialized()) {
            console.log('[Maintenance] Servers are initialized. Proceeding with maintenance.');
            return;
        }
        console.log('[Maintenance] Waiting for servers to initialize...');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    throw new Error('Timeout waiting for servers to initialize');
}

async function checkIfServersAreInitialized() {
    const status = await serverManager.getServerStatus();
    console.log('[Maintenance] Current server status:', status);
    return status.mainServer && status.secondServer;
}

// Remove the setTimeout wrapper
runMaintenance().catch(async (error) => {
    console.error('Unhandled error in Server-Maintenence process:', error);
        try {

            myEmitter.emit('error', {
                subject: "Unhandled Error in Server-Maintenence Process",
                message: `An unhandled error occurred in the Server-Maintenence process. Error: ${error.message}`
              });
  
        } catch (emailError) {
            console.error('Failed to send error email:', emailError);
        }
    }).finally(() => {
        // At the end of your main process
        console.log('Process completed successfully');
        process.send('ready');
    });
