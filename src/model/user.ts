/**
 * User model - Schema definitions and interfaces only
 */

export interface User {
  id: number;
  username: string;
  secret_key: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  secret_key: string;
}

export interface UpdateUserData {
  username?: string;
  secret_key?: string;
}

export interface UserRow {
  id: number;
  username: string;
  secret_key: string;
  created_at: Date;
  updated_at: Date;
}