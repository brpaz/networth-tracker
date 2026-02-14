# Net Worth Tracker - Implementation Plan

## Overview

A single-user web application to track total net worth across multiple accounts (stocks, cash, crypto, etc.) with historical evolution graphs and a compound interest growth simulator.

**Tech Stack**: Nuxt 4 + Tailwind CSS 4 + NuxtUI (purple theme) + Drizzle ORM + SQLite + Pino + Docker + GitHub Actions

---

## Architecture

```
networth-tracker/
├── app/                          # Nuxt 4 source (srcDir: 'app/')
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # Tailwind CSS + NuxtUI imports
│   ├── components/
│   │   ├── AccountCard.vue       # Account display card
│   │   ├── AccountForm.vue       # Create/edit account form (modal)
│   │   ├── UpdateValueForm.vue   # Update account value form (modal)
│   │   ├── NetWorthChart.vue     # Total net worth evolution chart
│   │   ├── AccountTypeChart.vue  # Per-type evolution chart
│   │   ├── GrowthSimulator.vue   # Compound interest simulator + chart
│   │   └── AppSidebar.vue        # Dashboard sidebar navigation
│   ├── composables/
│   │   ├── useAccounts.ts        # Account CRUD composable
│   │   ├── useAccounts.test.ts   # Unit test (colocated)
│   │   ├── useFormatters.ts      # Currency/date formatting
│   │   └── useFormatters.test.ts # Unit test (colocated)
│   ├── layouts/
│   │   └── default.vue           # Dashboard layout with sidebar
│   ├── pages/
│   │   ├── index.vue             # Dashboard - net worth overview + chart
│   │   ├── accounts.vue          # Accounts list + management
│   │   └── simulator.vue         # Growth simulator page
│   └── app.vue                   # Root component with UApp wrapper
├── server/
│   ├── api/
│   │   ├── accounts/
│   │   │   ├── index.get.ts      # GET /api/accounts - list all
│   │   │   ├── index.post.ts     # POST /api/accounts - create
│   │   │   ├── [id].get.ts       # GET /api/accounts/:id - get one
│   │   │   ├── [id].put.ts       # PUT /api/accounts/:id - update
│   │   │   ├── [id].delete.ts    # DELETE /api/accounts/:id - delete
│   │   │   └── [id]/
│   │   │       └── snapshots.get.ts  # GET /api/accounts/:id/snapshots
│   │   ├── snapshots/
│   │   │   └── index.post.ts     # POST /api/snapshots - record value
│   │   └── stats/
│   │       ├── networth.get.ts   # GET /api/stats/networth - total + history
│   │       └── by-type.get.ts    # GET /api/stats/by-type - grouped by account type
│   ├── database/
│   │   ├── index.ts              # Database connection (Drizzle + better-sqlite3)
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   └── migrations/           # Drizzle-kit generated migrations
│   ├── repositories/
│   │   ├── account.repository.ts     # Account data access layer
│   │   ├── account.repository.test.ts # Unit test (colocated)
│   │   ├── snapshot.repository.ts    # Snapshot data access layer
│   │   └── snapshot.repository.test.ts # Unit test (colocated)
│   ├── services/
│   │   ├── account.service.ts        # Account business logic
│   │   ├── account.service.test.ts   # Unit test (colocated)
│   │   ├── snapshot.service.ts       # Snapshot business logic
│   │   ├── snapshot.service.test.ts  # Unit test (colocated)
│   │   ├── stats.service.ts          # Stats/aggregation logic
│   │   └── stats.service.test.ts     # Unit test (colocated)
│   ├── middleware/
│   │   └── 0.logger.ts           # Pino request logger middleware
│   └── utils/
│       ├── logger.ts             # Pino logger instance
│       └── validation.ts         # Zod validation schemas
├── deploy/
│   └── k8s/
│       ├── kustomization.yaml    # Kustomize base
│       ├── namespace.yaml        # Namespace definition
│       ├── service-account.yaml  # ServiceAccount
│       ├── pvc.yaml              # PersistentVolumeClaim for SQLite data
│       ├── deployment.yaml       # Deployment manifest (with init container for migrations)
│       ├── service.yaml          # ClusterIP service
│       └── configmap.yaml        # App configuration
├── tests/
│   └── e2e/                      # Playwright E2E tests only
│       ├── accounts.spec.ts
│       └── dashboard.spec.ts
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # Lint + Test + Build pipeline
│   │   ├── release-drafter.yml   # Auto-draft releases on push
│   │   └── release.yml           # On release published: changelog update
│   └── release-drafter.yml       # Release drafter config
├── nuxt.config.ts                # Nuxt configuration
├── app.config.ts                 # Runtime theme config (purple)
├── drizzle.config.ts             # Drizzle-kit configuration
├── package.json                  # PNPM, scripts, dependencies
├── pnpm-lock.yaml
├── tsconfig.json
├── eslint.config.mjs             # ESLint flat config
├── prettier.config.mjs           # Prettier config
├── vitest.config.ts              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
├── lefthook.yml                  # Git hooks (prettier + eslint)
├── renovate.json                 # Renovate dependency management
├── devenv.nix                    # devenv.sh development environment
├── devenv.yaml                   # devenv inputs
├── Dockerfile                    # Multi-stage production build (Node 24)
├── .dockerignore
├── .gitignore
├── .env.example                  # Environment variables template
├── CHANGELOG.md                  # Auto-updated by release workflow
└── README.md
```

