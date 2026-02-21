import { useStatsService } from '../../services/stats.service';

export default defineEventHandler(async () => {
  const service = useStatsService();
  return service.getByType();
});
