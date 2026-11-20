/**
 * Reads the emails t.ucha.dev sends to our test addresses — straight from Mandrill, which
 * sends every email of the site. Needs `MANDRILL_API_KEY` in `.env` (never committed).
 *
 * The key can see other people's emails too, so everything here searches for one exact test
 * address (`full_email:`) — never a partial address, never without one.
 *
 * Usage — announce the email BEFORE the action that sends it, then read it later:
 *
 *   const activation = await expectEmail(email, Emails.activation);
 *   await registrationPage.submit();
 *   // Mandrill takes a while (up to ~40 s) to index a new email — check other things here,
 *   // e.g. that the new account is still a guest without access.
 *   await page.goto(await activation.link());
 *
 * - Only an email sent after `expectEmail()` counts, and of those the newest — never an older
 *   one to the same address.
 * - The search is by recipient AND subject.
 * - `expectEmail()` puts the address on Mandrill's allowlist first (so it can't be rejected)
 *   and takes it off again once the email has been read, so the allowlist doesn't fill up
 *   with one-off test addresses.
 * - If Mandrill rejected or bounced the email, the wait fails at once with Mandrill's reason —
 *   that means emails to test addresses stopped going out, which is a real problem.
 */

const API = process.env.MANDRILL_API_URL ?? 'https://mandrillapp.com/api/1.4';