---

## Phase 1: Project Scaffolding & Configuration

### 1.1 - Initialize project with PNPM

**package.json**:

```json
{
  "name": "networth-tracker",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.6.2",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "nuxt": "^4.0.0",
    "vue": "^3.5.0",
    "vue-router": "^4.5.0",
    "@nuxt/ui": "^3.0.0",
    "tailwindcss": "^4.0.0",
    "drizzle-orm": "^0.44.0",
    "better-sqlite3": "^11.0.0",
    "pino": "^9.0.0",
    "pino-http": "^10.0.0",
    "vue-chartjs": "^5.3.0",
    "chart.js": "^4.4.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@nuxt/eslint": "^1.0.0",
    "@nuxt/test-utils": "^3.0.0",
    "@types/better-sqlite3": "^7.0.0",
    "drizzle-kit": "^0.31.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0",
    "vitest": "^3.0.0",
    "@playwright/test": "^1.50.0",
    "pino-pretty": "^13.0.0",
    "lefthook": "^1.11.0"
  }
}
```

### 1.2 - Nuxt Configuration

**nuxt.config.ts**:

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  // Nitro server config
  nitro: {
    preset: 'node-server',
  },

  // TypeScript strict mode
  typescript: {
    strict: true,
  },

  // Runtime config
  runtimeConfig: {
    databaseUrl: 'file:./data/networth.db',
  },

  compatibilityDate: '2025-02-14',
})
```

**app.config.ts** (purple theme):

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'purple',
      neutral: 'zinc',
    },
  },
})
```

**app/assets/css/main.css**:

```css
@import 'tailwindcss';
@import '@nuxt/ui';
```

### 1.3 - ESLint & Prettier

**eslint.config.mjs**:

```js
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
  },
})
```

**prettier.config.mjs**:

```js
export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
}
```

---

## Phase 2: Development Environment

### 2.1 - devenv.sh

**devenv.nix**:

```nix
{ pkgs, lib, config, inputs, ... }:

{
  packages = [
    pkgs.nodejs_24
    pkgs.nodePackages.pnpm
    pkgs.lefthook
    pkgs.curl
    pkgs.sqlite
  ];

  enterShell = ''
    echo "networth-tracker dev environment"
    lefthook install
    echo "Node $(node --version) | PNPM $(pnpm --version)"
  '';

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
  };
}
```

Run `devenv init` to generate devenv.yaml.

### 2.2 - Lefthook

**lefthook.yml**:

```yaml
pre-commit:
  parallel: true
  commands:
    prettier:
      glob: '*.{ts,vue,js,mjs,css,json,yaml,yml,md}'
      run: pnpm prettier --write {staged_files}
      stage_fixed: true
    lint:
      glob: '*.{ts,vue,js,mjs}'
      run: pnpm eslint --fix {staged_files}
      stage_fixed: true
```

---

## Phase 3: Database Layer

### 3.1 - Drizzle Schema

**server/database/schema.ts**:

```ts
import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Account types as a union for type safety
export const accountTypes = [
  'stocks',
  'cash',
  'crypto',
  'real_estate',
  'bonds',
  'retirement',
  'other',
] as const

export type AccountType = (typeof accountTypes)[number]

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: accountTypes }).notNull(),
  currency: text('currency').notNull().default('EUR'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const accountSnapshots = sqliteTable('account_snapshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  value: real('value').notNull(),
  recordedAt: integer('recorded_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})
```

