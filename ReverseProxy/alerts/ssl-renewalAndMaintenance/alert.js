// alert,js
const { sendAlertEmail } = require('../../init_alert-utils');
const { config } = require('dotenv');
const path = require('path');
// Environment configuration
const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });

const MAINTENANCE = process.env.MAINTENANCE === 'true';
const RENEWAL = process.env.RENEWAL === 'true';
const DOMAIN = process.env.DOMAIN;
let ongoingAlerts = 0;
let isShuttingDown = false;

const sendAlertWithTimeout = async (message1, message2, maintenance, sslRenewal) => {
  if (isShuttingDown) {
    console.log('[sendAlertWithTimeout] Shutdown in progress, not sending new alerts');
    throw new Error('Shutdown in progress, alert not sent');
  }

  console.log(`[sendAlertWithTimeout] Starting sendAlertWithTimeout function. Maintenance: ${maintenance}, SSL Renewal: ${sslRenewal}`);
  ongoingAlerts++;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      console.log('[sendAlertWithTimeout] Alert sending timed out');
      ongoingAlerts--;
      reject(new Error('Alert sending timed out'));
    }, 30000); // 30 seconds timeout

    sendAlert(message1, message2, maintenance, sslRenewal)
      .then((result) => {
        clearTimeout(timeoutId);
        console.log('[sendAlertWithTimeout] Alert sent successfully within timeout');
        ongoingAlerts--;
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('[sendAlertWithTimeout] Error in alert sending:', error);
        ongoingAlerts--;
        reject(error);
      });
  });
};

async function sendAlert(message1, message2, maintenance, sslRenewal) {
  console.log(`[sendAlert] Starting sendAlert function. Maintenance: ${maintenance}, SSL Renewal: ${sslRenewal}`);
  const domain = process.env.DOMAIN || 'Unknown';
  const subject = `Reverse-Proxy Server Notification - Domain: ${domain}`;
  const bodyIntro = `The ${message1}${message2} server was triggered:\n`;
  
  console.log(`[sendAlert] Prepared email subject: ${subject}`);
  console.log(`[sendAlert] Prepared email body intro: ${bodyIntro}`);

  try {
    console.log('[sendAlert] Attempting to send email...');
    let info;
    if (maintenance) {
      console.log('[sendAlert] Sending maintenance alert');
      info = await sendAlertEmail(subject, bodyIntro, true, false);
    } else if (sslRenewal) {
      console.log('[sendAlert] Sending SSL renewal alert');
      info = await sendAlertEmail(subject, bodyIntro, false, true);
    } else {
      console.log('[sendAlert] Sending general alert');
      info = await sendAlertEmail(subject, bodyIntro, false, false);
    }
    console.log(`[${new Date().toISOString()}] Alert sent successfully: %s`, info.messageId);
    return info;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to send alert:`, error);
    console.error('[sendAlert] Error stack:', error.stack);
    throw error;
  }
}

async function main() {
    const subject = MAINTENANCE ? "Maintenance" : "Renewals";
    const message = `Domain ${DOMAIN}`;
  
    try {
      await sendAlertWithTimeout(subject, message, MAINTENANCE, RENEWAL);
      console.log('Alert sent successfully');
    } catch (error) {
      console.error('Failed to send alert:', error);
      process.exit(1);
    }
  }
  
main().then(() => process.exit(0));

module.exports = { sendAlertWithTimeout, sendAlert };