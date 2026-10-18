import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const REQUIRED = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  console.error('Copy backend/.env.example to backend/.env and fill in your MySQL credentials.');
  process.exit(1);
}

const adminPool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  let conn;
  try {
    conn = await adminPool.getConnection();

    await conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database '${process.env.DB_NAME}' ensured.`);

    const schemaPath = new URL('./database/schema.sql', import.meta.url).pathname;
    const schemaSql = readFileSync(schemaPath, 'utf8');
    const statements = schemaSql.split(';').filter((s) => s.trim() !== '');
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    console.log('Schema applied.');

    await conn.release();
    conn = null;

    const appPool = createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const seedPath = new URL('./database/seed.sql', import.meta.url).pathname;
    const seedSql = readFileSync(seedPath, 'utf8');
    const seedStatements = seedSql.split(';').filter((s) => s.trim() !== '');
    for (const stmt of seedStatements) {
      await appPool.query(stmt);
    }
    console.log('Seed data applied.');

    await appPool.end();
    console.log('Database setup complete.');
  } catch (err) {
    console.error('Database setup failed:', err.message);
    if (conn) conn.release();
    process.exit(1);
  }
}

main();