> **PostgreSQL switchability**: The schema uses standard SQL types (integer, text, real). To switch to PostgreSQL later:
>
> 1. Change imports from `drizzle-orm/sqlite-core` to `drizzle-orm/pg-core`
> 2. Replace `integer().primaryKey({ autoIncrement: true })` with `serial().primaryKey()`
> 3. Replace `real()` with `numeric()` or `doublePrecision()`
> 4. Replace `integer({ mode: 'timestamp' })` with `timestamp()`
> 5. Update drizzle.config.ts dialect from `sqlite` to `postgresql`
> 6. Update the database connection in `server/database/index.ts`

### 3.2 - Database Connection

**server/database/index.ts**:

```ts
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null

export function useDatabase() {
  if (!_db) {
    const config = useRuntimeConfig()
    const sqlite = new Database(config.databaseUrl.replace('file:', ''))
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    _db = drizzle(sqlite, { schema })
  }
  return _db
}
```

### 3.3 - Drizzle Kit Config

**drizzle.config.ts**:

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./data/networth.db',
  },
})
```

### 3.4 - Migration Strategy

Migrations are **NOT** run automatically on application startup. Instead:

- **Development**: Run `pnpm db:migrate` manually after generating migrations with `pnpm db:generate`
- **Production (Kubernetes)**: An init container runs migrations before the app container starts (see Phase 8)

A standalone migration script is provided at **server/database/migrate.ts**:

```ts
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

const databaseUrl = (process.env.DATABASE_URL || 'file:./data/networth.db').replace('file:', '')
const sqlite = new Database(databaseUrl)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

const db = drizzle(sqlite)
migrate(db, { migrationsFolder: './server/database/migrations' })

console.log('Migrations applied successfully')
sqlite.close()
```

---

## Phase 4: Server API (Repository/Service Pattern)

> **Architecture**: Handlers are thin — they validate input and delegate to services. Services contain business logic and delegate to repositories. Repositories are the only layer that talks to Drizzle/database.
>
> ```
> Handler → Service → Repository → Drizzle DB
> ```

### 4.1 - Request Logger

**server/utils/logger.ts**:

```ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
})
```

**server/middleware/0.logger.ts**:

```ts
import { logger } from '../utils/logger'

export default defineEventHandler((event) => {
  const start = Date.now()
  const { method } = event
  const url = getRequestURL(event).pathname

  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    const status = event.node.res.statusCode
    logger.info({ method, url, status, duration: `${duration}ms` }, 'request')
  })
})
```

### 4.2 - Zod Validation Schemas

**server/utils/validation.ts**:

```ts
import { z } from 'zod'
import { accountTypes } from '../database/schema'

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(accountTypes),
  currency: z.string().length(3).default('EUR'),
})

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(accountTypes).optional(),
  currency: z.string().length(3).optional(),
})

export const createSnapshotSchema = z.object({
  accountId: z.number().int().positive(),
  value: z.number(),
})
```

### 4.3 - Repositories

**server/repositories/account.repository.ts**:

```ts
import { desc, eq, sql } from 'drizzle-orm'
import { useDatabase } from '../database'
import { accounts, accountSnapshots } from '../database/schema'

export function useAccountRepository() {
  const db = useDatabase()

  return {
    async findAll() {
      return db
        .select({
          id: accounts.id,
          name: accounts.name,
          type: accounts.type,
          currency: accounts.currency,
          createdAt: accounts.createdAt,
          updatedAt: accounts.updatedAt,
          currentValue: sql<number>`(
            SELECT ${accountSnapshots.value}
            FROM ${accountSnapshots}
            WHERE ${accountSnapshots.accountId} = ${accounts.id}
            ORDER BY ${accountSnapshots.recordedAt} DESC
            LIMIT 1
          )`.as('current_value'),
        })
        .from(accounts)
        .orderBy(desc(accounts.updatedAt))
    },

    async findById(id: number) {
      return db.select().from(accounts).where(eq(accounts.id, id)).get()
    },

    async create(data: { name: string; type: string; currency: string }) {
      const [account] = await db.insert(accounts).values(data).returning()
      return account
    },

    async update(id: number, data: Partial<{ name: string; type: string; currency: string }>) {
      const [account] = await db
        .update(accounts)
        .set({ ...data, updatedAt: sql`(unixepoch())` })
        .where(eq(accounts.id, id))
        .returning()
      return account
    },

    async delete(id: number) {
      await db.delete(accounts).where(eq(accounts.id, id))
    },

    async touchUpdatedAt(id: number) {
      await db
        .update(accounts)
        .set({ updatedAt: sql`(unixepoch())` })
        .where(eq(accounts.id, id))
    },
  }
}
```

**server/repositories/snapshot.repository.ts**:

```ts
import { desc, eq } from 'drizzle-orm'
import { useDatabase } from '../database'
import { accountSnapshots } from '../database/schema'

