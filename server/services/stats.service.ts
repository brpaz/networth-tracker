import { useStatsRepository } from '../repositories/stats.repository';

export function useStatsService() {
  const repo = useStatsRepository();

  return {
    async getNetWorthHistory(days = 365) {
      return repo.getNetWorthHistory(days);
    },

    async getByType() {
      return repo.getByType();
    },
  };
}
