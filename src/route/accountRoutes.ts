import { Router } from 'express';
import { AccountController } from '../controller/accountController';
import { validate, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Get account balance
router.get('/:accountId/balance', 
  validate(schemas.accountId, 'params'), 
  asyncHandler(AccountController.getAccountBalance)
);

export default router;