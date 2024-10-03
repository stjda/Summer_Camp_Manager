const loadOrigins = require('./origins');

const corsMiddleware = async (req, res, next) => {
    try{ 
      // Load allowed origins before setting up CORS and starting the server
      const origins = await loadOrigins();
      const origin = req.headers.origin;
      console.log('CORS check - Request origin:', origin);
      console.log('CORS check - Allowed origins:', origins);
  
        // If no Origin header is provided
        if (!origin) {
          console.log('CORS check - No origin provided');
          // Option 1: Allow requests without an Origin header (like curl)
          // return next(); 

          // Option 2: Block requests without an Origin header
          return res.status(403).json({ error: 'Not allowed by CORS' });
      }
  
      // Check an Origin is on the _origins list, block it, otherwise allow it
      if (!origins.includes(origin)) {
        console.log('CORS check - Origin allowed');
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
  
        if (req.method === 'OPTIONS') {
          console.log('Handling OPTIONS request');
          return res.status(204).end();
        }
      } else {
        console.log('CORS check - Origin not allowed');
        return res.status(403).json({ error: 'forbidden' });
      }
  
      next();
    } catch (error) {
        console.error('Failed to load allowed origins:', error);
    }
}
    
// Apply rate limiting to all requests
module.exports = corsMiddleware