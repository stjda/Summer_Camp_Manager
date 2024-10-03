const path = require('path');
const { config } = require('dotenv');
const fs = require('fs').promises;

// Environment configuration
const envPath = path.resolve(__dirname, '../.env');
config({ path: envPath });

const CERTIFICATE_DIR = process.env.CERTIFICATE_DIR || '/usr/src/app/certificates'
const DB_CERT_DIR = process.env.DB_CERT_DIR || '/usr/src/app/certs'
const DB_CA_DIR = process.env.DB_CA_DIR || '/usr/src/app/certs'

async function saveCertificate(fileName, fileContent, directory = CERTIFICATE_DIR) {
    try {

        // Construct absolute path for the directory
        const absoluteDirectory = path.join(directory); // writes to: /usr/src/app/certificates

        // Ensure the directory exists
        await fs.mkdir(absoluteDirectory, { recursive: true });

        // Construct the full file path
        const filePath = path.join(absoluteDirectory, fileName);

        // Write the file
        await fs.writeFile(filePath, fileContent);

        console.log(`-Verify-certificate-written----------------------------------------------------------------------------`);
        // Verify that the file was written correctly
        const writtenContent = await fs.readFile(filePath, 'utf8');
        if (writtenContent !== fileContent) {
            console.error('File content mismatch after writing');
            return null;
        }
        console.log(`[${new Date().toISOString()}] Wrote and verified challenge file at: ${filePath}, with content: ${writtenContent}`);
        console.log(`-end-Verify-certificate-written-----------------------------------------------------------------------------`);

        return { filePath, fileContent }; // Return the full path of the saved file
    } catch (error) {
        console.error('Error saving certificate:', error);
        return null;
    }
}

async function saveDB_Certificates(fileName, fileContent, directory = DB_CERT_DIR) {
    try {
        if(fileName != 'myCA.crt'){
            // Construct absolute path for the directory
            const absoluteDirectory = path.join(directory); // writes to: /usr/src/app/certs
    
            // Ensure the directory exists
            await fs.mkdir(absoluteDirectory, { recursive: true });
    
            // Construct the full file path
            const filePath = path.join(absoluteDirectory, fileName);
    
            // Write the file
            await fs.writeFile(filePath, fileContent);
        }else{
            // Construct absolute path for the directory
            const absoluteDirectory = path.join(DB_CA_DIR); // writes to: /usr/src/app/certs

            // Ensure the directory exists
            await fs.mkdir(absoluteDirectory, { recursive: true });
    
            // Construct the full file path
            const filePath = path.join(absoluteDirectory, fileName);
    
            // Write the file
            await fs.writeFile(filePath, fileContent);
        }

        console.log(`-Verify-certificate-written----------------------------------------------------------------------------`);
        // Verify that the file was written correctly
        const writtenContent = await fs.readFile(filePath, 'utf8');
        if (writtenContent !== fileContent) {
            console.error('File content mismatch after writing');
            return null;
        }
        console.log(`[${new Date().toISOString()}] Wrote and verified challenge file at: ${filePath}, with content: ${writtenContent}`);
        console.log(`-end-Verify-certificate-written-----------------------------------------------------------------------------`);

        return { filePath, fileContent }; // Return the full path of the saved file
    } catch (error) {
        console.error('Error saving certificate:', error);
        return null;
    }
}

async function loadCertificate(filename) {
    try {
        const filePath = path.join(CERTIFICATE_DIR, filename);
        const fileContent = await fs.readFile(filePath, 'utf8');
        console.log(`Certificate ${filename} loaded successfully from ${filePath}`);
        return fileContent;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`[${new Date().toISOString()}] Certificate ${filename} not found in ${CERTIFICATE_DIR}`);
            return null;
        }
        console.error(`[${new Date().toISOString()}] Error loading ${filename} from ${CERTIFICATE_DIR}:`, error);
        return null;
    }
}

// checking if the certificates exist
async function ensureCertificateExists(filename) {
    const filePath = path.join(CERTIFICATE_DIR, filename);
    try {
        await fs.access(filePath, fs.constants.F_OK);
        console.log(`Certificate ${filename} already exists at ${filePath}`);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`Certificate ${filename} does not exist at ${filePath}`);
            return false;
        } else {
            console.error(`Error checking certificate ${filename}:`, error);
            throw error;
        }
    }
}

module.exports = { saveCertificate, loadCertificate, ensureCertificateExists, saveDB_Certificates };