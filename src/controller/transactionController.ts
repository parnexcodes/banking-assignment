import { Request, Response } from "express";
import { TransactionService } from "../service/transactionService";
import { AccountService } from "../service/accountService";
import { AppError } from "../middleware/error";

export class TransactionController {
  static async submitTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { source_account_id, destination_account_id } = req.body;

      if (source_account_id) {
        const sourceAccount = await AccountService.findById(source_account_id);
        if (!sourceAccount) {
          throw new AppError("Source account not found", 404);
        }
        if (!req.user || sourceAccount.user_id !== req.user.id) {
          throw new AppError("Unauthorized access to source account", 403);
        }
      }

      if (destination_account_id && req.body.type === 'deposit') {
        const destAccount = await AccountService.findById(destination_account_id);
        if (!destAccount) {
          throw new AppError("Destination account not found", 404);
        }
        if (!req.user || destAccount.user_id !== req.user.id) {
          throw new AppError("Unauthorized access to destination account", 403);
        }
      }

      const transaction = await TransactionService.submitTransaction(req.body);

      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  static async getAccountBalance(req: Request, res: Response): Promise<void> {
    try {
      const accountId = parseInt(req.params.accountId);

      if (isNaN(accountId)) {
        throw new AppError("Invalid account ID", 400);
      }

      const balance = await TransactionService.getAccountBalance(accountId);

      res.json({
        success: true,
        data: {
          account_id: accountId,
          balance: balance,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Account not found") {
          throw new AppError("Account not found", 404);
        }
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

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
