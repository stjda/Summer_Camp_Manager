const { sendAlertEmail } = require('../util/alert-utils');

async function sendAlert() {
  const domain = process.env.DOMAIN || 'Unknown';
  const subject = `Server Process Exited - ${domain}`;
  const bodyIntro = `The server process has exited. \n ping @ https://${Domain}:3000/health or https://${Domain}/health for quick details.`;

  const info = await sendAlertEmail(subject, bodyIntro);
  console.log("Exit alert sent: %s", info.messageId);
}

sendAlert().catch(console.error);