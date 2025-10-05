import { Router } from 'express';
import accountRoutes from './accountRoutes';
import transactionRoutes from './transactionRoutes';
import reportRoutes from './reportRoutes';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Mount public routes (no authentication required)
router.use('/reports', reportRoutes);

// Apply authentication middleware to protected routes
router.use(authenticateUser);

// Mount protected routes
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);

export default router;