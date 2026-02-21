import { useStatsService } from '../../services/stats.service';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const days = Number(query.days) || 365;

  const service = useStatsService();
  return service.getNetWorthHistory(days);
});