export function useSnapshotRepository() {
  const db = useDatabase()

  return {
    async create(data: { accountId: number; value: number }) {
      const [snapshot] = await db.insert(accountSnapshots).values(data).returning()
      return snapshot
    },

    async findByAccountId(accountId: number, limit = 100) {
      return db
        .select()
        .from(accountSnapshots)
        .where(eq(accountSnapshots.accountId, accountId))
        .orderBy(desc(accountSnapshots.recordedAt))
        .limit(limit)
    },
  }
}
```

### 4.4 - Services

**server/services/account.service.ts**:

```ts
import { useAccountRepository } from '../repositories/account.repository'

export function useAccountService() {
  const repo = useAccountRepository()

  return {
    async listAccounts() {
      return repo.findAll()
    },

    async getAccount(id: number) {
      const account = await repo.findById(id)
      if (!account) {
        throw createError({ statusCode: 404, statusMessage: 'Account not found' })
      }
      return account
    },

    async createAccount(data: { name: string; type: string; currency: string }) {
      return repo.create(data)
    },

    async updateAccount(
      id: number,
      data: Partial<{ name: string; type: string; currency: string }>,
    ) {
      await this.getAccount(id) // Ensure exists
      return repo.update(id, data)
    },

    async deleteAccount(id: number) {
      await this.getAccount(id) // Ensure exists
      return repo.delete(id)
    },
  }
}
```

**server/services/snapshot.service.ts**:

```ts
import { useSnapshotRepository } from '../repositories/snapshot.repository'
import { useAccountRepository } from '../repositories/account.repository'

export function useSnapshotService() {
  const snapshotRepo = useSnapshotRepository()
  const accountRepo = useAccountRepository()

  return {
    async recordSnapshot(data: { accountId: number; value: number }) {
      // Verify account exists
      const account = await accountRepo.findById(data.accountId)
      if (!account) {
        throw createError({ statusCode: 404, statusMessage: 'Account not found' })
      }

      const snapshot = await snapshotRepo.create(data)
      await accountRepo.touchUpdatedAt(data.accountId)
      return snapshot
    },

    async getAccountSnapshots(accountId: number, limit = 100) {
      const account = await accountRepo.findById(accountId)
      if (!account) {
        throw createError({ statusCode: 404, statusMessage: 'Account not found' })
      }
      return snapshotRepo.findByAccountId(accountId, limit)
    },
  }
}
```

**server/services/stats.service.ts**:

```ts
import { sql } from 'drizzle-orm'
import { useDatabase } from '../database'
import { accounts, accountSnapshots } from '../database/schema'

export function useStatsService() {
  const db = useDatabase()

  return {
    async getNetWorthHistory(days = 365) {
      return db.all(sql`
        WITH daily_values AS (
          SELECT
            date(${accountSnapshots.recordedAt}, 'unixepoch') as date,
            ${accountSnapshots.accountId} as account_id,
            ${accountSnapshots.value} as value,
            ROW_NUMBER() OVER (
              PARTITION BY ${accountSnapshots.accountId}, date(${accountSnapshots.recordedAt}, 'unixepoch')
              ORDER BY ${accountSnapshots.recordedAt} DESC
            ) as rn
          FROM ${accountSnapshots}
          WHERE ${accountSnapshots.recordedAt} >= unixepoch('now', '-' || ${days} || ' days')
        )
        SELECT date, SUM(value) as total
        FROM daily_values
        WHERE rn = 1
        GROUP BY date
        ORDER BY date ASC
      `)
    },

    async getByType() {
      return db.all(sql`
        SELECT
          ${accounts.type} as type,
          SUM(latest.value) as total
        FROM ${accounts}
        LEFT JOIN (
          SELECT
            ${accountSnapshots.accountId} as account_id,
            ${accountSnapshots.value} as value,
            ROW_NUMBER() OVER (
              PARTITION BY ${accountSnapshots.accountId}
              ORDER BY ${accountSnapshots.recordedAt} DESC
            ) as rn
          FROM ${accountSnapshots}
        ) latest ON latest.account_id = ${accounts.id} AND latest.rn = 1
        GROUP BY ${accounts.type}
      `)
    },
  }
}
```

### 4.5 - API Handlers (thin)

All handlers validate input with Zod and delegate to services. No Drizzle calls in handlers.

**server/api/accounts/index.get.ts**:

```ts
import { useAccountService } from '~/server/services/account.service'

