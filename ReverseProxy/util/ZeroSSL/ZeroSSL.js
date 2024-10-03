const axios = require('axios');
const forge = require('node-forge');
const path = require('path');

class ZeroSSL {
    constructor(apiKey, domain, email) {
        this.apiKey = apiKey;
        this.domain = domain;
        this.email = email;
        this.client = axios.create({
            baseURL: 'https://api.zerossl.com',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Set the base directory for verification files
        this.verificationDir = '/app/.well-known/pki-validation';
    }

    async generateCSR() {
        console.log(`[${new Date().toISOString()}] Generating CSR for domain: ${this.domain}`);
        const keys = forge.pki.rsa.generateKeyPair(2048);
        const csr = forge.pki.createCertificationRequest();
        csr.publicKey = keys.publicKey;
        csr.setSubject([
            { name: 'commonName', value: this.domain },
            { name: 'emailAddress', value: this.email },
            { shortName: 'C', value: 'US' },
            { shortName: 'ST', value: 'State' },
            { shortName: 'L', value: 'City' },
            { shortName: 'O', value: 'Organization' },
            { shortName: 'OU', value: 'IT' }
        ]);
        csr.sign(keys.privateKey);
        console.log(`[${new Date().toISOString()}] CSR generated successfully`);
        return {
            csr: forge.pki.certificationRequestToPem(csr),
            privateKey: forge.pki.privateKeyToPem(keys.privateKey)
        };
    }

    async createCertificate(csr) {
        console.log(`[${new Date().toISOString()}] Creating certificate for domain: ${this.domain}`);
        const payload = {
            certificate_domains: this.domain,
            certificate_csr: csr,
            certificate_validity_days: 90,
            strict_domains: 1
        };

        try {
            console.log(`[${new Date().toISOString()}] Sending request to ZeroSSL API`);
            const response = await this.client.post(`/certificates?access_key=${this.apiKey}`, payload);
            console.log(`[${new Date().toISOString()}] Received response from ZeroSSL API`);
            return this.handleCertificateResponse(response.data);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error creating certificate:`, error.response?.data || error.message);
            throw new Error(`Failed to create certificate: ${JSON.stringify(error.response?.data) || error.message}`);
        }
    }

    async handleCertificateResponse(data) {
        if (data.id && data.status === 'draft') {
            console.log('Certificate created successfully. Certificate ID:', data.id);
            await this.handleHttpVerification(data);
            return data;
        } else {
            console.error('Unexpected response from certificate creation:', JSON.stringify(data));
            throw new Error(`Unexpected response from certificate creation: ${JSON.stringify(data)}`);
        }
    }

    async handleHttpVerification(certificateData) {
        console.log(`[${new Date().toISOString()}] Handling HTTP verification for certificate ID: ${certificateData.id}`);
        if (certificateData.validation && certificateData.validation.other_methods){
            const verificationData = certificateData.validation.other_methods[this.domain];
            const fileUrl = new URL(verificationData.file_validation_url_http);
            const fileName = path.basename(fileUrl.pathname);
            const fileContent = verificationData.file_validation_content.join('\n');
       
            console.log(`[${new Date().toISOString()}] Verification file details:`);
            console.log(`  File name: ${fileName}`);
            console.log(`  File content: ${fileContent}`);
    
            return {
                fileName: fileName,
                fileContent: fileContent
            };
        }
        console.error(`[${new Date().toISOString()}] Unable to extract validation information from certificate data`);
        throw new Error('Unable to extract validation information from certificate data');
    }

    async verifyCertificate(certificateId) {
        const payload = { // this tells ZeroSSL thatthey need to come inspect your server
            validation_method: 'HTTP_CSR_HASH'
        };

        try {
            const response = await this.client.post(
                `/certificates/${certificateId}/challenges?access_key=${this.apiKey}`,
                payload
            );

            if (response.status === 200) {
                console.log('Verification initiated successfully. Certificate status:', response.status);
                return 200;
            } else {
                console.error('Verification failed:', response);
            }
        } catch (error) {
            console.error('Error verifying certificate:', error.response?.data || error.message);
        }
    }

    handleVerificationError(error) {
        if (error) {
            for (const [domain, details] of Object.entries(error.details)) {
                if (details.validation_successful) {
                    console.log(`Validation successful for ${domain}`);
                } else {
                    for (const [url, result] of Object.entries(details)) {
                        console.error(`Validation failed for ${domain} at ${url}:`);
                        console.error(`  Error: ${result.error_slug} - ${result.error_info}`);
                    }
                }
            }
        } else {
            console.error('Unknown error type:', error);
        }
    }

    async downloadCertificateInline(id, includeCrossSigned = 0) {
        try {
            const response = await axios.get(
                `https://api.zerossl.com/certificates/${id}/download/return?access_key=${this.apiKey}&include_cross_signed=${includeCrossSigned}`
            );
           
            let result = {};

            if (response.data && typeof response.data === 'object') {

                console.log('response.data["certificate.crt"]', response.data['certificate.crt']);

                // Check for certificate.crt
                if ('certificate.crt' in response.data) {
                    result.certificate = response.data['certificate.crt'];
                } else {
                    console.warn('Certificate data not found in response');
                }

                // Check for ca_bundle.crt
                if ('ca_bundle.crt' in response.data) {
                    result.caBundle = response.data['ca_bundle.crt'];
                } else {
                    console.warn('CA bundle data not found in response');
                }

                if (Object.keys(result).length > 0) {
                    console.log('Certificate data downloaded successfully');
                    return result;
                } else {
                    console.warn('No recognizable certificate data found in response');
                    return null;
                }
            } else {
                console.warn('Unexpected response format from ZeroSSL API');
                return null;
            }
            } catch (error) {
                console.error('Error downloading certificate:', error.message);
                return null;
            }
    }

    async listCertificates(options = {}) {
        const {
            certificateStatus,
            certificateType,
            search,
            limit = 100,
            page = 1
        } = options;

        try {
            const response = await this.client.get('/certificates', {
                params: {
                    access_key: this.apiKey,
                    certificate_status: certificateStatus,
                    certificate_type: certificateType,
                    search,
                    limit,
                    page
                }
            });

            if (response.data && Array.isArray(response.data.results)) {
                console.log(`Retrieved ${response.data.result_count} certificates out of ${response.data.total_count}`);
                return {
                    totalCount: response.data.total_count,
                    resultCount: response.data.result_count,
                    page: response.data.page,
                    limit: response.data.limit,
                    acmeUsageLevel: response.data.acmeUsageLevel,
                    isAcmeLocked: response.data.isAcmeLocked,
                    certificates: response.data.results
                };
            } else {
                throw new Error('Unexpected response format from ZeroSSL API');
            }
        } catch (error) {
            console.error('Error listing certificates:', error.response?.data || error.message);
            throw error;
        }
    }

    async cancelCertificate(certificateId) {
        try {
            const response = await this.client.post(`/certificates/${certificateId}/cancel`, null, {
                params: {
                    access_key: this.apiKey
                }
            });
    
            if (response.data && response.data.success === 1) {
                console.log(`Certificate ${certificateId} cancelled successfully`);
                return true;
            } else {
                throw new Error('Unexpected response format from ZeroSSL API');
            }
        } catch (error) {
            console.error(`Error cancelling certificate ${certificateId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async resendVerificationEmail(certificateId) {
        try {
            const response = await this.client.get(`/certificates/${certificateId}/challenges/email`, {
                params: {
                    access_key: this.apiKey
                }
            });

            if (response.data && response.data.success === 1) {
                console.log(`Verification email for certificate ${certificateId} resent successfully`);
                return true;
            } else {
                throw new Error('Unexpected response format from ZeroSSL API');
            }
        } catch (error) {
            console.error(`Error resending verification email for certificate ${certificateId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async getVerificationStatus(certificateId) {
        try {
            const response = await this.client.get(`/certificates/${certificateId}/status`, {
                params: {
                    access_key: this.apiKey
                }
            });
    
            if (response.data && 'validation_completed' in response.data && 'details' in response.data) {
                console.log(`Retrieved verification status for certificate ${certificateId}`);
                return {
                    validationCompleted: response.data.validation_completed === 1,
                    details: response.data.details
                };
            } else {
                throw new Error('Unexpected response format from ZeroSSL API');
            }
        } catch (error) {
            console.error(`Error getting verification status for certificate ${certificateId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async revokeCertificate(certificateId) {
        try {
            const response = await this.client.post(`/certificates/${certificateId}/revoke`, null, {
                params: {
                    access_key: this.apiKey
                }
            });
    
            if (response.data && response.data.success === 1) {
                console.log(`Certificate ${certificateId} revoked successfully`);
                return true;
            } else {
                throw new Error('Unexpected response format from ZeroSSL API');
            }
        } catch (error) {
            console.error(`Error revoking certificate ${certificateId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async getCertificate(certificateId) {
        try {
            const response = await this.client.get(`/certificates/${certificateId}`, {
                params: {
                    access_key: this.apiKey
                }
            });
    
            if (response.data && response.data.id) {
                console.log(`Retrieved information for certificate ${certificateId}`);
                return {
                    id: response.data.id,
                    type: response.data.type,
                    commonName: response.data.common_name,
                    additionalDomains: response.data.additional_domains,
                    created: response.data.created,
                    expires: response.data.expires,
                    status: response.data.status,
                    validationType: response.data.validation_type,
                    validationEmails: response.data.validation_emails,
                    replacementFor: response.data.replacement_for,
                    fingerprintSha1: response.data.fingerprint_sha1,
                    brandValidation: response.data.brand_validation,
                    validation: response.data.validation
                };
            } else {
                throw new Error('Unexpected response format from ZeroSSL API');
            }
        } catch (error) {
            console.error(`Error getting certificate ${certificateId}:`, error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = ZeroSSL;