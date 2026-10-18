import { pool } from '../config/db.js';

export const getStats = async (_req, res, next) => {
  try {
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
    const [[{ active_products }]] = await pool.query(
      'SELECT COUNT(*) AS active_products FROM products WHERE is_active = 1'
    );
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ pending_orders }]] = await pool.query(
      "SELECT COUNT(*) AS pending_orders FROM orders WHERE status = 'Pending'"
    );
    const [[{ total_customers }]] = await pool.query(
      "SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'"
    );

    return res.json({
      total_products,
      active_products,
      total_orders,
      pending_orders,
      total_customers,
    });
  } catch (err) {
    next(err);
  }
};
