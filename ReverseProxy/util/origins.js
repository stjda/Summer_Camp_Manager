const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

function isValidOrigin(origin) {
    // Allow localhost with optional port
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return true;
    }
    
    // Regular expression for other valid origins
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(origin);
}

function loadOrigins() {
    return new Promise((resolve, reject) => {
        const filePath = path.resolve(__dirname, '_origins.csv');
        
        // console.log('Attempting to read file:', filePath);

        if (!fs.existsSync(filePath)) {
            console.error('_origins.csv file not found');
            return reject(new Error('_origins.csv file not found'));
        }

        let origins = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // console.log('Read data:', data);
                if (data.origin && typeof data.origin === 'string') {
                    const trimmedOrigin = data.origin.trim();
                    if (isValidOrigin(trimmedOrigin)) {
                        origins.push(trimmedOrigin);
                    } else {
                        console.warn(`Invalid origin ignored: ${trimmedOrigin}`);
                    }
                } else {
                    console.warn('Invalid data format:', data);
                }
            })
            .on('end', () => {
                // console.log('Finished reading file. origins:', origins);
                if (origins.length === 0) {
                    console.warn('No origins loaded from file. Using default origins.');
                    origins = ['http://localhost:5173', 'https://guyycodes.github.io'];
                }
                resolve(origins);
            })
            .on('error', (error) => {
                console.error('Error reading file:', error);
                reject(error);
            });
    });
}

// For testing purposes
loadOrigins()
    .then(origins => console.log('Loaded origins:', origins))
    .catch(error => console.error('Error loading origins:', error));

module.exports = loadAllowedOrigins;