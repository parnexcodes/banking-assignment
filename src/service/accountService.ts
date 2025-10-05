import { db } from '../utils/database';
import { RowDataPacket } from 'mysql2';
import { Account, AccountRow } from '../model/account';

/**
 * Account service - handles account-related database operations
 * Provides methods for retrieving account information
 */
export class AccountService {
  /**
   * Find account by ID - needed for balance retrieval
   * @param id - The account ID to search for
   * @returns Account object or null if not found
   */
  static async findById(id: number): Promise<Account | null> {
    const sql = `
      SELECT id, user_id, account_number, balance, created_at, updated_at
      FROM accounts
      WHERE id = ?
    `;
    
    const [rows] = await db.getPool().execute<RowDataPacket[]>(sql, [id]);
    
    return rows.length > 0 ? rows[0] as Account : null;
  }

  /**
   * Find account by account number - needed for transaction processing
   * @param accountNumber - The account number to search for
   * @returns Account object or null if not found
   */
  static async findByAccountNumber(accountNumber: string): Promise<Account | null> {
    const sql = `
      SELECT id, user_id, account_number, balance, created_at, updated_at
      FROM accounts
      WHERE account_number = ?
    `;
    
    const [rows] = await db.getPool().execute<RowDataPacket[]>(sql, [accountNumber]);
    
    return rows.length > 0 ? rows[0] as Account : null;
  }
}