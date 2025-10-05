/**
 * Account model - Schema definitions and interfaces only
 */

export interface Account {
  id: number;
  user_id: number;
  account_number: string;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface AccountRow {
  id: number;
  user_id: number;
  account_number: string;
  balance: number;
  created_at: Date;
  updated_at: Date;
}