import { pool } from '../config/db.js';

const toDecimal = (value) => Number.parseFloat(value);

const ALLOWED_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

const canRestoreStock = (currentStatus) =>
  currentStatus === 'Pending' || currentStatus === 'Confirmed';

export const placeOrder = async (req, res, next) => {
  const { customer_name, phone, shipping_address } = req.body;

  if (!customer_name || !customer_name.trim()) {
    return res.status(400).json({ error: 'Customer name is required' });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  if (!shipping_address || !shipping_address.trim()) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }

  const userId = req.user.id;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [cartRows] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.id, p.name, p.price, p.stock, p.is_active
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       FOR UPDATE`,
      [userId]
    );

    if (cartRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    for (const row of cartRows) {
      if (row.is_active !== 1) {
        await connection.rollback();
        return res.status(400).json({ error: `${row.name} is no longer available` });
      }
      if (Number.parseInt(row.stock, 10) < Number.parseInt(row.quantity, 10)) {
        await connection.rollback();
        return res.status(400).json({
          error: `Insufficient stock for ${row.name}`,
          available_stock: Number.parseInt(row.stock, 10),
        });
      }
    }

    let totalAmount = 0;
    const orderItems = [];
    for (const row of cartRows) {
      const unitPrice = toDecimal(row.price);
      const qty = Number.parseInt(row.quantity, 10);
      orderItems.push({
        product_id: row.product_id,
        product_name: row.name,
        unit_price: unitPrice,
        quantity: qty,
        line_total: unitPrice * qty,
      });
      totalAmount += unitPrice * qty;
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, customer_name, phone, shipping_address, payment_method, status)
       VALUES (?, ?, ?, ?, ?, 'COD', 'Pending')`,
      [userId, totalAmount, customer_name.trim(), phone.trim(), shipping_address.trim()]
    );
    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.unit_price, item.quantity, item.line_total]
      );
    }

    for (const row of cartRows) {
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [Number.parseInt(row.quantity, 10), row.product_id]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    await connection.commit();

    const [orderRows] = await connection.query(
      `SELECT id, total_amount, customer_name, phone, shipping_address, payment_method, status, created_at
       FROM orders WHERE id = ?`,
      [orderId]
    );

    return res.status(201).json({
      order: orderRows[0],
      items: orderItems,
      message: 'Order placed successfully',
    });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        next(rollbackErr);
        return;
      }
export const getOrder = async (req, res, next) => {
  try {
    const orderId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(orderId) || orderId <= 0) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const isAdmin = req.user.role === 'admin';
    let sql = `SELECT o.id, o.user_id, o.total_amount, o.customer_name, o.phone, o.shipping_address,
                      o.payment_method, o.status, o.created_at, o.updated_at,
                      u.name AS customer_name_full, u.email AS customer_email
               FROM orders o
               JOIN users u ON u.id = o.user_id
               WHERE o.id = ?`;
    const params = [orderId];
    if (!isAdmin) {
      sql += ` AND o.user_id = ?`;
      params.push(req.user.id);
    }

    const [orderRows] = await pool.query(sql, params);
    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [itemRows] = await pool.query(
      `SELECT id, product_id, product_name, unit_price, quantity, line_total
       FROM order_items WHERE order_id = ?
       ORDER BY id`,
      [orderId]
    );

    return res.json({
      order: orderRows[0],
      items: itemRows,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.user_id, o.total_amount, o.customer_name, o.status, o.payment_method, o.created_at,
                      u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    return res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = Number.parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!Number.isFinite(orderId) || orderId <= 0) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    if (!status || !ALLOWED_TRANSITIONS[status]) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [orderRows] = await connection.query(
        'SELECT id, status, stock_restored FROM orders WHERE id = ? FOR UPDATE',
        [orderId]
      );
      if (orderRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = orderRows[0];
      const currentStatus = order.status;
      const allowed = ALLOWED_TRANSITIONS[currentStatus];

      if (!allowed || !allowed.includes(status)) {
        await connection.rollback();
        return res.status(400).json({
          error: `Cannot transition from ${currentStatus} to ${status}`,
        });
      }

      if (status === 'Cancelled' && canRestoreStock(currentStatus) && order.stock_restored === 0) {
        await connection.query(
          `UPDATE products p
           JOIN order_items oi ON oi.product_id = p.id
           SET p.stock = p.stock + oi.quantity
           WHERE oi.order_id = ?`,
          [orderId]
        );
        await connection.query(
          'UPDATE orders SET stock_restored = 1 WHERE id = ?',
          [orderId]
        );
      }

      await connection.query(
        'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, orderId]
      );

      await connection.commit();
      return res.json({ message: `Order status updated to ${status}`, status });
    } catch (err) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackErr) {
          next(rollbackErr);
          return;
        }
      }
      next(err);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  } catch (err) {
    next(err);
  }
};

    }
    next(err);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id, total_amount, customer_name, status, payment_method, created_at
       FROM orders WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
};
