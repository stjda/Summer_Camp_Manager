// ServerDrain.js
const path = require('path');
const { config } = require('dotenv');
const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });

const SERVER_DRAIN_TIME = process.env.SERVER_DRAIN_TIME || 60000
function drainAndCloseServer(server, serverType) {
    return new Promise((resolve) => {
        // Stop accepting new connections
        server.close(() => {
            console.log(`[${new Date().toISOString()}] ${serverType} server closed to new connections`);
            resolve();
        });

        // Set a maximum drain time 
        const maxDrainTime = SERVER_DRAIN_TIME;
        const drainTimeout = setTimeout(() => {
            console.log(`[${new Date().toISOString()}] Max drain time reached for ${serverType} server, forcing close`);
            destroyAllConnections(server);
            resolve();
        }, maxDrainTime);

        // Check periodically if all connections are closed
        const checkInterval = setInterval(() => {
            if (server.connections === 0) {
                clearInterval(checkInterval);
                clearTimeout(drainTimeout);
                console.log(`[${new Date().toISOString()}] All connections drained for ${serverType} server`);
                resolve();
            }
        }, 1000); // Check every second
    });
}

function destroyAllConnections(server) {
    server._connections = 0;
    server._handle.close();
    server.emit('close');
}

module.exports = drainAndCloseServer;