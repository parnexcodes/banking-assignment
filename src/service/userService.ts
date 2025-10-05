import { db } from '../utils/database';
import { User, UserRow } from '../model/user';

/**
 * User service - handles authentication-related database operations
 * Only includes methods needed for the authentication middleware
 */
export class UserService {
  /**
   * Find a user by their secret key (used for authentication)
   * @param secretKey - The secret key to search for
   * @returns User object or null if not found
   */
  static async findBySecretKey(secretKey: string): Promise<User | null> {
    try {
      const query = `
        SELECT id, username, secret_key, created_at, updated_at
        FROM users
        WHERE secret_key = ?
        LIMIT 1
      `;
      
      const rows = await db.query<UserRow>(query, [secretKey]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      return {
        id: row.id,
        username: row.username,
        secret_key: row.secret_key,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Error finding user by secret key:', error);
      throw new Error('Failed to find user');
    }
  }
}
