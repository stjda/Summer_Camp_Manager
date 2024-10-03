const ZeroSSL = require('../ZeroSSL/ZeroSSL.js');
const downloadCertificateWithRetry = require('./DownloadCertificateWithRetry.js');
const fs = require('fs').promises;
const createCertificateAndVerify = require('./CreateCertificate.js')
const path = require('path');
const { config } = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });

const CHALLENGE_DIR = process.env.CHALLENGE_DIR || '/usr/src/app/certificates'
/**
 * Obtains an SSL certificate for a specified domain using the ZeroSSL service.
 * 
 * This function performs the following steps:
 * 1. Generates a CSR (Certificate Signing Request)
 * 2. Creates a certificate request with ZeroSSL
 * 3. Handles HTTP verification by writing a challenge file
 * 4. Verifies the certificate locally
 * 5. Downloads the issued certificate
 * 6. Saves the private key and certificate
 * 7. Cleans up temporary files
 * 
 * @param {string} DOMAIN - The domain name for which to obtain the certificate
 * @param {string} EMAIL - The email address associated with the certificate request
 * @param {string} ZEROSSL_API_KEY - The API key for ZeroSSL service
 * @returns {Promise<Object>} A promise that resolves with an object containing the private key and certificate
 * @throws {Error} If any step in the certificate obtaining process fails
 * 
 * @example
 * try {
 *   const { key, cert } = await obtainCertificate('example.com', 'admin@example.com', 'your-zerossl-api-key');
 *   console.log('Certificate obtained successfully');
 * } catch (error) {
 *   console.error('Failed to obtain certificate:', error);
 * }
 */
async function obtainCertificate(DOMAIN, EMAIL, ZEROSSL_API_KEY) {

    console.log(`[${new Date().toISOString()}] Attempting to obtain certificate for domain: ${DOMAIN}`);
    try {
        const zeroSSL = new ZeroSSL(ZEROSSL_API_KEY, DOMAIN, EMAIL);
        
        // Create certificate request & Generate CSR & Verify
        const { certificateData, privateKey } = await createCertificateAndVerify(zeroSSL)
        
        // Introduce a 7-second delay
        console.log("Waiting for 10 seconds before attempting to download the certificate...");
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Download the certificate with retry

          const downloadResult = await downloadCertificateWithRetry(zeroSSL, certificateData.id, privateKey);

          if (!downloadResult || downloadResult.status !== 200) {
            console.error(`[${new Date().toISOString()}] Failed to download certificate:`, downloadResult ? downloadResult.error : 'Unknown error');
            return { cert: downloadResult };
          }

          // Save the certificate and private key
          console.log(`[${new Date().toISOString()}] Saving certificate and private key`);
          const { key, cert, ca, status, filePath } = downloadResult;

          const credentials = { key, cert, ca, status };
          console.log(`[${new Date().toISOString()}] Certificate and private key saved successfully`);
          
          console.log(`-End-ZeroSSL-cert-download-----------------------------------------------------------------------------`);
      
          console.log(`-Begin-cleanup-----------------------------------------------------------------------------`);

      // Clean up the challenge file
      try {
          console.log(`[${new Date().toISOString()}] Cleaning up challenge file`);
          await fs.unlink(filePath);
          console.log(`[${new Date().toISOString()}] Challenge file cleaned up successfully`);
      } catch (error) {
          console.warn(`[${new Date().toISOString()}] Warning: Failed to clean up challenge file:`, error);
      }

        console.log(`[${new Date().toISOString()}] Certificate obtaining process completed successfully`);
        console.log(`-end-cleanup-----------------------------------------------------------------------------`);

        return { credentials };
        
  } catch (error) {
        console.error(`[${new Date().toISOString()}] Error obtaining certificate:`, error);
  }    
}

  module.exports = obtainCertificate;