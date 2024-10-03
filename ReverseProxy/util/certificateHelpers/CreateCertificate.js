const path = require('path');
const fs = require('fs').promises; 
const verifyCertificateLocal = require('./VerifyCertificateLocal')
const { config } = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });
const CHALLENGE_DIR = process.env.CHALLENGE_DIR

 const createCertificateAndVerify = async (zeroSSL, manualMode = false) => {
        try{   // Generate CSR
            const { csr, privateKey } = await zeroSSL.generateCSR();
            console.log(`-csr-privateKey----------------------------------------------------------------------------`);
            console.log(`[${new Date().toISOString()}] Generated CSR: , ${csr} \n and private key: `, privateKey );
            console.log(`-end-csr-privateKey----------------------------------------------------------------------------`);
            
            // Create certificate request
            const certificateData = await zeroSSL.createCertificate(csr);
            console.log(`-certificateData-----------------------------------------------------------------------------`);
            console.log(`[${new Date().toISOString()}] Certificate data: `, certificateData);
            console.log(`-end-certificateData----------------------------------------------------------------------------`);

            // Handle HTTP verification, returns the data to write to the file system for verification of the server
            const { fileName, fileContent } = await zeroSSL.handleHttpVerification(certificateData);

            console.log(`-fileName----------------------------------------------------------------------------`);
            console.log(`[${new Date().toISOString()}] Verification file name: ${fileName}`);
            console.log(`[${new Date().toISOString()}] Verification file content: ${fileContent}`);
            console.log(`-end-fileName----------------------------------------------------------------------------`);
    
            // location the credentials for verification are written.../usr/src/app/.well-known/pki-validation
            const filePath = path.join(CHALLENGE_DIR, fileName);
            const dirPath = path.join(CHALLENGE_DIR);
    
          // Clear out old files if they exist
          try {
              const files = await fs.readdir(dirPath);
              console.log(`-Delete-old-----------------------------------------------------------------------------`);
              if(files.length > 0){
                for (const file of files) {
                    await fs.unlink(path.join(CHALLENGE_DIR, file));
                    console.log(`[${new Date().toISOString()}] Deleted old file: ${file}`);
                }
              }
              console.log(`-end-Delete-old-----------------------------------------------------------------------------`);
          } catch (error) {
              console.error(`[${new Date().toISOString()}] Error clearing old files:`, error);
              return null
          }
    
              console.log(`-filePath-----------------------------------------------------------------------------`);
              console.log(`[${new Date().toISOString()}] Writing verification file to: ${filePath}`);
              console.log(`-end-filePath-----------------------------------------------------------------------------`);
    
          // Writes challenge file to the mounted volume
          try{
              await fs.writeFile(filePath, fileContent);
              console.log(`-fileContent-----------------------------------------------------------------------------`);
              console.log(`Verification file created at: ${filePath}`);
              console.log(`File content:\n${fileContent}`);
              console.log(`-end-fileContent-----------------------------------------------------------------------------`);
    
              console.log(`-Verify-file-write----------------------------------------------------------------------------`);
          // Verify that the file was written correctly
              const writtenContent = await fs.readFile(filePath, 'utf8');
              if (writtenContent !== fileContent) {
                console.error('File content mismatch after writing');
                return null
              }
              console.log(`[${new Date().toISOString()}] Wrote and verified challenge file at: ${filePath}, with content: ${writtenContent}`);
              console.log(`-end-Verify-file-write-----------------------------------------------------------------------------`);
          }catch (error) {
              console.error('Error obtaining certificate:', error);
              return null
          }
          
          // Verify certificate
          try {
              console.log(`-Begin-ZeroSSL-server-visit-----------------------------------------------------------------------------`);

              await verifyCertificateLocal(zeroSSL, certificateData.id);

              console.log(`[${new Date().toISOString()}] Certificate verification process completed successfully`);
            } catch (error) {
              console.error(`[${new Date().toISOString()}] Certificate verification failed:`, error);
              return null
            }

            console.log(`-End-ZeroSSL-server-visit-----------------------------------------------------------------------------`);

            return { fileName, fileContent, certificateData, privateKey, status: 200 }

        }catch (error) {
                console.error(`[${new Date().toISOString()}] Error obtaining certificate:`, error);
                return null
        }    
 }

 module.exports = createCertificateAndVerify;