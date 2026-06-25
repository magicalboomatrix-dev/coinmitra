import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { MongoClient } from 'mongodb';

async function loadEnv() {
  try {
    const env = await readFile(new URL('../.env', import.meta.url), 'utf8');
    for (const line of env.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index === -1) continue;
      const key = trimmed.slice(0, index);
      const value = trimmed.slice(index + 1);
      process.env[key] = process.env[key] || value;
    }
  } catch {
    // .env is optional when MONGO_DB_URI or MONGO_URI is already set.
  }
}

function hashPassword(password) {
  const iterations = 210000;
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
  return `pbkdf2_sha256:${iterations}:${salt}:${hash}`;
}

async function main() {
  await loadEnv();

  const uri = process.env.MONGO_DB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_DB_URI or MONGO_URI is required.');
  }

  const rl = createInterface({ input, output });

  try {
    const email = (await rl.question('Admin email: ')).trim().toLowerCase();
    const password = await rl.question('Admin password: ');
    const confirmPassword = await rl.question('Confirm password: ');

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db('coinmitra');
    await db.collection('admins').updateOne(
      { email },
      {
        $set: {
          email,
          passwordHash: hashPassword(password),
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    await client.close();
    console.log(`Admin saved: ${email}`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
