import { useAccountRepository } from '../repositories/account.repository';
import { NotFoundError } from '../errors';
import type { CreateAccountInput, UpdateAccountInput } from '../types/account';

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

    async createAccount(data: CreateAccountInput) {
      return repo.create(data);
    },

    async updateAccount(id: number, data: UpdateAccountInput) {
      await this.getAccount(id);
      return repo.update(id, data);
    },

    async deleteAccount(id: number) {
      await this.getAccount(id);
      return repo.delete(id);
    },
  };
}