export default defineEventHandler(async () => {
  const service = useAccountService()
  return service.listAccounts()
})
```

**server/api/accounts/index.post.ts**:

```ts
import { useAccountService } from '~/server/services/account.service'
import { createAccountSchema } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = createAccountSchema.parse(body)

  const service = useAccountService()
  const account = await service.createAccount(data)

  setResponseStatus(event, 201)
  return account
})
```

**server/api/snapshots/index.post.ts**:

```ts
import { useSnapshotService } from '~/server/services/snapshot.service'
import { createSnapshotSchema } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = createSnapshotSchema.parse(body)

  const service = useSnapshotService()
  const snapshot = await service.recordSnapshot(data)

  setResponseStatus(event, 201)
  return snapshot
})
```

**server/api/stats/networth.get.ts**:

```ts
import { useStatsService } from '~/server/services/stats.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const days = Number(query.days) || 365

  const service = useStatsService()
  return service.getNetWorthHistory(days)
})
```

**server/api/stats/by-type.get.ts**:

```ts
import { useStatsService } from '~/server/services/stats.service'

export default defineEventHandler(async () => {
  const service = useStatsService()
  return service.getByType()
})
```

Remaining API routes (`[id].get.ts`, `[id].put.ts`, `[id].delete.ts`, `[id]/snapshots.get.ts`) follow the same thin-handler pattern.

---

## Phase 5: Frontend UI

### 5.1 - App Root

**app/app.vue**:

```vue
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
```

### 5.2 - Dashboard Layout

**app/layouts/default.vue**:

```vue
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[][] = [
  [
    {
      label: 'Dashboard',
      icon: 'i-lucide-layout-dashboard',
      to: '/',
    },
    {
      label: 'Accounts',
      icon: 'i-lucide-wallet',
      to: '/accounts',
    },
    {
      label: 'Simulator',
      icon: 'i-lucide-trending-up',
      to: '/simulator',
    },
  ],
]
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible>
      <template #header="{ collapsed }">
        <div v-if="!collapsed" class="flex items-center gap-2">
          <UIcon name="i-lucide-landmark" class="size-5 text-primary" />
          <span class="font-bold text-sm">Net Worth</span>
        </div>
        <UIcon v-else name="i-lucide-landmark" class="size-5 text-primary mx-auto" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu :collapsed="collapsed" :items="items[0]" orientation="vertical" />
      </template>

      <template #footer="{ collapsed }">
        <UColorModeButton v-if="!collapsed" />
        <UColorModeButton v-else class="mx-auto" />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar>
          <template #title>
            <slot name="title" />
          </template>
        </UDashboardNavbar>
      </template>

      <slot />
    </UDashboardPanel>
  </UDashboardGroup>
</template>
```

### 5.3 - Dashboard Page

**app/pages/index.vue**:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: accounts } = await useFetch('/api/accounts')
const { data: networth } = await useFetch('/api/stats/networth')
const { data: byType } = await useFetch('/api/stats/by-type')

const totalNetWorth = computed(() =>
  (accounts.value || []).reduce((sum, a) => sum + (a.currentValue || 0), 0),
)
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Total Net Worth Card -->
    <UCard>
      <div class="text-center">
        <p class="text-sm text-muted">Total Net Worth</p>
        <p class="text-4xl font-bold text-primary">
          {{ useFormatters().formatCurrency(totalNetWorth) }}
        </p>
      </div>
    </UCard>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <h3 class="font-semibold">Net Worth Evolution</h3>
        </template>
        <NetWorthChart :data="networth" />
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold">By Account Type</h3>
        </template>
        <AccountTypeChart :data="byType" />
      </UCard>
    </div>

    <!-- Accounts Summary Table -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">Accounts</h3>
      </template>
      <UTable
        :data="accounts || []"
        :columns="[
          { key: 'name', label: 'Name' },
          { key: 'type', label: 'Type' },
          { key: 'currentValue', label: 'Value' },
          { key: 'currency', label: 'Currency' },
        ]"
      />
    </UCard>
  </div>
</template>
```

