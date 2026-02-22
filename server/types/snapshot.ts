import type { accountSnapshots } from '../database/schema';

export type Snapshot = typeof accountSnapshots.$inferSelect;

export interface CreateSnapshotInput {
  accountId: number;
  value: number;
}
