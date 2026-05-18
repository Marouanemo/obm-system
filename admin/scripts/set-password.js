#!/usr/bin/env node
// Generate a bcrypt hash for a given password and print it.
// Usage:
//   node scripts/set-password.js 'YourNewPassword!'
//   (then paste the hash into .env as ADMIN_PASSWORD_HASH=...)
const bcrypt = require('bcryptjs');

const pw = process.argv[2];
if (!pw) {
  console.error('Usage: node scripts/set-password.js <password>');
  process.exit(1);
}
if (pw.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const hash = bcrypt.hashSync(pw, 12);
console.log('\nCopy this line into your admin/.env file:\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
