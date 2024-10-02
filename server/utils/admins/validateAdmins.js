const fs = require('fs');
const path = require('path');

// Function to load administrators from the JSON file
function loadAdministrators() {
    try {
        const filePath = path.join(__dirname, 'administrators.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(jsonData);
        return data.Administrators;
    } catch (error) {
        console.error('Error loading administrators:', error);
        return [];
    }
}

// Function to validate if an email belongs to an admin
function isAdmin(email) {
    try {
        const administrators = loadAdministrators();
        return administrators.some(admin => admin.email === email);
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

module.exports = { isAdmin };