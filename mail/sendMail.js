const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config();

console.log('Environment variables check:');
console.log('GOOGLE_CREDENTIALS exists:', !!process.env.GOOGLE_CREDENTIALS);
console.log('GOOGLE_TOKEN exists:', !!process.env.GOOGLE_TOKEN);

let CREDENTIALS, TOKEN;

try {
  if (!process.env.GOOGLE_CREDENTIALS || !process.env.GOOGLE_TOKEN) {
    throw new Error('Missing required environment variables');
  }
  
  // For GOOGLE_CREDENTIALS
  try {
    const rawCredentials = process.env.GOOGLE_CREDENTIALS;
    console.log('CREDENTIALS starts with:', rawCredentials.substring(0, 10));
    
    // Try decoding from Base64
    try {
      const decoded = Buffer.from(rawCredentials, 'base64').toString('utf8');
      console.log('Decoded CREDENTIALS preview:', decoded.substring(0, 30));
      
      try {
        CREDENTIALS = JSON.parse(decoded);
        console.log('Successfully decoded and parsed Base64 GOOGLE_CREDENTIALS');
      } catch (jsonError) {
        console.error('Failed to parse decoded credentials as JSON:', jsonError.message);
        throw new Error('Invalid decoded JSON format');
      }
    } catch (decodeError) {
      console.error('Failed to decode Base64 credentials:', decodeError.message);
      throw new Error('Failed Base64 decoding'); 
    }
  } catch (credError) {
    console.error('Credentials processing error:', credError.message);
    throw new Error('Credentials processing failed');
  }
  
  // For GOOGLE_TOKEN
  try {
    const rawToken = process.env.GOOGLE_TOKEN;
    console.log('TOKEN starts with:', rawToken.substring(0, 10));
    
    // Try decoding from Base64
    try {
      const decoded = Buffer.from(rawToken, 'base64').toString('utf8');
      console.log('Decoded TOKEN preview:', decoded.substring(0, 30));
      
      try {
        TOKEN = JSON.parse(decoded);
        console.log('Successfully decoded and parsed Base64 GOOGLE_TOKEN');
      } catch (jsonError) {
        console.error('Failed to parse decoded token as JSON:', jsonError.message);
        throw new Error('Invalid decoded JSON format');
      }
    } catch (decodeError) {
      console.error('Failed to decode Base64 token:', decodeError.message);
      throw new Error('Failed Base64 decoding');
    }
  } catch (tokenError) {
    console.error('Token processing error:', tokenError.message);
    throw new Error('Token processing failed');
  }
} catch (error) {
  console.error('Error setting up credentials:', error.message);
  process.exit(1);
}

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

async function authorize() {
  const { client_secret, client_id, redirect_uris } = CREDENTIALS.web || CREDENTIALS.installed;

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
