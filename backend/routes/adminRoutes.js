import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.get('/stats', authenticate, authorizeAdmin, adminController.getStats);

export default router;
