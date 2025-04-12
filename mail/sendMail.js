const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Load client secrets
const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check for previously stored token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }

  // Get new token if not stored
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
}

function makeBody(to, subject, message) {
  // Use the authenticated user's email here
  const fromEmail = 'dishank_s@me.iir.ac.in';  // Replace with the actual authenticated email address
  const str = [
    `To: ${to}`,
    `From: "Mood Match" <${fromEmail}>`, // Use the correct "From" email address
    `Subject: ${subject}`,
    '',
    message,
  ].join('\n');

  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

async function sendMail(email, subject, message) {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });

  const raw = makeBody(email, subject, message); // Call makeBody with correct parameters

  const res = await gmail.users.messages.send({
    userId: "me", // This will still use the authenticated user's email
    requestBody: {
      raw: raw,
    },
  });

  console.log('Email sent!', res.data);
}

module.exports = sendMail;
