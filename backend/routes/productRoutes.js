import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as productController from '../controllers/productController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('minPrice').optional().isDecimal(),
    query('maxPrice').optional().isDecimal(),
    query('sort').optional().isIn(['asc', 'desc']),
  ],
  productController.listProducts
);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 })],
  productController.getProduct
);

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isDecimal({ min: 0 }).withMessage('Valid price is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('image_url')
      .optional()
      .trim()
      .isURL({ protocols: ['http', 'https'] })
      .withMessage('Image URL must use http or https'),
  ],
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  [param('id').isInt({ min: 1 })],
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  [param('id').isInt({ min: 1 })],
  productController.deactivateProduct
);

export default router;
