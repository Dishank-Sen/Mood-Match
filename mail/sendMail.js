const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config();

let CREDENTIALS, TOKEN;

try {
  // For credentials
  if (process.env.GOOGLE_CREDENTIALS_B64) {
    // Decode from Base64
    const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_B64, 'base64').toString();
    CREDENTIALS = JSON.parse(credentialsJson);
  } else if (process.env.GOOGLE_CREDENTIALS) {
    // Fallback to direct JSON parsing
    CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else {
    throw new Error('Missing GOOGLE_CREDENTIALS');
  }
  
  // For token
  if (process.env.GOOGLE_TOKEN_B64) {
    // Decode from Base64
    const tokenJson = Buffer.from(process.env.GOOGLE_TOKEN_B64, 'base64').toString();
    TOKEN = JSON.parse(tokenJson);
  } else if (process.env.GOOGLE_TOKEN) {
    // Fallback to direct JSON parsing
    TOKEN = JSON.parse(process.env.GOOGLE_TOKEN);
  } else {
    throw new Error('Missing GOOGLE_TOKEN');
  }
} catch (error) {
  console.error('Error parsing credentials:', error.message);
  process.exit(1);
}

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

async function authorize() {
  const { client_secret, client_id, redirect_uris } = CREDENTIALS.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  oAuth2Client.setCredentials(TOKEN); // directly use the token from env
  return oAuth2Client;
}

function makeBody(to, subject, message) {
  const fromEmail = 'dishank_s@me.iir.ac.in';
  const str = [
    `To: ${to}`,
    `From: "Mood Match" <${fromEmail}>`,
    `Subject: ${subject}`,
    '',
    message,
  ].join('\n');

  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

async function sendMail(email, subject, message) {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });

  const raw = makeBody(email, subject, message);

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw }
  });

  console.log('✅ Email sent!', res.data);
}

module.exports = sendMail;
