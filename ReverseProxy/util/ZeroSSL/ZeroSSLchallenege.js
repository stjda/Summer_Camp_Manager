const path = require('path');
const { config } = require('dotenv');
const fs = require('fs').promises;

// Environment configuration
const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });
const CHALLENGE_DIR = process.env.CHALLENGE_DIR

/**
 * Serves ZeroSSL challenge files.
 * @async
 * @function
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 */
const serveZeroSSLChallenge = async (req, res) => {
    // __dirname will point to /app/util/ZeroSSL/ 
    // const challengePath = path.join(__dirname, '.well-known', 'pki-validation', path.basename(req.url));
    const challengePath = path.join(CHALLENGE_DIR, path.basename(req.url));
    try {
      const fileContent = await fs.readFile(challengePath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');
      res.end(fileContent);
    } catch (error) {
      console.error(`Error serving ZeroSSL challenge file: ${error.message}`);
      req.socket.end();
    }
  };

module.exports = serveZeroSSLChallenge;