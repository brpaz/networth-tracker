import type { Page, Route } from '@playwright/test';
import type { Account } from '../../../app/types';

export const mockAccounts: Account[] = [
  {
    id: 1,
    name: 'Main Savings',
    type: 'cash',
    currency: 'EUR',
    currentValue: 10000,
    createdAt: 1700000000,
    updatedAt: 1700000000,
  },
  {
    id: 2,
    name: 'Stock Portfolio',
    type: 'stocks',
    currency: 'EUR',
    currentValue: 25000,
    createdAt: 1700000000,
    updatedAt: 1700000000,
  },
];

type RouteHandler = (route: Route) => Promise<void>;
type MethodHandlers = Partial<Record<string, RouteHandler>>;

function router(handlers: MethodHandlers): RouteHandler {
  return async (route) => {
    const handler = handlers[route.request().method()];
    if (handler) {
      await handler(route);
    } else {
      await route.continue();
    }
  };
}

function accountIdFrom(route: Route): number {
  return Number(route.request().url().split('/api/accounts/')[1]?.split('?')[0]);
}

export async function mockAccountsApi(page: Page, initial: Account[] = []) {
  let store = structuredClone(initial);
  let nextId = initial.length ? Math.max(...initial.map((a) => a.id)) + 1 : 1;

  await page.route(
    '**/api/accounts',
    router({
      GET: async (route) => {
        await route.fulfill({ json: store });
      },
      POST: async (route) => {
        const body = route.request().postDataJSON() as {
          name: string;
          type: string;
          currency: string;
        };
        const account: Account = {
          id: nextId++,
          name: body.name,
          type: body.type,
          currency: body.currency ?? 'EUR',
          currentValue: null,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        };
        store.unshift(account);
        await route.fulfill({ status: 201, json: account });
      },
    }),
  );

  await page.route(
    '**/api/accounts/*',
    router({
      GET: async (route) => {
        const account = store.find((a) => a.id === accountIdFrom(route));
        await route.fulfill(account ? { json: account } : { status: 404 });
      },
      PUT: async (route) => {
        const id = accountIdFrom(route);
        const idx = store.findIndex((a) => a.id === id);
        if (idx === -1) {
          await route.fulfill({ status: 404 });
          return;
        }
        const body = route.request().postDataJSON() as Partial<Account>;
        store[idx] = { ...store[idx], ...body, updatedAt: Math.floor(Date.now() / 1000) };
        await route.fulfill({ json: store[idx] });
      },
      DELETE: async (route) => {
        store = store.filter((a) => a.id !== accountIdFrom(route));
        await route.fulfill({ status: 204, body: '' });
      },
    }),
  );
}
