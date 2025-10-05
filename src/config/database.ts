export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
}

export const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "banking_db",
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10"),
};

export const testDatabaseConfig: DatabaseConfig = {
  ...databaseConfig,
  database: process.env.DB_TEST_NAME || "banking_db_test",
};
