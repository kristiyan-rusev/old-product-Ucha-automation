import 'dotenv/config';
import { checkAccess } from '../utils/mandrill';

// Checks that MANDRILL_API_KEY in .env works — the night runner calls this before starting.
// Prints "OK …" and exits 0, or the reason and exits 1. The check searches only for our own
// test address, so it reads nothing else.
checkAccess()
  .then(() => console.log('OK mandrill (key accepted, search works)'))
  .catch((e: Error) => {
    console.log(`FAIL ${e.message}`);
    process.exit(1);
  });
