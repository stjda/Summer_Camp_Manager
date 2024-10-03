const geoip = require('geoip-lite');
/**
 * Detailed logging middleware.
 * @function
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 * @param {express.NextFunction} next - Express next middleware function.
 */
const detailedLogger = (req, res, next) => {
  try {
    const startTime = new Date();
    const { method, url, headers } = req;
    const ip = headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown IP';
    const userAgent = headers['user-agent'] || 'Not specified';
    const referer = headers['referer'] || 'Not specified';
    const host = headers['host'] || 'Not specified';
    const origin = headers['origin'] || 'Not specified';
    const contentType = headers['content-type'] || 'Not specified';
    const contentLength = headers['content-length'] || 'Not specified';
    const protocol = req.protocol || 'http';
    const secure = req.secure ? 'HTTPS' : 'HTTP';
    const httpVersion = `HTTP/${req.httpVersion}`;
    const queryParams = JSON.stringify(req.query || {});
    const cookies = JSON.stringify(req.cookies || {});
  
    const geo = geoip.lookup(ip);
    const location = geo ? `${geo.city}, ${geo.region}, ${geo.country}` : 'Unknown location';

    const requestHost = headers['host'] || 'Not specified';
    const forwardedHost = headers['x-forwarded-host'] || 'Not specified';
  
    console.log(`[${startTime.toISOString()}] ${method} ${protocol}://${host}${url} from ${ip} (${location})`);
    console.log(`Details:
      User Agent: ${userAgent}
      Origin: ${origin}
      Host Header: ${host}
      Request Host: ${requestHost}
      X-Forwarded-Host: ${forwardedHost}
      Referer: ${referer}
      Content-Type: ${contentType}
      Content-Length: ${contentLength}
      Secure: ${secure}
      HTTP Version: ${httpVersion}
      Query Parameters: ${queryParams}
      Cookies: ${cookies}
      Geolocation: ${location}`);
  } catch (error) {
    console.error('Error in detailedLogger:', error);
  } finally {
    next();
  }
};


  module.exports = detailedLogger;