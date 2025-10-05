-- Banking Transaction API - Initial Schema Migration
-- This script creates the initial database schema for the banking system
-- Note: Seed data is in scripts/seed.ts

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS banking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banking_system;

-- Users Table
-- Stores user authentication information
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_secret_key (secret_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Accounts Table
-- Stores account information and balances
CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_account_number (account_number),
    INDEX idx_user_id (user_id),
    
    -- Ensure balance cannot be negative for basic accounts
    CONSTRAINT chk_balance_non_negative CHECK (balance >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
-- Stores all transaction records (successful and failed)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(36) UNIQUE NOT NULL,
    type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    source_account_id BIGINT NULL,
    destination_account_id BIGINT NULL,
    status ENUM('completed', 'failed') NOT NULL,
    failure_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (source_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (destination_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_source_account (source_account_id),
    INDEX idx_destination_account (destination_account_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status),
    INDEX idx_type (type)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show created tables
SHOW TABLES;