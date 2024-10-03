const { sendAlertEmail } = require('../init_alert-utils');

async function sendAlert() {
  const domain = process.env.DOMAIN || 'Unknown';
  const subject = `Server Setup has updated at - ${domain}`;
  const bodyIntro = `The server has gone through a hot reload. \n ping @ https://${Domain}:3002/health or https://${Domain}/health for quick details.`;

  const info = await sendAlertEmail(subject, bodyIntro);
  console.log("Hot Reload alert sent: %s", info.messageId);
}

sendAlert().catch(console.error);