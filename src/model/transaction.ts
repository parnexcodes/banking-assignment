export interface Transaction {
  id: number;
  transaction_id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  source_account_id?: number;
  destination_account_id?: number;
  status: 'completed' | 'failed';
  failure_reason?: string;
  created_at: Date;
}

export interface CreateTransactionData {
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  source_account_id?: number;
  destination_account_id?: number;
}

export interface TransactionRow {
  id: number;
  transaction_id: string;
  type: string;
  amount: string;
  source_account_id?: number;
  destination_account_id?: number;
  status: string;
  failure_reason?: string;
  created_at: Date;
}

export interface SummaryReport {
  accounts: AccountSummary[];
  failed_transactions: FailedTransactionSummary[];
}

export interface AccountSummary {
  account_id: number;
  account_number: string;
  username: string;
  current_balance: number;
  largest_transaction: number;
}

export interface FailedTransactionSummary {
  reason: string;
  count: number;
}