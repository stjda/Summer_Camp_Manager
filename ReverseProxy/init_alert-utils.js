// alert_utils.js
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const { config } = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
config({ path: envPath });


async function getLatestLogs(logPath, maxLines = 50) {
  console.log(`[getLatestLogs] Attempting to read log file: ${logPath}`);
  try {
    const data = await fs.readFile(logPath, 'utf8');
    const lines = data.split('\n').filter(Boolean);
    console.log(`[getLatestLogs] Successfully read ${lines.length} lines from ${logPath}`);
    return lines.slice(-maxLines).join('\n');
  } catch (error) {
    console.error(`[getLatestLogs] Error reading log file ${logPath}:`, error);
    if (error.code === 'ENOENT') {
      return `Log file not found at ${logPath}. This might be normal if the server hasn't generated any logs yet.`;
    }
    return `Error reading log file: ${error.message}`;
  }
}

async function createTransporter() {  
  console.log('[createTransporter] Attempting to create email transporter');
  let transporter;
  
  // Try SSL first
  try {
    console.log('[createTransporter] Attempting SSL connection');
    transporter = nodemailer.createTransport({
      host: 'smtp.fastmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: 'guymorganb@levelupco.com',
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, 
      
    });
    
    await transporter.verify();
    console.log('[createTransporter] SSL connection successful');
  } catch (error) {
    console.log("[createTransporter] SSL connection failed, trying STARTTLS...");
    
    // Fallback to STARTTLS
    transporter = nodemailer.createTransport({
      host: 'smtp.fastmail.com',
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: 'guymorganb@levelupco.com',
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers:'SSLv3',
        rejectUnauthorized: false
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
    });
    
    try {
      await transporter.verify();
      console.log('[createTransporter] STARTTLS connection successful');
    } catch (error) {
      console.error("[createTransporter] Both SSL and STARTTLS connections failed:", error);
      throw error;
    }
  }

  return transporter;
}

async function sendAlertEmail(subject, bodyIntro, maintenance, sslRenewal) {
  console.log(`[sendAlertEmail] Starting sendAlertEmail function. Maintenance: ${maintenance}, SSL Renewal: ${sslRenewal}`);
  const transporter = await createTransporter();

  const domain = process.env.DOMAIN || 'Unknown';
  const nodeEnv = process.env.NODE_ENV || 'Unknown';
  const port = process.env.PORT || '3000';
  const secondPort = process.env.HTTPS_PORT || '443';
  const httpPort = process.env.HTTP_PORT || '80';


  const emailBody = `
Message from: ssl-auto-renewal-server
---------------------------------------
${bodyIntro}
---------------------------------------
Please check the following information:

IP Address: ${domain}
Environment: ${nodeEnv}
Ports:
  - Main: ${port}
  - Secondary: ${secondPort}
  - HTTP: ${httpPort}
---------------------------------------
Please investigate and resolve any issues as soon as possible.
`;

  console.log('[sendAlertEmail] Prepared email body');

  try {
    console.log('[sendAlertEmail] Attempting to send email...');
    let info = await transporter.sendMail({
      from: '"Server Alert" <guymorganb@levelupco.com>',
      to: "guymorganb@levelupco.com",
      subject: subject,
      text: emailBody,
    });
    console.log('[sendAlertEmail] Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('[sendAlertEmail] Error sending email:', error);
    console.error('[sendAlertEmail] Error stack:', error.stack);
    throw error;
  }finally {
    // Signal to PM2 that we're done
    if (process.send) {
      process.send('ready');
    }
  }
}

module.exports = {
  sendAlertEmail
};