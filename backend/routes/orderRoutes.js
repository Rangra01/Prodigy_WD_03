import { Router } from 'express';
import { param, body } from 'express-validator';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
import * as orderController from '../controllers/orderController.js';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('shipping_address').trim().notEmpty().withMessage('Shipping address is required'),
  ],
  orderController.placeOrder
);

router.get('/my-orders', authenticate, orderController.getMyOrders);
router.get('/orders', authenticate, orderController.getMyOrders);

router.get(
  '/:id',
  authenticate,
  [param('id').isInt({ min: 1 }).withMessage('Invalid order ID')],
  orderController.getOrder
);

router.get('/', authenticate, authorizeAdmin, orderController.getAllOrders);

router.patch(
  '/:id/status',
  authenticate,
  authorizeAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid order ID'),
    body('status').isIn(['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid status'),
  ],
  orderController.updateOrderStatus
);

export default router;
