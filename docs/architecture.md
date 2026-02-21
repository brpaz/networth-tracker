# Architecture

This document describes the application architecture, folder structure, and design patterns used in Net Worth Tracker.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                     Vue 3 Components                     ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ ││
│  │  │    Pages     │ │  Components  │ │   Composables    │ ││
│  │  └──────────────┘ └──────────────┘ └──────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Nuxt Server (Nitro)                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    API Handlers                          ││
│  │              (/server/api/*)                             ││
│  └──────────────────────┬──────────────────────────────────┘│
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Services                              ││
│  │           Business Logic Layer                           ││
│  │              (/server/services/*)                        ││
│  └──────────────────────┬──────────────────────────────────┘│
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Repositories                            ││
│  │            Data Access Layer                             ││
│  │            (/server/repositories/*)                      ││
│  └──────────────────────┬──────────────────────────────────┘│
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      SQLite Database                         │
│                   (better-sqlite3 + Drizzle)                 │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
networth-tracker/
├── app/                          # Frontend application (Nuxt pages/components)
│   ├── assets/                   # Static assets (CSS, images)
│   │   └── css/
│   │       └── main.css          # Global styles
│   ├── components/               # Vue components
│   │   ├── AccountTypeChart.vue  # Account distribution donut chart
│   │   ├── AppFooter.vue         # Application footer
│   │   ├── GrowthSimulatorChart.vue  # Projection line chart
│   │   └── NetWorthChart.vue     # Net worth evolution chart
│   ├── composables/              # Vue composables (hooks)
│   │   ├── useAccounts.ts        # Account state management
│   │   └── useFormatters.ts      # Number/date formatting utilities
│   ├── layouts/                  # Nuxt layouts
│   │   └── default.vue           # Default layout with header/footer
│   ├── middleware/               # Nuxt middleware
│   ├── pages/                    # File-based routing
│   │   ├── index.vue             # Dashboard page
│   │   ├── simulator.vue         # Growth simulator
│   │   └── accounts/
│   │       ├── index.vue         # Accounts list
│   │       └── [id].vue          # Account detail/edit
│   ├── plugins/                  # Nuxt plugins
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   ├── app.config.ts             # App configuration
│   └── app.vue                   # Root component
│
├── server/                       # Backend (Nitro server)
│   ├── api/                      # API routes (file-based)
│   │   ├── health.get.ts         # Health check endpoint
│   │   ├── accounts/             # Account endpoints
│   │   │   ├── index.get.ts      # GET /api/accounts
│   │   │   ├── index.post.ts     # POST /api/accounts
│   │   │   └── [id].get.ts       # GET /api/accounts/:id
│   │   │   └── [id].put.ts       # PUT /api/accounts/:id
│   │   │   └── [id].delete.ts    # DELETE /api/accounts/:id
│   │   │   └── snapshots.get.ts  # GET /api/accounts/:id/snapshots
│   │   ├── snapshots/            # Snapshot endpoints
│   │   │   ├── index.post.ts     # POST /api/snapshots
│   │   │   └── [id].delete.ts    # DELETE /api/snapshots/:id
│   │   └── stats/                # Statistics endpoints
│   │       ├── networth.get.ts   # GET /api/stats/networth
│   │       └── by-type.get.ts    # GET /api/stats/by-type
│   │
│   ├── database/                 # Database layer
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   ├── migrations/           # Generated migrations
│   │   ├── index.ts              # Database connection
│   │   └── migrate.ts            # Migration runner
│   │
│   ├── services/                 # Business logic layer
│   │   ├── account.service.ts    # Account operations
│   │   ├── snapshot.service.ts   # Snapshot operations
│   │   └── stats.service.ts      # Statistics calculations
│   │
│   ├── repositories/             # Data access layer
│   │   ├── account.repository.ts # Account CRUD operations
│   │   └── snapshot.repository.ts # Snapshot CRUD operations
│   │
│   ├── errors/                   # Custom error classes
│   │   └── index.ts              # DomainError, NotFoundError
│   │
│   ├── handlers/                 # Request/response handlers
│   ├── logger/                   # Logging utilities
│   │   └── index.ts              # Pino logger setup
│   │
│   ├── middleware/               # Server middleware
│   │   └── 0.logger.ts           # Request logging middleware
│   │
│   └── test/                     # Test utilities
│       └── setup-db.ts           # Test database setup
│
├── tests/                        # Test files
│   └── e2e/                      # End-to-end tests (Playwright)
│
├── shared/                       # Shared code (client + server)
│
├── deploy/                       # Deployment configurations
│   ├── docker/                   # Docker files
│   │   └── docker-entrypoint.sh  # Container entrypoint
│   └── kustomize/                # Kubernetes Kustomize manifests
│
├── .github/                      # GitHub configuration
│   ├── workflows/                # GitHub Actions workflows
│   │   ├── ci.yml                # CI pipeline
│   │   ├── release.yml           # Release automation
│   │   └── pr-checker.yml        # PR validation
│   ├── labels.yml                # Issue/PR labels
│   └── release-drafter.yml       # Release drafter config
│
├── scripts/                      # Utility scripts
│   └── ci/                       # CI scripts
│       └── smoke-tests.sh        # Smoke test runner
│
├── reports/                      # Test and coverage reports
│
├── docs/                         # Documentation
│
├── .devenv/                      # devenv cache
├── .nuxt/                        # Nuxt build output
├── .output/                      # Production build
├── data/                         # SQLite database files
│
├── nuxt.config.ts                # Nuxt configuration
├── drizzle.config.ts             # Drizzle configuration
├── vitest.config.ts              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
├── eslint.config.mjs             # ESLint configuration
├── prettier.config.mjs           # Prettier configuration
├── lefthook.yml                  # Git hooks configuration
├── Taskfile.yml                  # Task runner commands
├── compose.yaml                  # Docker Compose (dev)
├── compose.ci.yml                # Docker Compose (CI)
├── Dockerfile                    # Multi-stage Docker build
├── devenv.nix                    # devenv configuration
├── devenv.yaml                   # devenv inputs
├── renovate.json                 # Renovate configuration
└── package.json                  # Project dependencies
```

## Design Patterns

### Three-Layer Backend Architecture

The backend follows a strict three-layer pattern for separation of concerns:

```
API Handler → Service → Repository → Database
```

#### 1. API Handlers (`server/api/`)

Thin wrappers that handle HTTP concerns and delegate to services.

```typescript
// server/api/accounts/index.get.ts
import { useAccountService } from '../../services/account.service';

export default defineEventHandler(async () => {
  const service = useAccountService();
  return service.listAccounts();
});
```

**Responsibilities:**

- Parse request parameters and body
- Call service methods
- Return HTTP responses
- Handle HTTP-level errors

#### 2. Services (`server/services/`)

Business logic layer that orchestrates operations.

```typescript
// server/services/account.service.ts
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
  };
}
```

**Responsibilities:**

- Business rules and validation
- Orchestration of multiple repositories
- Error handling with domain errors
- Data transformation

#### 3. Repositories (`server/repositories/`)

Data access layer that encapsulates SQL operations.

```typescript
// server/repositories/account.repository.ts
export function useAccountRepository() {
  const db = useDatabase();

  return {
    async findAll() {
      return db.select().from(accounts).orderBy(desc(accounts.updatedAt));
    },
    async findById(id: number) {
      return db.select().from(accounts).where(eq(accounts.id, id)).get();
    },
  };
}
```

**Responsibilities:**

- Execute SQL queries via Drizzle ORM
- Map database rows to domain objects
- No business logic

### Error Handling

Custom error classes provide consistent error handling:

```typescript
// server/errors/index.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

Services throw domain errors, which are converted to appropriate HTTP status codes by the framework.

### Composables Pattern (Frontend)

Vue composables encapsulate reactive state and API calls:

```typescript
// app/composables/useAccounts.ts
export function useAccounts() {
  const accounts = ref<Account[]>([]);
  const loading = ref(false);

  async function fetchAccounts() {
    loading.value = true;
    try {
      accounts.value = await $fetch<Account[]>('/api/accounts');
    } finally {
      loading.value = false;
    }
  }

  return { accounts, loading, fetchAccounts };
}
```

### Database Schema

Single source of truth for database structure:

```typescript
// server/database/schema.ts
export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: accountTypes }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});
```

## Testing Strategy

### Unit Tests

- Co-located with source files (`.test.ts` suffix)
- Test database setup via `createTestDatabase()`
- Mock database module for isolation

### E2E Tests

- Located in `tests/e2e/`
- Playwright for browser automation
- Tests run against development server

## Configuration

### Environment Variables

| Variable       | Default                   | Description          |
| -------------- | ------------------------- | -------------------- |
| `DATABASE_URL` | `file:./data/networth.db` | SQLite database path |
| `NODE_ENV`     | `development`             | Environment mode     |
| `PORT`         | `3000`                    | Server port          |
| `LOG_LEVEL`    | `info`                    | Logging verbosity    |

### Runtime Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    databaseUrl: 'file:./data/networth.db',
    public: {
      version: process.env.VERSION || 'dev',
      gitRef: process.env.GIT_REF || '',
    },
  },
});
```
