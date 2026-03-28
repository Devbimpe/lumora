/* 
!DEPRECIATED!
This was used for when we were condiering using google drive for image hosting.


Only run this file if the current refresh token is not working!
This file is specifically to get a NEW token. For this you will have to login as the actual lumora account. 

This way of uploading images may not be viable if the reuseable token gained from this file expires often, or requires reauthorization often.
*/



const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';

const credentials = JSON.parse(process.env.GOOGLE_CLOUD_OAUTH_CREDNTIALS);
const { client_id, client_secret, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Generate auth URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline', // key: offline gives you a refresh token
  scope: SCOPES,
});
console.log('Visit this URL to authorize the app:', authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Enter the code from the page here: ', async (code) => {
  rl.close();
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('Refresh token saved for server use:', tokens.refresh_token);
});