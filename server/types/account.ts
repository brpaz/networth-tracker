import type { accounts, AccountType  } from '../database/schema';

export type Account = typeof accounts.$inferSelect;

export interface AccountWithValue extends Account {
  currentValue: number | null;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency: string;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  currency?: string;
}