/** The emails tests read: a word from the subject and the path of the link they carry. */
export const Emails = {
  /** "Активирай профила си в Уча.се" */
  activation: { subject: 'Активирай', link: /\/regconfirm\// },
  /** "Създай новата си парола за Уча.се" */
  passwordReset: { subject: 'парола', link: /\/reset-password\/new\// },
  /** "Потвърди смяната на имейла си в Уча.се" — to the new address; path not pinned yet. */
  emailChange: { subject: 'смяната', link: null },
  /** "Остават ти само 7 дни абонамент за Уча.се" — sent when a subscription ends in 7 days and auto-renewal is off. */
  expiringSubscription7Days: { subject: 'Остават', link: /\/subscription\// },
  /** "Абонаментът ти за Уча.се изтече!" — sent the day a subscription has expired and auto-renewal is off. */
  expiredSubscription: { subject: 'изтече', link: /\/subscription\// },
  /** "Успешно активирахте абонамент за Уча.се за 12 месеца" — sent after a successful card payment (the default card purchase has auto-renewal on). */
  boughtSubscription: { subject: 'активирахте', link: null },
  /** "Неуспешно подновяване на абонамент за Уча.се за 12 месеца" — sent when the automatic renewal can't charge the card (7-days-before variant); its button goes to /profile/subscription/#recurring-section. */
  failedRenewal: { subject: 'Неуспешно', link: /\/profile\/subscription\// },
} satisfies Record<string, EmailKind>;

export type EmailKind = { subject: string; link?: RegExp | null };
export type EmailMessage = { id: string; subject: string; sentAt: Date; text: string; html: string };
type WaitOptions = { timeoutMs?: number; pollIntervalMs?: number };

type SearchItem = {
  _id: string;
  ts: number;
  email: string;
  subject: string;
  state: 'sent' | 'bounced' | 'rejected' | 'queued' | 'scheduled' | 'canceled';
  reject?: { reason?: string } | null;
  diag?: string | null;
  bounce_description?: string;
};

/** Seconds of clock difference between this machine and Mandrill that we tolerate. */
const CLOCK_SLACK_MS = 30_000;

/** Call right before the action that makes the site send the email. */
export async function expectEmail(to: string, kind: EmailKind): Promise<PendingEmail> {
  const since = Date.now() - CLOCK_SLACK_MS;
  await allowlist(to);
  return new PendingEmail(to, kind, since);
}

export class PendingEmail {
  constructor(
    readonly to: string,
    readonly kind: EmailKind,
    private readonly since: number
  ) {}

  /** Waits until the email is in Mandrill and returns it. */
  async received({ timeoutMs = 90_000, pollIntervalMs = 3_000 }: WaitOptions = {}): Promise<EmailMessage> {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const message = await this.peek();
      if (message) {
        if (process.env.EMAIL_DEBUG) console.log(`[mandrill] "${this.kind.subject}" readable after ${Math.round((Date.now() - started) / 1000)} s`);
        await unallowlist(this.to);
        return message;
      }
      await sleep(pollIntervalMs);
    }
    const rejects = await mandrill<{ reason?: string; detail?: string }[]>('rejects/list', { email: this.to }).catch(() => []);
    const onDenylist = rejects.length ? ` The address is on Mandrill's reject list (${rejects.map((r) => r.reason ?? r.detail).join(', ')}).` : '';
    throw new Error(`No "${this.kind.subject}" email to ${this.to} in Mandrill within ${timeoutMs / 1000} s.${onDenylist}`);
  }

  /** Waits for the email and returns its action link (the one matching the kind's path). */
  async link(opts?: WaitOptions): Promise<string> {
    return extractLink(await this.received(opts), this.kind.link ?? null);
  }

  /**
   * For "this must NOT be sent": watches Mandrill for `withinMs` (it can take ~40 s to index a
   * new email, so a single look right after the action proves nothing) and returns whether one
   * turned up.
   */
  async arrivesWithin(withinMs = 60_000): Promise<boolean> {
    const started = Date.now();
    while (Date.now() - started < withinMs) {
      if (await this.newestMatch()) return true;
      await sleep(5_000);
    }
    await unallowlist(this.to);
    return false;
  }

  private async newestMatch(): Promise<SearchItem | undefined> {
    const items = await mandrill<SearchItem[]>('messages/search', {
      query: `full_email:"${this.to}" AND subject:"${this.kind.subject}"`,
      date_from: new Date(this.since - 24 * 3600_000).toISOString().slice(0, 10),
      limit: 100,
    });
    const wanted = this.to.toLowerCase();
    return items
      .filter((m) => m.email?.toLowerCase() === wanted && m.ts * 1000 >= this.since)
      .sort((a, b) => b.ts - a.ts)[0];
  }

  /** One look: the email if it's there and readable, otherwise null. */
  async peek(): Promise<EmailMessage | null> {
    const item = await this.newestMatch();
    if (!item) return null;
    if (item.state === 'rejected' || item.state === 'bounced') {
      const why = item.reject?.reason ?? item.bounce_description ?? item.diag ?? 'no reason given';
      throw new Error(`Mandrill ${item.state} the "${item.subject}" email to ${this.to}: ${why}. Emails to test addresses aren't going out.`);
    }
    // The search entry can show up before the content is stored — Mandrill answers
    // "Unknown_Message" for a little while; that just means "not yet".
    const content = await mandrill<{ subject?: string; text?: string; html?: string }>('messages/content', { id: item._id }).catch(
      (e: Error) => {
        if (/Unknown_Message/.test(e.message)) return null;
        throw e;
      }
    );
    if (!content) return null;
    return { id: item._id, subject: content.subject ?? item.subject, sentAt: new Date(item.ts * 1000), text: content.text ?? '', html: content.html ?? '' };
  }
}

/**
 * The action link in an email. Links come either wrapped in Mandrill click tracking
 * (https://mandrillapp.com/track/click/<id>/t.ucha.dev?p=<base64>, the real URL is inside `p`)
 * or as plain https://t.ucha.dev/… links. With a path, the first link on that path; without
 * one, the first that isn't an asset, the home page or an unsubscribe link.
 */
export function extractLink(message: EmailMessage, path: RegExp | null): string {
  const links: string[] = [];
  for (const body of [message.text, message.html]) {
    if (!body) continue;
    for (const m of body.matchAll(/https:\/\/mandrillapp\.com\/track\/click\/\d+\/t\.ucha\.dev\?p=([A-Za-z0-9_-]+)/g)) {
      const real = decodeClickTracking(m[1]);
      if (real) links.push(real);
    }
    for (const m of body.matchAll(/https:\/\/t\.ucha\.dev\/[^\s"'<>)]*/g)) links.push(m[0].replace(/&amp;/g, '&'));
  }
  const link = links.find((url) => (path ? path.test(url) : !isIncidental(url)));
  if (!link) throw new Error(`No ${path ?? 'action'} link in the "${message.subject}" email (${links.length} t.ucha.dev links seen).`);
  return link;
}

/** The email as plain text — its text part, or its HTML with the tags stripped. */
export function plainText(message: EmailMessage): string {
  if (message.text.trim()) return message.text;
  return message.html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|div|tr|h\d|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]+/g, ' ');
}

/**
 * One look, no waiting, no allowlisting: the newest `kind` email to `to` sent after `since`.
 * For tools like scripts/cleanup-accounts.ts that need an email sent long ago.
 */
export function findEmail(to: string, kind: EmailKind, since: Date): Promise<EmailMessage | null> {
  return new PendingEmail(to, kind, since.getTime()).peek();
}

/** Checks the key works — used by scripts/check-mandrill.ts before a night run. */
export async function checkAccess(): Promise<void> {
  await mandrill('messages/search', { query: 'full_email:"kautotester@gmail.com"', limit: 1 });
}

// ---------------------------------------------------------------- internals

async function mandrill<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const key = process.env.MANDRILL_API_KEY;
  if (!key) throw new Error('MANDRILL_API_KEY is not set in .env');
  const res = await fetch(`${API}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, ...body }),
  });
  const data = (await res.json().catch(() => null)) as any;
  if (!res.ok || data?.status === 'error') {
    throw new Error(`Mandrill ${endpoint} failed (HTTP ${res.status}): ${data?.name ?? ''} ${data?.message ?? ''}`.trim());
  }
  return data as T;
}

/** Best effort: a missing allowlist permission shouldn't fail a test — a rejection will. */
async function allowlist(to: string) {
  await mandrill('allowlists/add', { email: to, comment: 'Ucha QA automation test address' }).catch((e: Error) =>
    console.warn(`[mandrill] couldn't allowlist ${to}: ${e.message}`)
  );
}

async function unallowlist(to: string) {
  await mandrill('allowlists/delete', { email: to }).catch(() => {});
}

function decodeClickTracking(p: string): string | null {
  try {
    return JSON.parse(JSON.parse(Buffer.from(p, 'base64url').toString('utf-8')).p).url as string;
  } catch {
    return null;
  }
}

function isIncidental(url: string): boolean {
  const { pathname } = new URL(url);
  return pathname === '/' || /\.(png|jpe?g|gif|svg|webp|css|js)$/i.test(pathname) || /unsubscribe|otpis|newsletter/i.test(url);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
