import { Request, Response } from "express";
import { TransactionService } from "../service/transactionService";
import { AccountService } from "../service/accountService";
import { AppError } from "../middleware/error";

export class AccountController {
  static async getAccountBalance(req: Request, res: Response): Promise<void> {
    try {
      const accountId = parseInt(req.params.accountId);

      if (isNaN(accountId)) {
        throw new AppError("Invalid account ID", 400);
      }

      // Verify account exists and get account details
      const account = await AccountService.findById(accountId);
      
      if (!account) {
        throw new AppError("Account not found", 404);
      }

      // Authorization check: Verify the authenticated user owns this account
      if (!req.user || account.user_id !== req.user.id) {
        throw new AppError("Unauthorized access to account", 403);
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
}