### 5.4 - Charts (vue-chartjs)

**app/components/NetWorthChart.vue**:

```vue
<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
)

const props = defineProps<{
  data: Array<{ date: string; total: number }> | null
}>()

const chartData = computed(() => ({
  labels: (props.data || []).map((d) => d.date),
  datasets: [
    {
      label: 'Net Worth',
      data: (props.data || []).map((d) => d.total),
      borderColor: 'rgb(147, 51, 234)', // purple-600
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      fill: true,
      tension: 0.3,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: false,
    },
  },
}
</script>

<template>
  <div class="h-64">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
```

### 5.5 - Growth Simulator

**app/pages/simulator.vue**:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'default' })

const initialAmount = ref(10000)
const yearlyRate = ref(7)
const years = ref(20)

const simulationData = computed(() => {
  const data = []
  let current = initialAmount.value
  for (let i = 0; i <= years.value; i++) {
    data.push({
      year: i,
      value: Math.round(current * 100) / 100,
    })
    current *= 1 + yearlyRate.value / 100
  }
  return data
})

const finalValue = computed(() => simulationData.value[simulationData.value.length - 1]?.value || 0)
const totalGrowth = computed(() => finalValue.value - initialAmount.value)
</script>

<template>
  <div class="p-6 space-y-6">
    <UCard>
      <template #header>
        <h3 class="font-semibold">Growth Simulator</h3>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <UFormField label="Initial Amount">
          <UInputNumber v-model="initialAmount" :min="0" :step="1000" />
        </UFormField>
        <UFormField label="Yearly Rate (%)">
          <UInputNumber v-model="yearlyRate" :min="0" :max="100" :step="0.5" />
        </UFormField>
        <UFormField label="Time (years)">
          <UInputNumber v-model="years" :min="1" :max="50" />
        </UFormField>
      </div>

      <!-- Result cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <UCard variant="subtle">
          <p class="text-xs text-muted">Final Value</p>
          <p class="text-xl font-bold text-primary">
            {{ useFormatters().formatCurrency(finalValue) }}
          </p>
        </UCard>
        <UCard variant="subtle">
          <p class="text-xs text-muted">Total Growth</p>
          <p class="text-xl font-bold text-green-600">
            +{{ useFormatters().formatCurrency(totalGrowth) }}
          </p>
        </UCard>
        <UCard variant="subtle">
          <p class="text-xs text-muted">Growth Multiplier</p>
          <p class="text-xl font-bold">{{ (finalValue / initialAmount).toFixed(2) }}x</p>
        </UCard>
      </div>

      <GrowthSimulatorChart :data="simulationData" />
    </UCard>
  </div>
</template>
```

### 5.6 - Accounts Page

**app/pages/accounts.vue**: Full CRUD with modal forms for create/edit accounts and update values. Uses `UTable`, `UModal`, `UForm`, `UButton`, and toast notifications.

---

## Phase 6: Docker

### 6.1 - Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

# ─── Base ───
FROM node:24-alpine AS base
RUN apk add --no-cache curl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ─── Dependencies ───
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ─── Build ───
FROM deps AS build
COPY . .

ARG GIT_REF="unknown"
ARG BUILD_DATE="unknown"
ARG VERSION="0.0.0"
ARG SOURCE_DATE_EPOCH

ENV GIT_REF=${GIT_REF}
ENV BUILD_DATE=${BUILD_DATE}
ENV VERSION=${VERSION}

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=cache,id=nuxt,target=/app/node_modules/.cache \
    pnpm build

# ─── Migrations (used as init container in k8s) ───
FROM node:24-alpine AS migrations
RUN apk add --no-cache curl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY package.json pnpm-lock.yaml ./
COPY server/database /app/server/database
COPY drizzle.config.ts /app/

CMD ["node", "--import", "tsx", "server/database/migrate.ts"]

# ─── Production ───
FROM node:24-alpine AS production

RUN apk add --no-cache curl

ARG GIT_REF="unknown"
ARG BUILD_DATE="unknown"
ARG VERSION="0.0.0"

LABEL org.opencontainers.image.source="https://github.com/OWNER/networth-tracker"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${GIT_REF}"

ENV NODE_ENV=production
ENV GIT_REF=${GIT_REF}
ENV BUILD_DATE=${BUILD_DATE}
ENV VERSION=${VERSION}

WORKDIR /app

# Copy only the built output
COPY --from=build /app/.output /app/.output

# Create data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", ".output/server/index.mjs"]
```

