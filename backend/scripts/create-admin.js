import { pool } from '../config/db.js';

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('Usage: ADMIN_NAME=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create-admin');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('ADMIN_PASSWORD must be at least 6 characters');
    process.exit(1);
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log(`Admin account already exists for ${email}. Refusing to create a duplicate.`);
      process.exit(0);
    }

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), passwordHash, 'admin']
    );

    console.log(`Admin account created successfully (id: ${result.insertId}, email: ${email}).`);
    console.log('You can now log in at the admin dashboard.');
  } catch (err) {
    console.error('Failed to create admin account:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
