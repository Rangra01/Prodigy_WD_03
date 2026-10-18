-- Seed sample products for Local Store E-commerce Platform.
-- Idempotent: safe to re-run; existing products are not duplicated.
-- Run: mysql -u root -p local_store_ecommerce < backend/database/seed.sql

USE local_store_ecommerce;

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Basmati Rice 5kg',
  'Premium long-grain basmati rice, ideal for daily meals.',
  499.00,
  'https://images.unsplash.com/photo-1586201375761-83865001e358?w=400&h=400&fit=crop',
  'Groceries',
  20,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Basmati Rice 5kg');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Whole Wheat Atta 10kg',
  'Freshly milled whole wheat flour for rotis and chapattis.',
  420.00,
  'https://images.unsplash.com/photo-1558560493-3c0500460402?w=400&h=400&fit=crop',
  'Groceries',
  15,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Whole Wheat Atta 10kg');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Toor Dal 1kg',
  'Split pigeon peas, unpolished.',
  110.00,
  'https://images.unsplash.com/photo-1600893916823-f54c3298b7de?w=400&h=400&fit=crop',
  'Groceries',
  25,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Toor Dal 1kg');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Organic Honey 500g',
  'Pure raw honey from local farms.',
  249.00,
  'https://images.unsplash.com/photo-1586822775065-44334e2e3c5a?w=400&h=400&fit=crop',
  'Groceries',
  18,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Organic Honey 500g');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Masala Tea Box (100 bags)',
  'Spiced chai tea blend, strong aroma.',
  180.00,
  'https://images.unsplash.com/photo-1556678492-e292b1a90a02?w=400&h=400&fit=crop',
  'Groceries',
  30,
INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Power Bank 20000mAh',
  'High-capacity portable charger with dual USB output.',
  1499.00,
  'https://images.unsplash.com/photo-1590837717444-32052a5b049c?w=400&h=400&fit=crop',
  'Electronics',
  10,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Power Bank 20000mAh');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Coconut Oil 1L',
  'Cold-pressed coconut oil for cooking and hair care.',
  320.00,
  'https://images.unsplash.com/photo-1624888876715-3a1b7b6f4a6f?w=400&h=400&fit=crop',
  'Personal Care',
  22,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Coconut Oil 1L');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Herbal Shampoo 250ml',
  'Sulphate-free herbal shampoo for all hair types.',
  175.00,
  'https://images.unsplash.com/photo-1609375565067-049759e5e9f4?w=400&h=400&fit=crop',
  'Personal Care',
  16,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Herbal Shampoo 250ml');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Laundry Detergent 5kg',
  'Machine-wash detergent powder with stain removal.',
  349.00,
  'https://images.unsplash.com/photo-1622622869243-4c6b9f69998d?w=400&h=400&fit=crop',
  'Home Essentials',
  14,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Laundry Detergent 5kg');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Cotton Bedsheet Double',
  '100% cotton double bedsheet, solid color.',
  599.00,
  'https://images.unsplash.com/photo-1593044911048-745027079736?w=400&h=400&fit=crop',
  'Home Essentials',
  9,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cotton Bedsheet Double');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'A4 Copy Paper Ream',
  '75 GSM A4 paper, 500 sheets.',
  220.00,
  'https://images.unsplash.com/photo-1583657877243-f2782204902b?w=400&h=400&fit=crop',
  'Stationery',
  35,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'A4 Copy Paper Ream');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Ballpoint Pens (Pack of 10)',
  'Smooth-writing blue ink ballpoint pens.',
  60.00,
  'https://images.unsplash.com/photo-1589094182475-9b769ebd967a?w=400&h=400&fit=crop',
  'Stationery',
  50,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ballpoint Pens (Pack of 10)');

-- One inactive product to demonstrate deactivation
INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Discontinued Item (Sample)',
  'This product is no longer active.',
  99.00,
  NULL,
  'Groceries',
  0,
  0
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Discontinued Item (Sample)');

  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Masala Tea Box (100 bags)');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Wireless Mouse',
  'Ergonomic 2.4 GHz wireless optical mouse.',
  499.00,
  'https://images.unsplash.com/photo-1527864550417-3fd95162d7bd?w=400&h=400&fit=crop',
  'Electronics',
  12,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wireless Mouse');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'USB-C Charging Cable 1m',
  'Fast charging USB-C cable, durable braided nylon.',
  199.00,
  'https://images.unsplash.com/photo-1585337435812-49d490f6f4b0?w=400&h=400&fit=crop',
  'Electronics',
  40,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'USB-C Charging Cable 1m');

INSERT INTO products (name, description, price, image_url, category, stock, is_active)
SELECT * FROM (SELECT
  'Bluetooth Speaker',
  'Portable wireless speaker with deep bass, 10hr playtime.',
  1299.00,
  'https://images.unsplash.com/photo-1608043152269-4239ba54b6ab?w=400&h=400&fit=crop',
  'Electronics',
  8,
  1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bluetooth Speaker');