### 6.2 - .dockerignore

```
node_modules
.nuxt
.output
.git
*.md
tests
.github
deploy
devenv*
.devenv
```

---

## Phase 7: CI/CD

### 7.1 - GitHub Actions CI

**.github/workflows/ci.yml**:

```yaml
name: CI

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run format:check

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run test
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm run test:e2e

  build:
    runs-on: ubuntu-latest
    needs: test
    permissions:
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        if: github.event_name != 'pull_request'
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          build-args: |
            GIT_REF=${{ github.sha }}
            BUILD_DATE=${{ github.event.head_commit.timestamp }}
            VERSION=${{ steps.meta.outputs.version }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 7.2 - Release Drafter

**.github/workflows/release-drafter.yml**:

```yaml
name: Release Drafter

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, reopened, synchronize]

permissions:
  contents: write
  pull-requests: write

jobs:
  update_release_draft:
    runs-on: ubuntu-latest
    steps:
      - uses: release-drafter/release-drafter@v6
        with:
          config-name: release-drafter.yml
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**.github/release-drafter.yml**:

```yaml
name-template: 'v$RESOLVED_VERSION'
tag-template: 'v$RESOLVED_VERSION'
categories:
  - title: 'Features'
    labels: ['feature', 'enhancement']
  - title: 'Bug Fixes'
    labels: ['fix', 'bugfix', 'bug']
  - title: 'Maintenance'
    labels: ['chore', 'dependencies', 'ci']
  - title: 'Documentation'
    labels: ['documentation', 'docs']
change-template: '- $TITLE @$AUTHOR (#$NUMBER)'
change-title-escapes: '\<*_&'
version-resolver:
  major:
    labels: ['major']
  minor:
    labels: ['minor', 'feature', 'enhancement']
  patch:
    labels: ['patch', 'fix', 'bugfix', 'bug', 'chore']
  default: patch
autolabeler:
  - label: 'chore'
    files: ['.github/**', 'devenv*', 'Dockerfile', 'deploy/**']
  - label: 'documentation'
    files: ['*.md']
  - label: 'dependencies'
    files: ['package.json', 'pnpm-lock.yaml']
template: |
  ## Changes

  $CHANGES

  **Full Changelog**: https://github.com/$OWNER/$REPOSITORY/compare/$PREVIOUS_TAG...v$RESOLVED_VERSION
```

### 7.3 - Release Published Workflow (Changelog Only)

**.github/workflows/release.yml**:

```yaml
name: Release

on:
  release:
    types: [published]

permissions:
  contents: write

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: main

      - name: Update Changelog
        uses: stefanzweifel/changelog-updater-action@v1
        with:
          latest-version: ${{ github.event.release.tag_name }}
          release-notes: ${{ github.event.release.body }}

      - name: Commit updated CHANGELOG
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: update CHANGELOG for ${{ github.event.release.tag_name }}'
          file_pattern: CHANGELOG.md
```

> **Note**: Docker builds are handled by ci.yml (triggered on tags `v*`), not release.yml. This keeps release.yml focused on changelog generation and commit-back only.

### 7.4 - Renovate

**renovate.json**:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    ":automergeMinor",
    ":automergeDigest",
    ":automergePatch",
    "schedule:weekly"
  ],
  "packageRules": [
    {
      "matchUpdateTypes": ["major"],
      "automerge": false
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    }
  ],
  "labels": ["dependencies"]
}
```

---

## Phase 8: Kubernetes

### deploy/k8s/kustomization.yaml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: networth-tracker

resources:
  - namespace.yaml
  - service-account.yaml
  - pvc.yaml
  - deployment.yaml
  - service.yaml
  - configmap.yaml
```

### deploy/k8s/namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: networth-tracker
```

### deploy/k8s/service-account.yaml

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: networth-tracker
  labels:
    app: networth-tracker
```

