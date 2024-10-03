const rateLimit = require('express-rate-limit');
const express = require('express');
const https = require('https');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const { config } = require('dotenv');

const corsMiddleware = require('../CorsMiddleware.js');
const { getHealthStatus } = require('../healthCheck.js');
const detailedLogger = require('./logger.js');
const serverManager = require('../../Reverse_Proxy/serverManager.js');
// Environment configuration
const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });

/**
 * Express application instance.
 * @type {express.Application}
 */
const app = express();

/**
 * Sets up the Express application with middleware and routes.
 * @function
 */
function setupExpressApp() {

  app.get('/test', (req, res) => {
    res.send('HTTPS is working correctly!');
  });

  // Middleware setup
  app.use(helmet({
    contentSecurityPolicy: true,
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  app.use(detailedLogger);
  
  // Security headers
  app.use((req, res, next) => {
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    next();
  });
  
  // CORS setup after body parser, before the routes is where this belongs
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    app.use(corsMiddleware);
  } else {
    app.use(cors({ origin: '*' }));
  }
////////////////////////////////////////////////////////////////////////////
  // Rate limiting
  const limiter = rateLimit({
    windowMs: process.env.NODE_ENV === 'test' ? 1000 : 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 100 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => req.path === '/health',
  });

  app.use((req, res, next) => {
    if (req.path !== '/health') {
      limiter(req, res, next);
    } else {
      next();
    }
  });

  // Routes
  app.get('/health', async (req, res) => {
    try {
      const healthStatus = await getHealthStatus();
      res.json(healthStatus);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve health status',
        error: error.message
      });
    }
  });

// Add this route to trigger maintenance manually
app.post('/trigger-maintenance/HTTPS_server_2_port443', async (req, res) => {
  try {
    const serverConfig = {
      getMainServer: serverManager.getMainServer,
      getSecondServer: serverManager.getSecondServer,
      renewalCheckInterval: process.env.RENEWAL_CHECK_INTERVAL || 24 * 60 * 60 * 1000,
      mainPort: process.env.PORT || 3000,
      secondPort: process.env.HTTPS_PORT || 443,
      domain: process.env.DOMAIN
    };

    const stopRenewalProcessFunction = serverManager.getStopRenewalProcessFunction();
    
    res.send('Second server maintenance process triggered and completed');
  } catch (error) {
    console.error('Error during maintenance:', error);
    res.status(500).send('Error occurred during maintenance');
  }
});

  app.get('/rate-limited', (req, res) => {
    res.status(200).send('Rate limited route');
  });

  return app
}

  // /**
  //  * Proxy middleware options for forwarding requests to the backend server.
  //  * @type {Object}
  //  */
  // const options = {
  //   target: 'http://localhost:3000', // URL of server
  //   changeOrigin: false,
  //   secure: false,
  //   ws: false, // Enable WebSocket proxying
  //   logLevel: 'debug',
   
  // };

  // const proxy = createProxyMiddleware(options);
  // app.use('/server', proxy); /// this is the endpoint the frontend will send request to



/**
 * Creates the main HTTPS server for the application. Then passes it
 * @async
 * @function
 * @param {Buffer} key - The SSL private key.
 * @param {Buffer} cert - The SSL certificate.
 * @returns {Promise<https.Server>} The created HTTPS server.
 */
async function createHttpsServer(credentials, app) {
  try {
    const httpsServer = https.createServer(credentials, app);

    httpsServer.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] HTTPS server error:`, error);
    });

    return httpsServer;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating HTTPS server:`, error);
    throw error;
  }
}

const HTTPS_app = app 
module.exports = { createHttpsServer, HTTPS_app, setupExpressApp } ;