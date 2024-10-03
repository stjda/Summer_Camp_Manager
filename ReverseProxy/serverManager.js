// serverManager.js
const fs = require('fs').promises;
const path = require('path');

const STATUS_FILE = path.join(__dirname, 'server-status.json');

async function writeStatus(status) {
    await fs.writeFile(STATUS_FILE, JSON.stringify(status), 'utf8');
}

async function readStatus() {
    try {
        const data = await fs.readFile(STATUS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { mainServer: false, secondServer: false };
        }
        throw error;
    }
}

let mainServerAsServer = null;
let secondServerAsServer = null;

module.exports = {
  setMainServerAsServer: (server) => { mainServerAsServer = server; },
  setSecondServerAsServer: (server) => { secondServerAsServer = server; },
  getMainServer: () => mainServerAsServer,
  getSecondServer: () => mainServerAsServer,
  
  setMainServer: async (isListening) => {
    const status = await readStatus();
    status.mainServer = isListening;
    await writeStatus(status);
},
  setSecondServer: async (isListening) => {
      const status = await readStatus();
      status.secondServer = isListening;
      await writeStatus(status);
  },
  setMaintenanceComplete: async (isComplete) => {
    const status = await readStatus();
    status.maintenanceComplete = isComplete;
    await writeStatus(status);
},
  getServerStatus: readStatus
};