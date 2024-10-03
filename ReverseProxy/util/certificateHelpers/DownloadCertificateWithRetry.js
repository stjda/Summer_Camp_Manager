const { saveCertificate, saveDB_Certificates } = require('../CertDBHandler');

async function downloadCertificateWithRetry(zeroSSL, certificateId, privateKey, manualMode = false) {

  console.log(`-Begin-ZeroSSL-cert-download-----------------------------------------------------------------------------`);

  let maxRetries = 1
  // can be setup for retries
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[${new Date().toISOString()}] Attempting to download certificate (Attempt ${attempt} of ${maxRetries})`);
      
      const cert = await zeroSSL.downloadCertificateInline(certificateId);
      console.log(`[${new Date().toISOString()}] Cert ${cert})`);

      if (!cert || Object.keys(cert).length === 0) {
        console.log(`[${new Date().toISOString()}] Certificate download returned empty or null result`);
        return { status: 404, error: "Certificate download returned empty or null result" };
      }
      
      const {certificate, caBundle} = cert
                ////////////////////////////////////////////////////////////////
                // saving for minio in the expected fomat
                await saveDB_Certificates('private.key', privateKey);
                // await saveDB_Certificates('public.cert',  certificate);
                await saveDB_Certificates('public.crt', `${certificate}\n${caBundle}`);
                await saveDB_Certificates('myCA.crt', caBundle);
                ////////////////////////////////////////////////////////////////
                // Save the main certificate // the directory is created if it doesnt exist by the function
                await saveCertificate('certificate.pem', certificate);
                // Save the CA bundle
                await saveCertificate('ca_bundle.pem', caBundle);
                // Save the private key (assuming you have it stored somewhere)
                await saveCertificate('private-key.pem', privateKey);
                // Optionally, save the fullchain (certificate + CA bundle)
                const response = await saveCertificate('fullchain.pem', `${certificate}\n${caBundle}`);

      console.log(`[${new Date().toISOString()}] Certificate downloaded & Saved successfully on attempt ${attempt}`);
      
      if(!manualMode){
        console.log(`automated mode credentials saved`);
        return { status: 200, key: privateKey, cert: certificate, ca: caBundle, filePath: response.filePath };
      }else if(manualMode){
        console.log(`manual mode credentials saved`);
        return { status: 200, key: privateKey, cert: certificate, ca: caBundle, filePath: response.filePath };
      }
      return { status: 500};
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error downloading certificate (Attempt ${attempt}/${maxRetries}):`, error);
      if (attempt === maxRetries) {
        throw new Error(`Failed to download certificate after ${maxRetries} attempts`);
      }
    }
  }
}

  module.exports = downloadCertificateWithRetry;    