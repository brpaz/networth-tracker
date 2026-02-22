import type { H3Event } from 'h3';
import { useHealthService } from '../services/health.service';

export default defineEventHandler(async (event: H3Event) => {
  const service = useHealthService();
  const response = await service.checkHealth();

  setResponseHeaders(event, {
    'Content-Type': 'application/health+json',
    'Cache-Control': 'max-age=3600',
  });

  setResponseStatus(event, response.status === 'fail' ? 503 : 200);

  return response;
});
