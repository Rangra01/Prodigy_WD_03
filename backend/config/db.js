import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'local_store_ecommerce',
  connectionLimit: 10,
  typeCast: (field, next) => {
    if (field.type === 'DECIMAL' || field.type === 'NEWDECIMAL') {
      return field.string() ? field.string() : next();
    }
    return next();
  },
});

export const query = (sql, params) => pool.query(sql, params);

export async function dbHealth() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('SELECT 1');
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err.message };
  } finally {
    if (conn) conn.release();
  }
}
