import 'dotenv/config';
import { google } from 'googleapis';
import * as http from 'http';
import { URL } from 'url';

// One-time setup script: mints a long-lived Gmail refresh token for the test account,
// using the OAuth client created in Google Cloud Console. Run with:
//   npx tsx scripts/get-gmail-refresh-token.ts
// then open the printed URL, log in as the test Gmail account, and approve access.
// Paste the resulting refresh token into .env as GMAIL_OAUTH_REFRESH_TOKEN.

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}`;

async function main() {
  const clientId = process.env.GMAIL_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GMAIL_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Set GMAIL_OAUTH_CLIENT_ID / GMAIL_OAUTH_CLIENT_SECRET in .env first.');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
  });

  console.log('\nOpen this URL, log in as the test Gmail account, and approve access:\n');
  console.log(authUrl);
  console.log('\nWaiting for the redirect back to localhost...\n');

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) return;
      const url = new URL(req.url, REDIRECT_URI);
      const authCode = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');

      if (error) {
        res.end(`<h1>Authorization failed</h1><p>${error}</p>You can close this tab.`);
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }
      if (authCode) {
        res.end('<h1>Authorized!</h1>You can close this tab and go back to the terminal.');
        server.close();
        resolve(authCode);
      }
    });
    server.listen(PORT);
  });

  const { tokens } = await oauth2Client.getToken(code);
  console.log('\n=== REFRESH TOKEN (save as GMAIL_OAUTH_REFRESH_TOKEN in .env) ===\n');
  console.log(tokens.refresh_token);
  console.log('\n===================================================================\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
