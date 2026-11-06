import 'dotenv/config';
import { chromium } from '@playwright/test';
import { RegistrationPage } from '../pages/RegistrationPage';
import { users } from '../test-data/credentials';
import { expectEmail, Emails } from '../utils/mandrill';
import { logIn } from '../utils/accounts';

// Makes sure the shared accounts in test-data/credentials.ts exist and can log in; registers
// and activates (through Mandrill) any that don't. Safe to run any time:
//   npx tsx scripts/ensure-shared-accounts.ts
const BASE_URL = 'https://t.ucha.dev';

const register: Record<keyof typeof users, (r: RegistrationPage, email: string, password: string) => Promise<void>> = {
  student: (r, email, password) => r.registerStudent({ username: 'QAStudent', phone: '888123456', email, password, grade: '7', city: 'София' }),
  parent: (r, email, password) =>
    r.registerParent({ username: 'QAParent', phone: '888123456', email, password, profileType: 'student', grade: '7', city: 'София' }),
  teacher: (r, email, password) => r.registerTeacher({ username: 'QATeacher', phone: '888123456', email, password, city: 'София' }),
};

(async () => {
  const browser = await chromium.launch();
  for (const [kind, { email, password }] of Object.entries(users) as [keyof typeof users, { email: string; password: string }][]) {
    const context = await browser.newContext({ baseURL: BASE_URL });
    const page = await context.newPage();
    if (await logIn(page, email, password)) {
      console.log(`${kind.padEnd(8)} OK (exists)  ${email}`);
    } else {
      const registration = new RegistrationPage(page);
      await registration.goto();
      await register[kind](registration, email, password);
      const activation = await expectEmail(email, Emails.activation);
      await registration.submit();
      await page.goto(await activation.link());
      const ok = await logIn(page, email, password);
      console.log(`${kind.padEnd(8)} ${ok ? 'CREATED' : 'FAILED '}      ${email}`);
    }
    await context.close();
  }
  await browser.close();
})();
