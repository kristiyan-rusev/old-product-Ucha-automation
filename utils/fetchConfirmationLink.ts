import { google, gmail_v1 } from 'googleapis';

/**
 * Shared by fetchRegistrationConfirmationLink and fetchPasswordResetLink: polls Gmail (API,
 * OAuth2, read-only scope) for an email matching `to:` + a subject keyword, and decodes the
 * real link out of it. Gmail doesn't offer App Passwords for this test account, so IMAP
 * wasn't an option — OAuth2 is. Both email types wrap their real link in a Mandrill
 * click-tracking redirect (https://mandrillapp.com/track/click/<id>/t.ucha.dev?p=<base64>)
 * rather than linking to the real path directly — this decodes that wrapper.
 *
 * Requires GMAIL_OAUTH_CLIENT_ID / GMAIL_OAUTH_CLIENT_SECRET / GMAIL_OAUTH_REFRESH_TOKEN
 * env vars (see scripts/get-gmail-refresh-token.ts to mint the refresh token once).
 */
async function fetchMandrillLinkFromEmail(
  recipientEmail: string,
  subjectKeyword: string,
  { timeoutMs = 30000, pollIntervalMs = 2000 }: { timeoutMs?: number; pollIntervalMs?: number } = {}
): Promise<string> {
  const clientId = process.env.GMAIL_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GMAIL_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'GMAIL_OAUTH_CLIENT_ID / GMAIL_OAUTH_CLIENT_SECRET / GMAIL_OAUTH_REFRESH_TOKEN must be set in .env ' +
        '(run scripts/get-gmail-refresh-token.ts once to mint the refresh token).'
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { data } = await gmail.users.messages.list({
      userId: 'me',
      q: `to:${recipientEmail} subject:${subjectKeyword}`,
      maxResults: 1,
    });

    if (data.messages && data.messages.length > 0) {
      const { data: message } = await gmail.users.messages.get({
        userId: 'me',
        id: data.messages[0].id!,
        format: 'full',
      });
      const link = extractMandrillLink(extractBodyText(message));
      if (link) return link;
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
  throw new Error(`No email matching subject "${subjectKeyword}" found for ${recipientEmail} within ${timeoutMs}ms.`);
}

/** Fetches "Активирай профила си в Уча.се" and returns the real account-activation link. */
export function fetchRegistrationConfirmationLink(
  recipientEmail: string,
  opts?: { timeoutMs?: number; pollIntervalMs?: number }
): Promise<string> {
  return fetchMandrillLinkFromEmail(recipientEmail, 'Активирай', opts);
}

/** Fetches "Създай новата си парола за Уча.се" and returns the real password-reset link. */
export function fetchPasswordResetLink(
  recipientEmail: string,
  opts?: { timeoutMs?: number; pollIntervalMs?: number }
): Promise<string> {
  return fetchMandrillLinkFromEmail(recipientEmail, 'парола', opts);
}

/**
 * Fetches "Потвърди смяната на имейла си в Уча.се" — sent to the *new* address after the
 * SMS step of a login-email change — and returns the real confirmation link. Visiting it
 * finalizes the change and logs the user out (a full identity change), so log back in with
 * the new email afterward to verify it took effect.
 */
export function fetchEmailChangeConfirmationLink(
  recipientEmail: string,
  opts?: { timeoutMs?: number; pollIntervalMs?: number }
): Promise<string> {
  return fetchMandrillLinkFromEmail(recipientEmail, 'смяната', opts);
}

/** Walks the MIME part tree Gmail returns and pulls out the text/plain (or text/html) body. */
function extractBodyText(message: gmail_v1.Schema$Message): string {
  const parts = message.payload?.parts ?? (message.payload ? [message.payload] : []);
  const flat = [...walkParts(parts)];

  const plain = flat.find((part) => part.mimeType === 'text/plain' && part.body?.data);
  if (plain?.body?.data) return Buffer.from(plain.body.data, 'base64url').toString('utf-8');

  const html = flat.find((part) => part.mimeType === 'text/html' && part.body?.data);
  if (html?.body?.data) return Buffer.from(html.body.data, 'base64url').toString('utf-8');

  return '';
}

function* walkParts(parts: gmail_v1.Schema$MessagePart[]): Generator<gmail_v1.Schema$MessagePart> {
  for (const part of parts) {
    if (!part) continue;
    yield part;
    if (part.parts) yield* walkParts(part.parts);
  }
}

function extractMandrillLink(body: string): string | null {
  const match = body.match(/https:\/\/mandrillapp\.com\/track\/click\/\d+\/t\.ucha\.dev\?p=([A-Za-z0-9_-]+)/);
  if (!match) return null;

  const outer = JSON.parse(Buffer.from(match[1], 'base64url').toString('utf-8'));
  const inner = JSON.parse(outer.p);
  return inner.url as string;
}
