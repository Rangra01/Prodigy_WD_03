import { pool } from '../config/db.js';

const toDecimal = (value) => Number.parseFloat(value);

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT ci.id AS cart_item_id, ci.product_id, ci.quantity, ci.created_at,
              p.id AS product_id, p.name, p.price, p.image_url, p.category, p.stock, p.is_active
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [userId]
    );

    const items = rows.map((row) => {
      const unitPrice = toDecimal(row.price);
      const stock = Number(row.stock);
      const available = row.is_active === 1 && stock > 0;
      const enoughStock = stock >= row.quantity;
      return {
        cart_item_id: row.cart_item_id,
        product_id: row.product_id,
        name: row.name,
        unit_price: unitPrice,
        image_url: row.image_url,
        category: row.category,
        quantity: row.quantity,
        stock,
        is_active: row.is_active === 1,
        available,
        enough_stock: enoughStock,
        line_total: unitPrice * row.quantity,
        created_at: row.created_at,
      };
    });

    const itemTotal = items.reduce((sum, item) => sum + item.line_total, 0);

    return res.json({
      items,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: itemTotal,
    });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const productIdNum = Number.parseInt(productId, 10);
    const quantityNum = Number.parseInt(quantity, 10);

    if (!Number.isFinite(productIdNum) || productIdNum <= 0) {
      return res.status(400).json({ error: 'Valid product ID is required' });
    }
    if (!Number.isFinite(quantityNum) || quantityNum < 1) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, price, stock, is_active FROM products WHERE id = ?',
      [productIdNum]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = rows[0];
    if (product.is_active !== 1) {
      return res.status(400).json({ error: 'Product is not available' });
    }

    const [existing] = await pool.query(
      'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productIdNum]
    );
    const targetQuantity = (existing.length > 0 ? existing[0].quantity : 0) + quantityNum;

    if (Number.parseInt(product.stock, 10) < targetQuantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        available_stock: Number.parseInt(product.stock, 10),
      });
    }

    if (existing.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
        [targetQuantity, userId, productIdNum]
      );
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productIdNum = Number.parseInt(req.params.productId, 10);
    const { quantity } = req.body;
    const quantityNum = Number.parseInt(quantity, 10);

    if (!Number.isFinite(productIdNum) || productIdNum <= 0) {
      return res.status(400).json({ error: 'Valid product ID is required' });
    }
    if (!Number.isFinite(quantityNum) || quantityNum < 1) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    const [itemRows] = await pool.query(
      'SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productIdNum]
    );
    if (itemRows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const [productRows] = await pool.query(
      'SELECT id, name, stock, is_active FROM products WHERE id = ?',
      [productIdNum]
    );
    if (productRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = productRows[0];
    if (product.is_active !== 1) {
      return res.status(400).json({ error: 'Product is not available' });
    }
    if (Number.parseInt(product.stock, 10) < quantityNum) {
      return res.status(400).json({
        error: 'Insufficient stock',
        available_stock: Number.parseInt(product.stock, 10),
      });
    }

    await pool.query(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
      [quantityNum, userId, productIdNum]
    );

    return res.json({ message: 'Cart updated' });
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productIdNum = Number.parseInt(req.params.productId, 10);

    if (!Number.isFinite(productIdNum) || productIdNum <= 0) {
      return res.status(400).json({ error: 'Valid product ID is required' });
    }

    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productIdNum]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    return res.json({ message: 'Removed from cart' });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    return res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productIdNum, quantityNum]
      );
    }

    return res.json({ message: 'Added to cart' });
  } catch (err) {
    next(err);
  }
};
