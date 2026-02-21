import { logger } from '../logger';

export default defineEventHandler((event) => {
  const start = Date.now();
  const { method } = event;
  const url = getRequestURL(event).pathname;

  event.node.res.on('finish', () => {
    const duration = Date.now() - start;
    const status = event.node.res.statusCode;
    logger.info({ method, url, status, duration: `${duration}ms` }, 'request');
  });
});
