const forge = require('node-forge');
const { loadCertificate } = require('../CertDBHandler.js');
const obtainCertificate = require('./ObtainCertificate.js');
const path = require('path');
const { config } = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });

async function getCertificateExpirationDate() {
    try {
        const cert = await loadCertificate('certificate.pem');
        if (!cert) return null;

        // Parse the certificate using node-forge
        const certObj = forge.pki.certificateFromPem(cert);

        // Return the notAfter date
        return certObj.validity.notAfter;
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error reading certificate:`, error);
        return null;
    }
  }
  
  async function shouldRenewCertificate() {
    const expirationDate = await getCertificateExpirationDate();
    if (!expirationDate) return true;
  
    const now = new Date();
    const daysUntilExpiration = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    console.log(`[${now.toISOString()}] Certificate expires on ${expirationDate.toISOString()}. Days until expiration: ${daysUntilExpiration.toFixed(2)}`);
    
    return daysUntilExpiration <= 30; // Renew if less than 30 days until expiration
  }
  

  async function renewCertificateIfNeeded() {
    console.log(`[${new Date().toISOString()}] Checking if certificate renewal is needed`);
    try {
        const shouldRenew = await shouldRenewCertificate();
        if (shouldRenew) {
            console.log(`[${new Date().toISOString()}] Certificate is expiring soon. Attempting renewal...`);
            try {
                await obtainCertificateWithRetry();
                console.log(`[${new Date().toISOString()}] Certificate saved successfully. 🔑🔑🔑 `);
            
            } catch (renewError) {
                console.error(`[${new Date().toISOString()}] Failed to obtain new certificate:`, renewError);
                console.error(`[${new Date().toISOString()}] Stack trace:`, renewError.stack);
                
                // Check remaining validity of current certificate
                const currentExpiration = await getCertificateExpirationDate();
                if (currentExpiration) {
                    const now = new Date();
                    const daysRemaining = (currentExpiration - now) / (1000 * 60 * 60 * 24);
                    console.warn(`[${new Date().toISOString()}] Current certificate will expire in ${daysRemaining.toFixed(2)} days.`);
                } else {
                    console.error(`[${new Date().toISOString()}] Unable to determine expiration of current certificate.`);
                }
                
                // TODO: Implement notification system for critical errors
                // sendErrorNotification('Certificate renewal failed', renewError);
            }
        } else {
            console.log(`[${new Date().toISOString()}] Certificate is still valid. No renewal needed.`);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Unexpected error in certificate renewal process:`, error);
        console.error(`[${new Date().toISOString()}] Stack trace:`, error.stack);
        
        // TODO: Implement notification system for critical errors
        // sendErrorNotification('Unexpected error in certificate renewal process', error);
    }
}

/**
 * Attempts to obtain a certificate with a retry mechanism and exponential backoff.
 * 
 * This function will attempt to obtain a certificate up to the specified number of times.
 * If successful, it immediately returns the result and stops further retry attempts.
 * If an error occurs, it catches the error, logs it, and continues to the next attempt
 * (unless it's the last attempt).
 * 
 * @param {number} [maxRetries=3] - The maximum number of attempts to obtain the certificate.
 * @param {number} [delay=5000] - The initial delay in milliseconds between retry attempts.
 * @returns {Promise<Object>} A promise that resolves with the certificate data on success.
 * @throws {Error} If all retry attempts fail, it throws the last encountered error.
 * 
 * @example
 * try {
 *   const certData = await obtainCertificateWithRetry(5, 10000);
 *   console.log('Certificate obtained:', certData);
 * } catch (error) {
 *   console.error('Failed to obtain certificate:', error);
 * }
 */
async function obtainCertificateWithRetry(domain, email, zeroSSL_api_key, maxRetries = 1, delay = 5000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[${new Date().toISOString()}] Attempt ${attempt} to obtain certificate`);
            
            const result = await obtainCertificate(domain, email, zeroSSL_api_key);

            if(result.credentials.status === 200){
                console.log(`[${new Date().toISOString()}] Certificate obtained successfully on attempt ${attempt}: status: ${result.status}`);
                return { status: 200, cert: result.credentials.cert, ca: result.credentials.ca, key: result.credentials.key}
            }else{
                console.error(`[${new Date().toISOString()}] FAILED to obtain certificate on attempt ${attempt}, status: ${result.status}, error: ${result.error}`);
                return null;
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Attempt ${attempt} failed:`, error);
            return null
            // if (attempt === maxRetries) {
            //      console.error(`[${new Date().toISOString()}] All ${maxRetries} attempts to obtain certificate have failed.`);
            // }
            // console.log(`[${new Date().toISOString()}] Waiting ${delay/1000} seconds before next attempt...`);
            // await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

module.exports = { renewCertificateIfNeeded, getCertificateExpirationDate, shouldRenewCertificate, obtainCertificateWithRetry };