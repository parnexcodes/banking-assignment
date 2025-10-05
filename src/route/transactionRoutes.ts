import { Router } from 'express';
import { TransactionController } from '../controller/transactionController';
import { validate, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Submit transaction
router.post('/', 
  validate(schemas.transaction, 'body'), 
  asyncHandler(TransactionController.submitTransaction)
);

export default router;