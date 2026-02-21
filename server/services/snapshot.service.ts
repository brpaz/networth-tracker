import { useSnapshotRepository } from '../repositories/snapshot.repository';
import { useAccountRepository } from '../repositories/account.repository';
import { NotFoundError } from '../errors';

export function useSnapshotService() {
  const snapshotRepo = useSnapshotRepository();
  const accountRepo = useAccountRepository();

  return {
    async recordSnapshot(data: { accountId: number; value: number }) {
      const account = await accountRepo.findById(data.accountId);
      if (!account) {
        throw new NotFoundError('Account not found');
      }

      const snapshot = await snapshotRepo.create(data);
      await accountRepo.touchUpdatedAt(data.accountId);
      return snapshot;
    },

    async getAccountSnapshots(accountId: number, limit = 100) {
      const account = await accountRepo.findById(accountId);
      if (!account) {
        throw new NotFoundError('Account not found');
      }
      return snapshotRepo.findByAccountId(accountId, limit);
    },

    async deleteSnapshot(id: number) {
      const snapshot = await snapshotRepo.findById(id);
      if (!snapshot) {
        throw new NotFoundError('Snapshot not found');
      }
      const deleted = await snapshotRepo.deleteById(id);
      await accountRepo.touchUpdatedAt(snapshot.accountId);
      return deleted;
    },
  };
}
