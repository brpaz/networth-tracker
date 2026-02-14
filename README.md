# Net Worth Tracker

A personal net worth tracking application built with Nuxt 4. Track accounts, record value snapshots over time, visualise growth, and simulate compound interest projections.

## Features

- **Account Management** &mdash; Create and manage accounts across types: stocks, cash, crypto, real estate, bonds, retirement, and other.
- **Value History** &mdash; Record total value snapshots per account. Full history is preserved to track evolution over time.
- **Dashboard Charts** &mdash; Net worth evolution line chart and account type breakdown donut chart (Chart.js).
- **Growth Simulator** &mdash; Compound interest calculator with configurable initial amount, yearly rate, and time horizon. Includes projected growth chart.
- **Single-user** &mdash; No authentication required. Data stored locally in SQLite.

## Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Framework       | Nuxt 4, Vue 3                        |
| UI              | Nuxt UI 3, Tailwind CSS 4            |
| Database        | SQLite (better-sqlite3), Drizzle ORM |
| Charts          | Chart.js, vue-chartjs                |
| Validation      | Zod                                  |
| Logging         | Pino, pino-http                      |
| Testing         | Vitest (unit), Playwright (e2e)      |
| Linting         | ESLint, Prettier                     |
| Git Hooks       | Lefthook                             |
| Package Manager | pnpm 10                              |
| Runtime         | Node.js 24                           |

## Project Structure

```
app/                    # Nuxt source directory (srcDir)
  components/           # Vue components (charts)
  composables/          # Composables + co-located unit tests
  layouts/              # App layout (sidebar navigation)
  pages/                # Route pages (dashboard, accounts, simulator)
  types/                # TypeScript type definitions
server/
  api/                  # Nitro API handlers (file-based routing)
  database/             # Schema, migrations, connection
  middleware/           # Request logger
  repositories/         # Data access layer + co-located tests
  services/             # Business logic layer + co-located tests
  utils/                # Validation schemas, logger config
tests/e2e/              # Playwright end-to-end tests
deploy/k8s/             # Kubernetes kustomization manifests
```

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+

Or use [devenv](https://devenv.sh/) for an isolated development environment:

```bash
devenv init
devenv shell
```

### Install & Run

```bash
# Install dependencies
pnpm install

# Generate database migrations
pnpm db:generate

# Run migrations
pnpm tsx server/database/migrate.ts

# Start development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Scripts

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `pnpm dev`          | Start development server                |
| `pnpm build`        | Build for production                    |
| `pnpm preview`      | Preview production build                |
| `pnpm lint`         | Run ESLint                              |
| `pnpm lint:fix`     | Run ESLint with auto-fix                |
| `pnpm format`       | Format with Prettier                    |
| `pnpm format:check` | Check Prettier formatting               |
| `pnpm test`         | Run unit tests (Vitest)                 |
| `pnpm test:watch`   | Run tests in watch mode                 |
| `pnpm test:e2e`     | Run end-to-end tests (Playwright)       |
| `pnpm db:generate`  | Generate Drizzle migrations from schema |
| `pnpm db:migrate`   | Apply migrations with drizzle-kit       |
| `pnpm db:studio`    | Open Drizzle Studio                     |

## API Endpoints

| Method   | Path                          | Description                            |
| -------- | ----------------------------- | -------------------------------------- |
| `GET`    | `/api/accounts`               | List all accounts with current value   |
| `POST`   | `/api/accounts`               | Create account                         |
| `GET`    | `/api/accounts/:id`           | Get account by ID                      |
| `PUT`    | `/api/accounts/:id`           | Update account                         |
| `DELETE` | `/api/accounts/:id`           | Delete account (cascades snapshots)    |
| `GET`    | `/api/accounts/:id/snapshots` | Get value history for account          |
| `POST`   | `/api/snapshots`              | Record a value snapshot                |
| `GET`    | `/api/stats/networth`         | Net worth history (daily totals)       |
| `GET`    | `/api/stats/by-type`          | Current totals grouped by account type |

## Docker

### Build

```bash
docker build \
  --target production \
  --build-arg GIT_REF=$(git rev-parse HEAD) \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg VERSION=1.0.0 \
  -t networth-tracker .
```

### Run

```bash
docker run -p 3000:3000 -v networth-data:/app/data networth-tracker
```

### Migrations (init container)

The Docker image includes a `migrations` stage intended for use as a Kubernetes init container:

```bash
docker build --target migrations -t networth-tracker-migrations .
```

## Kubernetes

Kustomize manifests are provided in `deploy/k8s/`:

```bash
kubectl apply -k deploy/k8s/
```

Resources include: namespace, service account, PVC (SQLite storage), deployment (with init container for migrations), service, and configmap.

## CI/CD

GitHub Actions workflows:

- **ci.yml** &mdash; Lint, test, and Docker build on push/PR. Uses docker-metadata-action for image tagging.
- **release-drafter.yml** &mdash; Automatically drafts release notes from PR labels.
- **release.yml** &mdash; On release publish: generates changelog and commits back to repository.

Dependency updates are managed by [Renovate](https://docs.renovatebot.com/).

## Database

SQLite by default. The Drizzle ORM schema is designed to be portable to PostgreSQL &mdash; switch the dialect in `drizzle.config.ts` and update the connection in `server/database/index.ts`.

The database file is stored at `data/networth.db` (configurable via `DATABASE_URL` environment variable).

## License

Private project.
