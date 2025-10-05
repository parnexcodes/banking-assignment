import { Request, Response } from "express";
import { TransactionService } from "../service/transactionService";
import { AppError } from "../middleware/error";

export class ReportController {
  static async getSummaryReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await TransactionService.getSummaryReport();

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }
}
