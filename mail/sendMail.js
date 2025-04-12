const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config();

console.log('Environment variables check:');
console.log('GOOGLE_CREDENTIALS exists:', !!process.env.GOOGLE_CREDENTIALS);
console.log('GOOGLE_TOKEN exists:', !!process.env.GOOGLE_TOKEN);

let CREDENTIALS, TOKEN;

try {
  if (!process.env.GOOGLE_CREDENTIALS) {
    throw new Error('Missing GOOGLE_CREDENTIALS environment variable');
  }
  
  if (!process.env.GOOGLE_TOKEN) {
    throw new Error('Missing GOOGLE_TOKEN environment variable');
  }
  
  try {
    CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log('Successfully parsed GOOGLE_CREDENTIALS');
  } catch (parseError) {
    console.error('Failed to parse GOOGLE_CREDENTIALS:', parseError.message);
    console.error('Raw value:', process.env.GOOGLE_CREDENTIALS.substring(0, 20) + '...');
    throw new Error('Invalid GOOGLE_CREDENTIALS format');
  }
  
  try {
    TOKEN = JSON.parse(process.env.GOOGLE_TOKEN);
    console.log('Successfully parsed GOOGLE_TOKEN');
  } catch (parseError) {
    console.error('Failed to parse GOOGLE_TOKEN:', parseError.message);
    console.error('Raw value:', process.env.GOOGLE_TOKEN.substring(0, 20) + '...');
    throw new Error('Invalid GOOGLE_TOKEN format');
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
