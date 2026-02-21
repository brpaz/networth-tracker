# Available Tasks

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

---

## Development Tasks

### `task deps`

Install all project dependencies using pnpm.

```bash
task deps
# Equivalent to: pnpm install
```

### `task dev`

Start the development server with hot reload.

```bash
task dev
# Equivalent to: pnpm dev
```

The application runs at [http://localhost:3000](http://localhost:3000).

### `task build`

Build the Nuxt application for production.

```bash
task build
# Equivalent to: pnpm build
```

### `task build:docker`

Build a Docker image for local testing.

```bash
task build:docker
# Builds: networth-tracker:{version}-dev
```

Build arguments are automatically set:

- `GIT_REF`: Current git commit SHA
- `BUILD_DATE`: Current timestamp
- `VERSION`: Latest git tag or `0.0.0`

### `task preview`

Preview the production build locally.

```bash
task preview
# Equivalent to: pnpm preview
```

---

## Linting & Formatting

### `task lint`

Run ESLint on the codebase.

```bash
task lint
# Equivalent to: pnpm lint
```

### `task lint:fix`

Run ESLint with auto-fix.

```bash
task lint:fix
# Equivalent to: pnpm lint:fix
```

### `task format`

Format code with Prettier.

```bash
task format
# Equivalent to: pnpm format
```

### `task format:check`

Check formatting without making changes.

```bash
task format:check
# Equivalent to: pnpm format:check
```

---

## Testing

### `task test`

Run unit tests with Vitest.

```bash
task test
# Equivalent to: pnpm test
```

Coverage reports are generated in `reports/coverage/`.

### `task test:watch`

Run unit tests in watch mode.

```bash
task test:watch
# Equivalent to: pnpm test:watch
```

### `task test:e2e`

Run end-to-end tests with Playwright.

```bash
task test:e2e
# Equivalent to: pnpm test:e2e
```

---

## Database

### `task db:generate`

Generate database migrations from schema changes.

```bash
task db:generate
# Equivalent to: pnpm db:generate
```

After running, review generated migrations in `server/database/migrations/`.

### `task db:migrate`

Apply pending database migrations.

```bash
task db:migrate
# Equivalent to: pnpm db:migrate
```

### `task db:studio`

Open Drizzle Studio for database inspection.

```bash
task db:studio
# Equivalent to: pnpm db:studio
```

Opens [https://local.drizzle.studio](https://local.drizzle.studio) in your browser.

---

## Docker Compose

### `task up`

Start application with Docker Compose.

```bash
task up
# Equivalent to: docker compose up -d
```

### `task down`

Stop and remove containers.

```bash
task down
# Equivalent to: docker compose down
```

### `task logs`

View application logs from containers.

```bash
task logs
# Equivalent to: docker compose logs -f app
```

### `task restart`

Restart containers.

```bash
task restart
# Equivalent to: docker compose restart
```

### `task migrate`

Run database migrations inside the container.

```bash
task migrate
# Equivalent to: docker compose run --rm migrations
```

---

## CI/CD Tasks

### `task ci:lint`

Run linting checks (lint + format check).

```bash
task ci:lint
```

### `task ci:test`

Run all tests (unit + E2E).

```bash
task ci:test
```

### `task ci:smoke`

Run smoke tests against a local Docker image.

```bash
task ci:smoke
# Builds image, then runs: ./scripts/ci/smoke-tests.sh
```

### `task ci`

Run the full CI pipeline locally.

```bash
task ci
# Runs: ci:lint → ci:test → ci:smoke
```

Use this to verify your changes before pushing.

---

## Utility Tasks

### `task install`

Alias for `task deps`.

```bash
task install
```

### `task clean`

Remove build artifacts and containers.

```bash
task clean
# Removes: .output, dist, node_modules
```

---

## Task Variables

The Taskfile uses dynamic variables:

| Variable        | Value                          |
| --------------- | ------------------------------ |
| `PROJECT_NAME`  | `networth-tracker`             |
| `GIT_REF`       | Current git commit SHA         |
| `GIT_REF_SHORT` | Short git SHA                  |
| `BUILD_DATE`    | ISO 8601 timestamp             |
| `VERSION`       | Latest git tag or `0.0.0`      |
| `IMAGE_TAG`     | `{PROJECT_NAME}:{VERSION}-dev` |

---

## Combining with pnpm

Tasks are wrappers around pnpm scripts. You can use either:

```bash
# Via Task
task test

# Direct pnpm
pnpm test
```

Use Task for:

- Multi-step operations (CI tasks)
- Docker operations
- Complex variable substitution

Use pnpm directly for:

- Single commands
- When working in a devenv shell
- CI environments

---

## Task Discovery

List all available tasks:

```bash
task --list-all
```

Or simply run `task` with no arguments (default task shows the list).
