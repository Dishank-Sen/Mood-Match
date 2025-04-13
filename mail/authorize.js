const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// SCOPES determines what access you want — for sending email use Gmail send scope
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content));
});

function authorize(credentials) {
  // Check if we have web or installed credentials
  const config = credentials.web || credentials.installed;
  
  if (!config) {
    console.error('❌ Invalid credentials format - missing both web and installed properties');
    return;
  }
  
  const { client_secret, client_id, redirect_uris } = config;
  
  // Make sure to use the appropriate redirect URI from your credentials
  const redirectUri = redirect_uris[0]; // This should match exactly what's in the Google Console
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
  );

  // Check if we already have a token
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client);
    oAuth2Client.setCredentials(JSON.parse(token));
    console.log('✅ Token already exists and is loaded.');
  });
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force prompt to ensure you get a refresh token
    scope: SCOPES,
  });
  console.log('🔑 Authorize this app by visiting this url:\n', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\nPaste the code from the browser here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code.trim(), (err, token) => { // Trim the code to remove any whitespace
      if (err) {
        console.error('❌ Error retrieving access token', err);
        return;
      }
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error('❌ Error saving token', err);
        console.log('✅ Token stored to', TOKEN_PATH);
      });
    });
  });
}