const { sendAlertEmail } = require('../util/alert-utils');

async function sendAlert() {
  const domain = process.env.DOMAIN || 'Unknown';
  const subject = `Server Error - ${domain}`;
  const bodyIntro = `The server has encountered an error, and might have shut down...\n ping @ https://${Domain}:3000/health or https://${Domain}/health for quick details.`;

  const info = await sendAlertEmail(subject, bodyIntro);
  console.log("Error alert sent: %s", info.messageId);
}

sendAlert().catch(console.error);