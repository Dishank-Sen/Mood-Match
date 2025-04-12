const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config();

const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const TOKEN = JSON.parse(process.env.GOOGLE_TOKEN);

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
