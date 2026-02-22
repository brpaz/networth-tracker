import { createApp, toPlainHandler, type EventHandler } from 'h3';

interface CallHandlerOptions {
  path?: string;
  method?: string;
  body?: unknown;
  query?: Record<string, string>;
  routerParams?: Record<string, string>;
}

export async function callHandler(handler: EventHandler, options: CallHandlerOptions = {}) {
  const { path = '/', method = 'GET', body, query, routerParams } = options;

  const app = createApp();
  app.use(path, handler, { match: () => true });

  const plain = toPlainHandler(app);

  let fullPath = path;
  if (query && Object.keys(query).length > 0) {
    const qs = new URLSearchParams(query).toString();
    fullPath = `${path}?${qs}`;
  }

  const headers: Record<string, string> = {};
  let requestBody: string | null = null;
  if (body !== undefined) {
    headers['content-type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await plain({
    method,
    path: fullPath,
    headers,
    body: requestBody,
    context: routerParams ? { params: routerParams } : undefined,
  });

  let responseBody: unknown;
  try {
    responseBody = JSON.parse(response.body as string);
  } catch {
    responseBody = response.body;
  }

  return { status: response.status, body: responseBody };
}
