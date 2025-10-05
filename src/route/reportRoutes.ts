import { Router } from 'express';
import { ReportController } from '../controller/reportController';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Get summary report
router.get('/summary', 
  asyncHandler(ReportController.getSummaryReport)
);

export default router;