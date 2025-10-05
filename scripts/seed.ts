/**
 * Database Seed Script
 * Populates the database with initial test data
 * Generates random secret keys and saves credentials to seed-data.json
 */

import { config } from "dotenv";
import mysql from "mysql2/promise";
import { randomBytes } from "crypto";
import { writeFileSync } from "fs";
import { join } from "path";

// Load environment variables
config();

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "banking_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

/**
 * Generate a random secret key
 */
function generateSecretKey(): string {
  return randomBytes(32).toString("hex");
}

async function seed() {
  let connection;

  try {
    console.log("Starting database seed...");

    connection = await mysql.createConnection(DB_CONFIG);

    // Check if data already exists
    const [existingUsers] = await connection.execute(
      "SELECT COUNT(*) as count FROM users"
    );
    const [existingAccounts] = await connection.execute(
      "SELECT COUNT(*) as count FROM accounts"
    );
    const [existingTransactions] = await connection.execute(
      "SELECT COUNT(*) as count FROM transactions"
    );

    const userCount = (existingUsers as any)[0].count;
    const accountCount = (existingAccounts as any)[0].count;
    const transactionCount = (existingTransactions as any)[0].count;

    if (userCount > 0 || accountCount > 0 || transactionCount > 0) {
      console.warn("\nWARNING: Database already contains data!");
      console.warn(`   - Users: ${userCount}`);
      console.warn(`   - Accounts: ${accountCount}`);
      console.warn(`   - Transactions: ${transactionCount}`);
      console.warn("\n   This will DELETE all existing data and reseed.");
      console.warn("   Press Ctrl+C within 3 seconds to cancel...\n");
      
      // Give user time to cancel
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Clear existing data (in reverse order due to foreign keys)
    console.log("Clearing existing data...");
    await connection.execute("DELETE FROM transactions");
    await connection.execute("DELETE FROM accounts");
    await connection.execute("DELETE FROM users");

    // Reset auto-increment counters
    await connection.execute("ALTER TABLE transactions AUTO_INCREMENT = 1");
    await connection.execute("ALTER TABLE accounts AUTO_INCREMENT = 1");
    await connection.execute("ALTER TABLE users AUTO_INCREMENT = 1");

    // Generate users with random secret keys
    const testUsers = [
      { username: "alice", secret_key: generateSecretKey() },
      { username: "bob", secret_key: generateSecretKey() },
      { username: "charlie", secret_key: generateSecretKey() },
    ];

    // Insert test users
    console.log("Inserting users...");
    for (const user of testUsers) {
      await connection.execute(
        "INSERT INTO users (username, secret_key) VALUES (?, ?)",
        [user.username, user.secret_key]
      );
    }

    // Insert test accounts (1 user = 1 account)
    console.log("Inserting accounts...");
    const testAccounts = [
      { account_number: "ACC001", user_id: 1, balance: 1000.0 },
      { account_number: "ACC002", user_id: 2, balance: 500.0 },
      { account_number: "ACC003", user_id: 3, balance: 750.0 },
    ];

    for (const account of testAccounts) {
      await connection.execute(
        "INSERT INTO accounts (account_number, user_id, balance) VALUES (?, ?, ?)",
        [account.account_number, account.user_id, account.balance]
      );
    }

    // Verify data
    const [users] = await connection.execute(
      "SELECT COUNT(*) as count FROM users"
    );
    const [accounts] = await connection.execute(
      "SELECT COUNT(*) as count FROM accounts"
    );

    // Save credentials to file
    const seedData = {
      generated_at: new Date().toISOString(),
      users: testUsers.map((user, index) => ({
        id: index + 1,
        username: user.username,
        secret_key: user.secret_key,
      })),
      accounts: testAccounts.map((account) => ({
        account_number: account.account_number,
        user_id: account.user_id,
        username: testUsers[account.user_id - 1].username,
        initial_balance: account.balance,
      })),
    };

    const outputPath = join(__dirname, "seed-data.json");
    writeFileSync(outputPath, JSON.stringify(seedData, null, 2));

    console.log("\nSeed completed successfully!");
    console.log(`   - Users created: ${(users as any)[0].count}`);
    console.log(`   - Accounts created: ${(accounts as any)[0].count}`);
    console.log(`   - Credentials saved to: ${outputPath}`);
    console.log("\nUse these credentials to test the API (from seed-data.json)\n");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run seed if executed directly
if (require.main === module) {
  seed();
}

export default seed;
