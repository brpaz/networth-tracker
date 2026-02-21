export const accountTypes = [
  'stocks',
  'cash',
  'crypto',
  'real_estate',
  'bonds',
  'retirement',
  'other',
] as const;

export type AccountType = (typeof accountTypes)[number];

export interface Account {
  id: number;
  name: string;
  type: string;
  currency: string;
  currentValue: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Snapshot {
  id: number;
  accountId: number;
  value: number;
  recordedAt: string;
}
