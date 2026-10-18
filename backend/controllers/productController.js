import { pool } from '../config/db.js';

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parsePositiveDecimal = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const listProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = '1',
      limit = '12',
      show_all,
    } = req.query;

    const isAdmin = req.user && req.user.role === 'admin';
    const canSeeInactive = isAdmin && show_all !== undefined;

    let sql = `SELECT id, name, description, price, image_url, category, stock, is_active, created_at
               FROM products
               WHERE 1=1`;
    const params = [];

    if (!canSeeInactive) {
      sql += ` AND is_active = 1`;
    }

    if (search) {
      sql += ` AND name LIKE ?`;
      params.push(`%${search}%`);
    }

    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }

    const minPriceNum = parsePositiveDecimal(minPrice);
    const maxPriceNum = parsePositiveDecimal(maxPrice);
    if (minPriceNum !== null) {
      sql += ` AND price >= ?`;
      params.push(minPriceNum);
    }
    if (maxPriceNum !== null) {
      sql += ` AND price <= ?`;
      params.push(maxPriceNum);
    }

    const sortOrder = sort === 'desc' ? 'DESC' : 'ASC';
    sql += ` ORDER BY price ${sortOrder}, id DESC`;

    const pageNum = parsePositiveInt(page, 1);
    const limitNum = parsePositiveInt(limit, 12);
    const offset = (pageNum - 1) * limitNum;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const [rows] = await pool.query(sql, params);
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM products WHERE 1=1${canSeeInactive ? '' : ' AND is_active = 1'}${
        search ? ' AND name LIKE ?' : ''
      }${category ? ' AND category = ?' : ''}${
        minPriceNum !== null ? ' AND price >= ?' : ''
      }${maxPriceNum !== null ? ' AND price <= ?' : ''}`,
      params.slice(0, -2)
    );

    return res.json({
      products: rows,
      total: countRows[0].total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const productId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const isAdmin = req.user && req.user.role === 'admin';
    let sql = `SELECT id, name, description, price, image_url, category, stock, is_active, created_at
               FROM products WHERE id = ?`;
    const params = [productId];
    if (!isAdmin) {
      sql += ` AND is_active = 1`;
    }

    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
};
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image_url, category, stock } = req.body;

    const priceNum = Number.parseFloat(price);
    const stockNum = Number.parseInt(stock, 10);

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative integer' });
    }

    let imageUrl = (image_url || '').trim();
    if (imageUrl !== '') {
      try {
        const url = new URL(imageUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return res.status(400).json({ error: 'Image URL must use http or https' });
        }
      } catch (_err) {
        return res.status(400).json({ error: 'Invalid image URL' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category, stock, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name.trim(), description || '', priceNum, imageUrl || null, category.trim(), stockNum]
    );

    const [rows] = await pool.query(
      'SELECT id, name, description, price, image_url, category, stock, is_active FROM products WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({ product: rows[0], message: 'Product created' });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const productId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const { name, description, price, image_url, category, stock, is_active } = req.body;

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (price !== undefined) {
      const priceNum = Number.parseFloat(price);
      if (Number.isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({ error: 'Valid price is required' });
      }
      updates.push('price = ?');
      params.push(priceNum);
    }
    if (image_url !== undefined) {
      let imageUrl = (image_url || '').trim();
      if (imageUrl !== '') {
        try {
          const url = new URL(imageUrl);
          if (!['http:', 'https:'].includes(url.protocol)) {
            return res.status(400).json({ error: 'Image URL must use http or https' });
          }
        } catch (_err) {
          return res.status(400).json({ error: 'Invalid image URL' });
        }
      }
      updates.push('image_url = ?');
      params.push(imageUrl || null);
    }
    if (category !== undefined) {
      if (!category || !category.trim()) {
        return res.status(400).json({ error: 'Category cannot be empty' });
      }
      updates.push('category = ?');
      params.push(category.trim());
    }
    if (stock !== undefined) {
      const stockNum = Number.parseInt(stock, 10);
      if (Number.isNaN(stockNum) || stockNum < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative integer' });
      }
      updates.push('stock = ?');
      params.push(stockNum);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(productId);
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query(
      'SELECT id, name, description, price, image_url, category, stock, is_active FROM products WHERE id = ?',
      [productId]
    );

    return res.json({ product: rows[0], message: 'Product updated' });
  } catch (err) {
    next(err);
  }
};

export const deactivateProduct = async (req, res, next) => {
  try {
    const productId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const [result] = await pool.query(
      'UPDATE products SET is_active = 0 WHERE id = ? AND is_active = 1',
      [productId]
    );

    if (result.affectedRows === 0) {
      const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(400).json({ error: 'Product is already inactive' });
    }

    return res.json({ message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
};

