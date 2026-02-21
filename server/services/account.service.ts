import { useAccountRepository } from '../repositories/account.repository';
import { NotFoundError } from '../errors';

export function useAccountService() {
  const repo = useAccountRepository();

  return {
    async listAccounts() {
      return repo.findAll();
    },

    async getAccount(id: number) {
      const account = await repo.findById(id);
      if (!account) {
        throw new NotFoundError('Account not found');
      }
      return account;
    },

    async createAccount(data: { name: string; type: string; currency: string }) {
      return repo.create(data);
    },

    async updateAccount(
      id: number,
      data: Partial<{ name: string; type: string; currency: string }>,
    ) {
      await this.getAccount(id);
      return repo.update(id, data);
    },

    async deleteAccount(id: number) {
      await this.getAccount(id);
      return repo.delete(id);
    },
  };
}
