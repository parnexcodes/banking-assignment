/**
 * Database Migration Script
 * Runs all SQL migrations from the migrations directory
 */

import { config } from "dotenv";
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
config();

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true,
};

async function runMigrations() {
  let connection;

  try {
    console.log("Starting database migration...");

    // Connect without specifying a database
    connection = await mysql.createConnection(DB_CONFIG);

    const dbName = process.env.DB_NAME || "banking_db";

    // Check if database already exists and has tables
    try {
      await connection.query(`USE ${dbName}`);
      const [tables] = await connection.query("SHOW TABLES");
      
      if (Array.isArray(tables) && tables.length > 0) {
        console.warn("\nWARNING: Database already exists with tables!");
        console.warn("   Existing tables will be preserved if using 'CREATE TABLE IF NOT EXISTS'");
        console.warn("   Current tables:");
        console.table(tables);
        console.warn("\n   To start fresh, drop the database first:");
        console.warn(`   mysql -u ${DB_CONFIG.user} -p -e "DROP DATABASE ${dbName};"\n`);
      }
    } catch (error: any) {
      if (error.code !== 'ER_BAD_DB_ERROR') {
        throw error;
      }
      // Database doesn't exist yet, which is fine
      console.log("Creating new database...");
    }

    // Read the migration file
    const migrationPath = join(__dirname, "..", "migrations", "001_initial_schema.sql");
    console.log(`Reading migration: ${migrationPath}`);
    
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    // Execute the migration
    console.log("Executing migration...");
    await connection.query(migrationSQL);

    console.log("\n✅ Migration completed successfully!");
    
    // Verify tables were created
    await connection.query(`USE ${dbName}`);
    const [tables] = await connection.query("SHOW TABLES");
    
    console.log("\nDatabase tables:");
    console.table(tables);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run migrations
runMigrations();
