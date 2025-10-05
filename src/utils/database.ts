import mysql from 'mysql2/promise';
import { databaseConfig, DatabaseConfig } from '../config/database';

class DatabaseConnection {
  private pool: mysql.Pool | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig = databaseConfig) {
    this.config = config;
  }

  public async initialize(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        waitForConnections: true,
        connectionLimit: this.config.connectionLimit,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // Test the connection
      const connection = await this.pool.getConnection();
      console.log('Database connected successfully');
      connection.release();
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  public getPool(): mysql.Pool {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  public async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  public async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database connection closed');
    }
  }
}

export const db = new DatabaseConnection();

export { DatabaseConnection };