### deploy/k8s/pvc.yaml

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: networth-tracker-data
  labels:
    app: networth-tracker
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

### deploy/k8s/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: networth-tracker
  labels:
    app: networth-tracker
spec:
  replicas: 1
  selector:
    matchLabels:
      app: networth-tracker
  template:
    metadata:
      labels:
        app: networth-tracker
    spec:
      serviceAccountName: networth-tracker
      initContainers:
        - name: migrations
          image: ghcr.io/OWNER/networth-tracker:latest
          command: ['node', '--import', 'tsx', 'server/database/migrate.ts']
          envFrom:
            - configMapRef:
                name: networth-tracker-config
          volumeMounts:
            - name: data
              mountPath: /app/data
      containers:
        - name: app
          image: ghcr.io/OWNER/networth-tracker:latest
          ports:
            - containerPort: 3000
              protocol: TCP
          envFrom:
            - configMapRef:
                name: networth-tracker-config
          volumeMounts:
            - name: data
              mountPath: /app/data
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: networth-tracker-data
```

### deploy/k8s/service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: networth-tracker
spec:
  selector:
    app: networth-tracker
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
  type: ClusterIP
```

### deploy/k8s/configmap.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: networth-tracker-config
data:
  NODE_ENV: 'production'
  DATABASE_URL: 'file:/app/data/networth.db'
  LOG_LEVEL: 'info'
```

---

## Phase 9: Testing

### 9.1 - Vitest Config

**vitest.config.ts**:

```ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    include: [
      'app/**/*.test.ts', // Colocated frontend tests
      'server/**/*.test.ts', // Colocated server tests
    ],
  },
})
```

> **Unit tests are colocated** next to the code under test (e.g., `server/services/account.service.test.ts`). E2E tests remain in `tests/e2e/`.

### 9.2 - Playwright Config

**playwright.config.ts**:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
})
```

---

## Implementation Order

1. **Phase 1**: Scaffold project, install dependencies, configure Nuxt + NuxtUI
2. **Phase 2**: Set up devenv.sh + lefthook
3. **Phase 3**: Database schema + Drizzle config + migrations
4. **Phase 4**: Server API routes + Pino logger
5. **Phase 5**: Frontend pages + components + charts
6. **Phase 6**: Docker multi-stage build
7. **Phase 7**: GitHub Actions + Release Drafter + Renovate
8. **Phase 8**: Kubernetes manifests
9. **Phase 9**: Tests (Vitest + Playwright)

---

## Key Design Decisions

| Decision                        | Rationale                                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SQLite with better-sqlite3**  | Zero-config, embedded, fast for single-user. WAL mode for concurrent reads.                                                                                        |
| **Snapshots model**             | Each value update creates a new snapshot row. Current value = latest snapshot. Full history preserved.                                                             |
| **Repository/Service pattern**  | Handlers are thin (validate + delegate). Services hold business logic. Repositories are the only Drizzle-touching layer. Enables testability and clean separation. |
| **Colocated unit tests**        | `*.test.ts` files live next to the code they test. E2E tests stay in `tests/e2e/`.                                                                                 |
| **Init container migrations**   | Migrations run in a Kubernetes init container, NOT on app startup. Ensures clean separation of deploy concerns.                                                    |
| **vue-chartjs + Chart.js**      | NuxtUI has no chart components. Chart.js is lightweight, widely used, and vue-chartjs provides Vue 3 bindings.                                                     |
| **No auth**                     | Single-user app as specified. Can add later with Nuxt Auth if needed.                                                                                              |
| **Drizzle ORM**                 | Type-safe, lightweight, supports both SQLite and PostgreSQL with similar API.                                                                                      |
| **NuxtUI Dashboard components** | Pre-built sidebar, navbar, panel components for a professional dashboard layout.                                                                                   |
| **Compound interest simulator** | Pure client-side computation, no API needed. Reactive with Vue computed properties.                                                                                |
| **Node 24**                     | Latest LTS, used consistently across devenv.nix, Dockerfile, and GitHub Actions.                                                                                   |
| **docker-metadata-action**      | Standardized Docker image tagging and labeling via `docker/metadata-action@v5`.                                                                                    |
| **PVC for SQLite**              | PersistentVolumeClaim ensures SQLite data survives pod restarts in Kubernetes.                                                                                     |
