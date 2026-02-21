# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Build, Lint, Test Commands

### Development

```bash
pnpm dev                  # Start development server (localhost:3000)
pnpm build                # Build for production
pnpm preview              # Preview production build
```

### Linting & Formatting

```bash
pnpm lint                 # Run ESLint
pnpm lint:fix             # Run ESLint with auto-fix
pnpm format               # Format with Prettier
pnpm format:check         # Check formatting without writing
```

### Testing

```bash
pnpm test                          # Run all unit tests with coverage
pnpm test:watch                    # Run tests in watch mode
pnpm vitest run path/to/file.test.ts    # Run single test file
pnpm vitest run -t "test name"          # Run tests matching pattern
pnpm test:e2e                      # Run Playwright e2e tests
```

### Database

```bash
pnpm db:generate           # Generate Drizzle migrations from schema
pnpm db:migrate            # Apply migrations
pnpm db:studio             # Open Drizzle Studio
```

### Docker Compose

```bash
task up                    # Start application with compose
task down                  # Stop containers
task logs                  # View logs
task migrate               # Run migrations in compose
```

## Code Style Guidelines

### Formatting (Prettier)

- Semicolons: always
- Quotes: single
- Trailing commas: always
- Print width: 100
- Tab width: 2

### Imports

- Use `import type` for type-only imports
- Group imports: external first, then internal (relative)
- Example:
  ```typescript
  import { desc, eq, sql } from 'drizzle-orm';
  import { useDatabase } from '../database';
  import { accounts } from '../database/schema';
  ```

### Naming Conventions

- **Files**: kebab-case (e.g., `account.service.ts`, `use-formatters.ts`)
- **Functions**: camelCase (e.g., `useAccountService`, `listAccounts`)
- **Components**: PascalCase (e.g., `AccountTypeChart.vue`)
- **Types/Interfaces**: PascalCase (e.g., `Account`, `AccountType`)
- **Constants**: camelCase for runtime, PascalCase for enum-like (e.g., `accountTypes`)
- **Database tables**: camelCase (e.g., `accounts`, `accountSnapshots`)

### TypeScript

- Strict mode enabled
- Prefer `interface` for object types, `type` for unions/aliases
- Use `as const` for literal arrays that act as enums
- Avoid `any`, `as any`, `@ts-ignore`, `@ts-expect-error`

### Vue Components

- Use `<script setup lang="ts">` syntax
- Props defined with `defineProps<{}>()`
- Computed properties for derived state
- Example structure:

  ```vue
  <script setup lang="ts">
  import { Doughnut } from 'vue-chartjs';

  const props = defineProps<{
    data: Array<{ type: string; total: number }> | null;
  }>();

  const chartData = computed(() => ({ ... }));
  </script>

  <template>...</template>
  ```

### Server Architecture (3-Layer Pattern)

```
API Handler → Service → Repository → Database
```

- **API Handlers** (`server/api/`): Thin wrappers, handle HTTP, delegate to services
- **Services** (`server/services/`): Business logic, validation, orchestration
- **Repositories** (`server/repositories/`): Data access, SQL queries only
- **Database** (`server/database/`): Schema, migrations, connection

### API Handler Pattern

```typescript
import { useAccountService } from '../../services/account.service';

export default defineEventHandler(async () => {
  const service = useAccountService();
  return service.listAccounts();
});
```

### Service Pattern

```typescript
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

### Repository Pattern

```typescript
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

### Error Handling

- Use custom `DomainError` subclasses from `server/errors/`
- `NotFoundError` → 404 response (handled by `defineApiHandler`)
- Throw errors in services, let handlers convert to HTTP errors

### Testing

- **Unit tests**: Co-located with source (e.g., `account.service.test.ts`)
- **Pattern**: `describe('functionName', () => { it('should ...', () => {}) })`
- **Setup**: Use `createTestDatabase()` in `beforeEach`, `closeTestDatabase()` in `afterAll`
- **Mocking**: Mock `../database` to use test database
- Example test setup:

  ```typescript
  import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
  import { createTestDatabase, closeTestDatabase, getTestDatabase } from '../test/setup-db';

  vi.mock('../database', () => ({
    useDatabase: () => getTestDatabase(),
  }));

  beforeEach(() => createTestDatabase());
  afterAll(() => closeTestDatabase());
  ```

### Database Schema

- Define tables in `server/database/schema.ts`
- Use `as const` for enum-like arrays
- SQLite dialect with `sqliteTable`
- Timestamps as integers (`unixepoch()`)

### Composables (Frontend)

- Use `useXxx` naming convention
- Return reactive state and methods as object
- Use `$fetch` for API calls
- Handle loading state with `ref(false)`

### Environment Variables

- `DATABASE_URL` - SQLite file path (default: `file:./data/networth.db`)
- `NODE_ENV` - environment (development/production)
- `PORT` - server port (default: 3000)
- `LOG_LEVEL` - logging verbosity (default: info)
