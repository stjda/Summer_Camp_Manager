// serverCreator.js
const https = require('https');
const { createHttpsServer, setupExpressApp, HTTPS_app }= require('./HTTPSserver');

/**
 * Creates the main HTTPS server for the application.
 * @async
 * @function
 * @returns {Promise<https.Server>} The created HTTPS server.
 */
async function createMainHttpsServer(credentials, app) {
    try {
         // create an HTTPS server that uses your Express app:
         const mainHttpsServer = https.createServer( credentials, app );
         // Add error logging
      mainHttpsServer.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] HTTPS server error:`, error);
      });
      return mainHttpsServer;
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error creating HTTPS server:`, error);
        throw error;
    }
  }

/**
 * Sets up the Express app and creates the HTTPS server.
 * @async
 * @function
 * @param {Buffer} key - The SSL private key.
 * @param {Buffer} cert - The SSL certificate.
 * @returns {Promise<https.Server>} The created HTTPS server.
 */
async function makeHTTPSserver(credentials, app) {
    try {
      setupExpressApp();
      return await createHttpsServer(credentials, app);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in makeHTTPSserver:`, error);
      throw error;
    }
  }

module.exports = {
  createMainHttpsServer,
  makeHTTPSserver,
  HTTPS_app
};