# Development Environment Setup

This guide covers setting up a complete development environment for the Net Worth Tracker project.

## Prerequisites

### Required Software

| Software                                            | Purpose                         | Installation                         |
| --------------------------------------------------- | ------------------------------- | ------------------------------------ |
| [Nix](https://nixos.org/download.html)              | Package manager for devenv      | Follow official guide                |
| [devenv](https://devenv.sh/getting-started/)        | Development environment manager | `nix profile install nixpkgs#devenv` |
| [direnv](https://direnv.net/docs/installation.html) | Auto-load environments          | Optional but recommended             |

### System Requirements

- Linux or macOS
- x86_64 or ARM64 architecture
- ~4GB disk space (for Nix store)

## Quick Start

### Option 1: Using devenv (Recommended)

The project provides a fully reproducible development environment via [devenv](https://devenv.sh/).

```bash
# Clone the repository
git clone https://github.com/brpaz/networth-tracker.git
cd networth-tracker

# Enter the development shell
devenv shell
```

On first entry, devenv will automatically:

1. Provision Node.js 24 and pnpm 10
2. Install Playwright browsers (via Nix)
3. Install project dependencies (`pnpm install`)
4. Set up git hooks via Lefthook
5. Create `.env` from `.env.example` if not present

### Option 2: Using direnv (Automatic)

If you have [direnv](https://direnv.net/) installed, the environment loads automatically when you enter the project directory:

```bash
# Allow direnv for this project
direnv allow
```

### Option 3: Manual Setup

If you prefer to manage dependencies manually:

```bash
# Ensure Node.js 24 and pnpm are installed
node --version  # Should be v24.x
pnpm --version  # Should be 10.x

# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install --with-deps chromium

# Create environment file
cp .env.example .env
```

## Development Server

```bash
# Start development server
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Hot Reload

Nuxt provides hot module replacement (HMR) for both frontend and server code:

- Changes to Vue components update instantly
- Changes to server API routes restart automatically
- Changes to database schema require migration

## Database Management

### SQLite Database

The application uses SQLite for data storage. The database file is located at `data/networth.db` by default.

### Drizzle ORM

This project uses [Drizzle ORM](https://orm.drizzle.team/) for type-safe database access.

#### Database Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

#### Schema Modification Workflow

1. Edit `server/database/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Review the generated migration in `server/database/migrations/`
4. Apply migration: `pnpm db:migrate`

### Drizzle Studio

Visual database explorer available at [https://local.drizzle.studio](https://local.drizzle.studio) when running `pnpm db:studio`.

## Code Quality Tools

### Linting

```bash
# Run ESLint
pnpm lint

# Auto-fix linting issues
pnpm lint:fix
```

### Formatting

```bash
# Format code with Prettier
pnpm format

# Check formatting without writing
pnpm format:check
```

### Git Hooks

Git hooks are managed by [Lefthook](https://github.com/evilmartians/lefthook) and run automatically:

| Hook         | Commands                                         |
| ------------ | ------------------------------------------------ |
| `pre-commit` | ESLint (auto-fix), Prettier (auto-format)        |
| `commit-msg` | Runs commitlint and checks commit message format |

Configuration file: [lefthook.yml](../lefthook.yml)

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run single test file
pnpm vitest run server/services/account.service.test.ts

# Run tests matching pattern
pnpm vitest run -t "should create account"
```

### Code Coverage

Coverage reports are generated in `reports/coverage/`:

```bash
pnpm test
```

Open `reports/coverage/index.html` in a browser to view the coverage report.

### End-to-End Tests

```bash
# Run E2E tests
pnpm test:e2e

# View E2E test report
pnpm test:e2e:report
```

E2E tests use Playwright and run against a development server.

### Test Database

Unit tests that require a database use an in-memory SQLite database:

```typescript
// Example test setup
import { createTestDatabase, closeTestDatabase, getTestDatabase } from '../test/setup-db';

vi.mock('../database', () => ({
  useDatabase: () => getTestDatabase(),
}));

beforeEach(() => createTestDatabase());
afterAll(() => closeTestDatabase());
```

## Docker Development

### Using Docker Compose

```bash
# Start application with Docker Compose
docker compose up -d

# View logs
docker compose logs -f app

# Run migrations in container
docker compose run --rm migrations

# Stop containers
docker compose down
```

### Building Docker Image

```bash
# Build production image
docker buildx build \
  --load \
  --target production \
  -t networth-tracker:local \
  .
```

## Available Tasks

This project uses [Task](https://taskfile.dev/) as a task runner for common development operations. Tasks are defined in `Taskfile.yml`.

## Quick Reference

| Task            | Description                  |
| --------------- | ---------------------------- |
| `task`          | List all available tasks     |
| `task deps`     | Install project dependencies |
| `task dev`      | Start development server     |
| `task build`    | Build for production         |
| `task lint`     | Run ESLint                   |
| `task format`   | Format with Prettier         |
| `task test`     | Run unit tests               |
| `task test:e2e` | Run E2E tests                |
| `task up`       | Start Docker Compose         |
| `task ci`       | Run full CI pipeline         |

To see a complete list available tasks run `task` from your terminal.

## IDE Setup

### VS Code

Recommended extensions are defined in `.vscode/extensions.json` (if present).

Suggested extensions:

- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### EditorConfig

The project uses EditorConfig for consistent editor settings. Most editors support this via plugin or built-in.

## Environment Variables

Create a `.env` file in the project root (or copy from `.env.example`):

```bash
# Database
DATABASE_URL=file:./data/networth.db

# Server
NODE_ENV=development
PORT=3000

# Logging
LOG_LEVEL=debug
```

## Troubleshooting

### Playwright Browser Issues

If Playwright tests fail with browser-related errors:

```bash
# Reinstall Playwright browsers
pnpm exec playwright install --with-deps chromium
```

### Database Locked Errors

SQLite can lock under concurrent access. Solutions:

1. Stop all running dev servers
2. Delete `data/networth.db-journal` if present
3. Restart the development server

### Node/pnpm Version Mismatch

Using devenv ensures consistent versions. If you see version errors:

```bash
# Verify versions
node --version   # Should be v24.x
pnpm --version   # Should be 10.x

# If using devenv, exit and re-enter
exit
devenv shell
```

### Nix Store Issues

If devenv fails to build:

```bash
# Garbage collect Nix store
nix-collect-garbage -d

# Rebuild devenv
devenv gc
```
