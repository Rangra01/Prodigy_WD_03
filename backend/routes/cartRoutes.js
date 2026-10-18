import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/authMiddleware.js';
import * as cartController from '../controllers/cartController.js';

const router = Router();

router.get('/', authenticate, cartController.getCart);

router.post(
  '/',
  authenticate,
  [
    body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  ],
  cartController.addToCart
);

router.put(
  '/:productId',
  authenticate,
  [
    param('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  ],
  cartController.updateCartItem
);

router.delete(
  '/:productId',
  authenticate,
  [param('productId').isInt({ min: 1 }).withMessage('Valid product ID is required')],
  cartController.removeCartItem
);

router.delete('/', authenticate, cartController.clearCart);

export default router;
