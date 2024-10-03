/** server.js
 * Express server configuration module.
 * @module server
*/
const express = require('express');
const serveZeroSSLChallenge = require('./util/ZeroSSL/ZeroSSLchallenege.js')
const { createProxyMiddleware } = require('http-proxy-middleware');
const { getHealthStatus } = require('./util/healthCheck.js');
const detailedLogger = require('./util/Servers/logger.js');
const corsMiddleware = require('./util/CorsMiddleware.js');
const serverManager = require('./serverManager.js');
const rateLimit = require('express-rate-limit');
const { config } = require('dotenv');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');
const http = require('http');


// Environment configuration
const envPath = path.resolve(__dirname, '.env');
config({ path: envPath });

const PORT = process.env.HTTPS_PORT;
const NODE_ENV = process.env.NODE_ENV || 'development';
const HTTP_PORT = 80;

/**
 * Express application instance.
 * @type {express.Application}
 */
const app = express();

async function setupServer() {
  
  app.get('/test', (req, res) => {
    res.send('HTTPS is working correctly!');
  });
  
    app.use(helmet({
      contentSecurityPolicy: true,
    }));

    // Body parser configuration
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // detailed loggin
    app.use(detailedLogger);

  // Security headers
  app.use((req, res, next) => {
    // Remove headers that might reveal server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
     // Protect against XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');
     // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
     // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
     // Control how much referrer information is included with requests
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
     // Define approved sources for content
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    // Ensure the site is only accessed over HTTPS
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

  // Define rate limit rule
  const limiter = rateLimit({
    windowMs: NODE_ENV === 'test' ? 1000 : 15 * 60 * 1000, // 1 second for test, 15 minutes for others
    // max: NODE_ENV === 'test' ? 25 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => req.path === '/health', 
    /**
     *  100 requests per second for test, 100 per 15 minutes for others
     *  uncomment for high performance testing
     */ 
    max: NODE_ENV === 'test' ? 100 : 100, 
    // uncomment when running 'Server' test suite
    // skip: (req) => NODE_ENV === 'test' && req.get('origin') === undefined,
    // uncomment when running performance under load test suite //
    // keyGenerator: (req) => {
    //   // Use a constant key in test environment to simulate a single client
    //   return NODE_ENV === 'test' ? 'test-client' : req.ip;
    // }
  });

  // Apply rate limiting to all routes except health check
  app.use((req, res, next) => {
    if (req.path !== '/health') {
      limiter(req, res, next);
    } else {
      next();
    }
  });

  // Health check endpoint
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
  // app.post('/trigger-maintenance/HTTPS_server_1_port3000', async (req, res) => {
  //   try {
  //     const serverConfig = {
  //       getMainServer: serverManager.getMainServer,
  //       getSecondServer: serverManager.getSecondServer,
  //       renewalCheckInterval: process.env.RENEWAL_CHECK_INTERVAL || 24 * 60 * 60 * 1000,
  //       mainPort: process.env.PORT || 3000,
  //       secondPort: process.env.HTTPS_PORT || 443,
  //       domain: process.env.DOMAIN
  //     };
  
  //     const stopRenewalProcessFunction = serverManager.getStopRenewalProcessFunction();
      
  //     res.send('Main server maintenance process triggered and completed');
  //   } catch (error) {
  //     console.error('Error during maintenance:', error);
  //     res.status(500).send('Error occurred during maintenance');
  //   }
  // });

  // Rate-limited route for testing
  app.get('/rate-limited', (req, res) => {
    res.status(200).send('Rate limited route');
  });

  /**
   * Proxy middleware options for forwarding requests to the backend server.
   * @type {Object}
   */
  const options = {
    target: 'http://localhost:3001', // URL of backend server
    changeOrigin: false,
    secure: false,
    ws: false, // Enable WebSocket proxying
    logLevel: 'debug',
   
  };

  const proxy = createProxyMiddleware(options);
  app.use('/server', proxy); /// this is the endpoint the frontend will send request to

  // api routes
  // app.use("/api", controllers);

  /**
   * Creates an HTTP server for handling SSL challenges.
   * @function
   * @returns {http.Server} The created HTTP server.
   */
  function httpServer (){
    return http.createServer((req, res) => {
      console.log(`*seting up server.js**************************************************`);
      if (req.method === 'GET' && req.url.startsWith('/.well-known/pki-validation/')) {
        console.log(`Current UID 3: ${process.getuid()}`);
        console.log(`Current GID 4: ${process.getgid()}`);
        serveZeroSSLChallenge(req, res);
      } else {
        // dont respond with anything
      // Redirect all other HTTP requests to HTTPS
      const host = req.headers.host;
      const httpsUrl = `https://${host}${req.url}`;
      res.writeHead(301, { Location: httpsUrl });
      res.end();
      }
    });
  }

  // HTTP Server initialization based on environment
  if (NODE_ENV === 'production' || NODE_ENV === 'test') {

      try {
        console.log(`Current UID 1: ${process.getuid()}`);
        console.log(`Current GID 2: ${process.getgid()}`);
        // HTTP server on port 80
        const HTTPserver = httpServer();
        HTTPserver.listen(HTTP_PORT, () => {
          console.log(`[${new Date().toISOString()}] 📭 Production HTTP server 🔑 running on port ${HTTP_PORT} for challenges`);
        });

      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in production setup:`, error);
        process.exit(1);
      }


  } else if(NODE_ENV === 'development') {
    // Use regular HTTP for development
    app.listen(PORT, () => {
      console.log(`HTTP server running on port 🔑 ${PORT} in development mode!
      📭 query @ http://localhost:${PORT}/`);
    }).on('error', (error) => {
      console.error('Error during server startup:', error);
    });
  }

  // ensures that clients receive a proper response even if an unexpected error occurs.
  app.use((err, req, res, next) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Unhandled error:`, err);
    console.error(`Request details: ${req.method} ${req.url}`);
    
      if (NODE_ENV === 'production' || NODE_ENV === 'test') {
        res.status(500).json({
          error: 'An unexpected error occurred',
          details: err.message,
          stack: err.stack
        });
      } else {
        res.status(500).json({ error: 'Please try again later' });
      }
    });

    return app;
  }
const mainApp = app
module.exports = {
  setupServer,
  mainApp
};