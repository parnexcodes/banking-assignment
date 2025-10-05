import { db } from '../utils/database';
import { Transaction, CreateTransactionData, TransactionRow, SummaryReport, AccountSummary, FailedTransactionSummary } from '../model/transaction';
import { v4 as uuidv4 } from 'uuid';

/**
 * Transaction service - handles transaction-related database operations
 * Manages deposits, withdrawals, transfers, and transaction reporting
 */
export class TransactionService {
  /**
   * Submit a new transaction (deposit, withdrawal, or transfer)
   * Uses database transactions to ensure data consistency
   * @param data - Transaction data including type, amount, and account IDs
   * @returns The created transaction object
   * @throws Error if database operation fails
   */
  static async submitTransaction(data: CreateTransactionData): Promise<Transaction> {
    const connection = await db.getPool().getConnection();
    
    try {
      await connection.beginTransaction();
      
      const transactionId = uuidv4();
      let status: 'completed' | 'failed' = 'completed';
      let failureReason: string | undefined;
      
      // Validate transaction data
      if (data.amount <= 0) {
        status = 'failed';
        failureReason = 'Negative or zero amount not allowed';
      } else {
        // Process based on transaction type
        switch (data.type) {
          case 'deposit':
            if (!data.destination_account_id) {
              status = 'failed';
              failureReason = 'Destination account required for deposit';
            } else {
              await this.processDeposit(connection, data.destination_account_id, data.amount);
            }
            break;
            
          case 'withdrawal':
            if (!data.source_account_id) {
              status = 'failed';
              failureReason = 'Source account required for withdrawal';
            } else {
              const hasBalance = await this.checkSufficientBalance(connection, data.source_account_id, data.amount);
              if (!hasBalance) {
                status = 'failed';
                failureReason = 'Insufficient funds';
              } else {
                await this.processWithdrawal(connection, data.source_account_id, data.amount);
              }
            }
            break;
            
          case 'transfer':
            if (!data.source_account_id || !data.destination_account_id) {
              status = 'failed';
              failureReason = 'Both source and destination accounts required for transfer';
            } else {
              const hasBalance = await this.checkSufficientBalance(connection, data.source_account_id, data.amount);
              if (!hasBalance) {
                status = 'failed';
                failureReason = 'Insufficient funds';
              } else {
                await this.processTransfer(connection, data.source_account_id, data.destination_account_id, data.amount);
              }
            }
            break;
        }
      }
      
      // Insert transaction record
      const [result] = await connection.execute(
        `INSERT INTO transactions (transaction_id, type, amount, source_account_id, destination_account_id, status, failure_reason) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, data.type, data.amount, data.source_account_id || null, data.destination_account_id || null, status, failureReason || null]
      );
      
      await connection.commit();
      
      // Fetch and return the created transaction
      const [rows] = await connection.execute(
        'SELECT * FROM transactions WHERE transaction_id = ?',
        [transactionId]
      );
      
      const transactionRow = (rows as TransactionRow[])[0];
      return this.mapRowToTransaction(transactionRow);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  /**
   * Get the current balance for a specific account
   * @param accountId - The ID of the account to query
   * @returns The current account balance
   * @throws Error if account not found
   */
  static async getAccountBalance(accountId: number): Promise<number> {
    const [rows] = await db.getPool().execute(
      'SELECT balance FROM accounts WHERE id = ?',
      [accountId]
    );
    
    const accounts = rows as { balance: string }[];
    if (accounts.length === 0) {
      throw new Error('Account not found');
    }
    
    return parseFloat(accounts[0].balance);
  }
  
  /**
   * Generate a comprehensive summary report of all accounts and failed transactions
   * @returns Summary report containing account balances, largest transactions, and failure reasons
   */
  static async getSummaryReport(): Promise<SummaryReport> {
    // Get account summaries
    const [accountRows] = await db.getPool().execute(`
      SELECT 
        a.id as account_id,
        a.account_number,
        u.username,
        a.balance as current_balance,
        COALESCE(MAX(t.amount), 0) as largest_transaction
      FROM accounts a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN transactions t ON (a.id = t.source_account_id OR a.id = t.destination_account_id) 
        AND t.status = 'completed'
      GROUP BY a.id, a.account_number, u.username, a.balance
    `);
    
    const accounts = (accountRows as any[]).map(row => ({
      account_id: row.account_id,
      account_number: row.account_number,
      username: row.username,
      current_balance: parseFloat(row.current_balance),
      largest_transaction: parseFloat(row.largest_transaction)
    }));
    
    // Get failed transaction summaries
    const [failedRows] = await db.getPool().execute(`
      SELECT failure_reason as reason, COUNT(*) as count
      FROM transactions 
      WHERE status = 'failed' AND failure_reason IS NOT NULL
      GROUP BY failure_reason
    `);
    
    const failed_transactions = (failedRows as any[]).map(row => ({
      reason: row.reason,
      count: parseInt(row.count)
    }));
    
    return {
      accounts,
      failed_transactions
    };
  }
  
  /**
   * Check if an account has sufficient balance for a transaction
   * @param connection - Database connection object
   * @param accountId - The account ID to check
   * @param amount - The amount to verify against the balance
   * @returns True if balance is sufficient, false otherwise
   * @private
   */
  private static async checkSufficientBalance(connection: any, accountId: number, amount: number): Promise<boolean> {
    const [rows] = await connection.execute(
      'SELECT balance FROM accounts WHERE id = ?',
      [accountId]
    );
    
    const accounts = rows as { balance: string }[];
    if (accounts.length === 0) {
      return false;
    }
    
    return parseFloat(accounts[0].balance) >= amount;
  }
  
  /**
   * Process a deposit transaction by increasing account balance
   * @param connection - Database connection object
   * @param accountId - The destination account ID
   * @param amount - The amount to deposit
   * @private
   */
  private static async processDeposit(connection: any, accountId: number, amount: number): Promise<void> {
    await connection.execute(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, accountId]
    );
  }
  
  /**
   * Process a withdrawal transaction by decreasing account balance
   * @param connection - Database connection object
   * @param accountId - The source account ID
   * @param amount - The amount to withdraw
   * @private
   */
  private static async processWithdrawal(connection: any, accountId: number, amount: number): Promise<void> {
    await connection.execute(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, accountId]
    );
  }
  
  /**
   * Process a transfer transaction by moving funds between accounts
   * @param connection - Database connection object
   * @param sourceId - The source account ID
   * @param destinationId - The destination account ID
   * @param amount - The amount to transfer
   * @private
   */
  private static async processTransfer(connection: any, sourceId: number, destinationId: number, amount: number): Promise<void> {
    await connection.execute(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, sourceId]
    );
    
    await connection.execute(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, destinationId]
    );
  }
  
  /**
   * Map a database row to a Transaction object
   * @param row - The raw database row
   * @returns Mapped Transaction object with proper types
   * @private
   */
  private static mapRowToTransaction(row: TransactionRow): Transaction {
    return {
      id: row.id,
      transaction_id: row.transaction_id,
      type: row.type as 'deposit' | 'withdrawal' | 'transfer',
      amount: parseFloat(row.amount),
      source_account_id: row.source_account_id,
      destination_account_id: row.destination_account_id,
      status: row.status as 'completed' | 'failed',
      failure_reason: row.failure_reason,
      created_at: row.created_at
    };
  }
}