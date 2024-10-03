#!/usr/bin/env node
const downloadCertificateWithRetry = require('../util/certificateHelpers/DownloadCertificateWithRetry');
const createCertificateAndVerify = require('../util/certificateHelpers/CreateCertificate');
const readline = require('readline');
const ZeroSSL = require('./ZeroSSL/ZeroSSL');
const path = require('path');
const { config } = require('dotenv');

console.log('Script started');

async function main() {
    try {
      const envPath = path.resolve(__dirname, '../.env');
      config({ path: envPath });
  
      console.log('Environment variables:', {
        DOMAIN: process.env.DOMAIN,
        EMAIL: process.env.EMAIL
      });
  
      await cleanupCertificates();
    } catch (error) {
      console.error('Error in main function:', error);
    }
  }

  async function readMultiLineInput(rl, prompt) {
    console.log(prompt);
    return new Promise((resolve) => {
        let input = '';
        rl.on('line', (line) => {
            input += line + '\n';
            if (line.includes('-----END RSA PRIVATE KEY-----')) {
                rl.removeAllListeners('line');
                resolve(input.trim());
            }
        });
    });
}

function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

async function promptUser(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function listCertificates(zeroSSL) {
    const certificates = await zeroSSL.listCertificates({
        certificateStatus: 'draft,pending_validation,issued,cancelled,revoked,expired',
        limit: 10 // Adjust as needed
    });

    console.log(`\nFound ${certificates.totalCount} certificates:`);
    certificates.certificates.forEach((cert, index) => {
        console.log(`${index + 1}. ID: ${cert.id}, Status: ${cert.status}, Common Name: ${cert.common_name}`);
    });

    return certificates;
}

async function downloadCertificate(zeroSSL, certificateId, privateKey) {
    return await downloadCertificateWithRetry(zeroSSL, certificateId, privateKey, manualMode = true); //manualMode = true
}

async function createAndVerify(zeroSSL){
    await createCertificateAndVerify(zeroSSL, manualMode = true) //manualMode = true
}

async function cleanupCertificates() {
    const zeroSSL = new ZeroSSL(process.env.ZEROSSL_API_KEY, process.env.DOMAIN, process.env.EMAIL);
    const rl = createReadlineInterface();

    try {
        while (true) {
            const certificates = await listCertificates(zeroSSL);

            const answer = await promptUser(rl, '\nEnter the number of the certificate to manage, or "q" to quit: ');

            if (answer.toLowerCase() === 'q') {
                break;
            }

            const index = parseInt(answer) - 1;
            if (isNaN(index) || index < 0 || index >= certificates.certificates.length) {
                console.log('Invalid selection. Please try again.');
                continue;
            }

            const selectedCert = certificates.certificates[index];
            const action = await promptUser(rl, `(n) Create new certificate\nOR:\nChoose an action for certificate ${selectedCert.id}:\n(c) Cancel\n(r) Revoke\n(v) View details\n(s) Get status\n(d) Download certificate\nYour choice:`);

            switch (action.toLowerCase()) {
                case 'c':
                    await cancelCertificate(zeroSSL, selectedCert.id);
                    break;
                case 'n':
                    console.log(`Creating certificate...`);
                    const resp = await createAndVerify(zeroSSL)
                    if(resp.status == 200){
                        console.log('Certificate created successfully, PLEASE GET YOUR PRIVATE KEY FROM THE SERVER LOGS & PROCEED TO DOWNLOAD.');
                    }else{
                        console.log('Failed to create certificate.');
                    }
                    break;
                case 'r':
                    await revokeCertificate(zeroSSL, selectedCert.id);
                    break;
                case 'v':
                    await viewCertificateDetails(zeroSSL, selectedCert.id);
                    break;
                case 's':
                    await getCertificateStatus(zeroSSL, selectedCert.id);
                    break;
                case 'd':
                    const privateKey = await readMultiLineInput(rl, 'Enter the private key for this certificate (paste the entire key, including BEGIN and END lines):');
                    console.log(`Downloading certificate ${selectedCert.id}...`);
                    const response = await downloadCertificate(zeroSSL, selectedCert.id, privateKey);
                    if(response.status == 200){
                        console.log(`Certificate downloaded successfully:\nFull-Chain:\n${response.filePath}\n`);
                    }else{
                        console.log('Failed to download certificate.');
                    }
                    break;
                default:
                    console.log('Invalid action. Please try again.');
                    continue;
            }
        }

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        rl.close();
    }
}

async function cancelCertificate(zeroSSL, certificateId) {
    try {
        const cancelResult = await zeroSSL.cancelCertificate(certificateId);
        if (cancelResult) {
            console.log(`Successfully cancelled certificate: ${certificateId}`);
        }
    } catch (error) {
        console.error(`Failed to cancel certificate ${certificateId}:`, error.message);
    }
}

async function revokeCertificate(zeroSSL, certificateId) {
    try {
        const revokeResult = await zeroSSL.revokeCertificate(certificateId);
        if (revokeResult) {
            console.log(`Successfully revoked certificate: ${certificateId}`);
        }
    } catch (error) {
        console.error(`Failed to revoke certificate ${certificateId}:`, error.message);
    }
}

async function getCertificateStatus(zeroSSL, certificateId) {
    try {
        const status = await zeroSSL.getVerificationStatus(certificateId);
        console.log(`\nStatus for certificate ${certificateId}:`);
        if (status.status === 'cancelled' || status.status === 'revoked') {
            console.log(`  ${status.message}`);
        } else {
            console.log(`  Validation Completed: ${status.validationCompleted}`);
            console.log(`  Details: ${JSON.stringify(status.details, null, 2)}`);
        }
    } catch (error) {
        console.error(`Failed to get status for certificate ${certificateId}:`, error.message);
    }
}

async function viewCertificateDetails(zeroSSL, certificateId) {
    try {
        const certificateInfo = await zeroSSL.getCertificate(certificateId);
        console.log('\nCertificate Details:');
        console.log(JSON.stringify(certificateInfo, null, 2));
    } catch (error) {
        console.error(`Failed to get details for certificate ${certificateId}:`, error.message);
    }
}

main().catch(console.error);