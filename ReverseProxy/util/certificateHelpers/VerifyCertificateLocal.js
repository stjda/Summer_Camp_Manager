async function verifyCertificateLocal(zeroSSL, certificateId) {
    try {
      console.log(`-verification-----------------------------------------------------------------------------`);
      console.log(`[${new Date().toISOString()}] Initiating certificate verification for ID: ${certificateId}`);
      const response = await zeroSSL.verifyCertificate(certificateId);
      
      if (response === 200){
        return 200
      }

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error during certificate verification:`, error);
    }
    console.log(`-end-verification-----------------------------------------------------------------------------`);
  }

  module.exports = verifyCertificateLocal;