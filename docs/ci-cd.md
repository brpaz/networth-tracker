# CI/CD Workflows

This document describes the continuous integration and deployment workflows for Net Worth Tracker.

## Overview

The project uses [GitHub Actions](https://github.com/features/actions) for CI/CD with the following workflows:

| Workflow                                     | Trigger                     | Purpose                                  |
| -------------------------------------------- | --------------------------- | ---------------------------------------- |
| [CI](#ci-workflow)                           | Push to main, PRs, releases | Lint, test, build, publish Docker images |
| [Release](#release-workflow)                 | Release published           | Update changelog                         |
| [PR Checker](#pr-checker-workflow)           | PR events                   | Validate PR labels and title             |
| [Labels Sync](#labels-sync-workflow)         | Push to main                | Sync repository labels                   |
| [Release Drafter](#release-drafter-workflow) | Push to main                | Auto-draft releases                      |

---

## CI Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**

- Push to `main` branch
- Pull requests to `main`
- Release published
- Manual dispatch

### Jobs

#### 1. Lint Job

Runs linting and formatting checks.

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup pnpm
      - Setup Node.js (from .node-version)
      - Install dependencies
      - Run ESLint
      - Check Prettier formatting
```

#### 2. Test Job

Runs unit and E2E tests (depends on lint job).

```yaml
jobs:
  test:
    needs: lint
    steps:
      - Run unit tests (Vitest)
      - Upload unit test reports
      - Upload coverage reports
      - Install Playwright dependencies
      - Run E2E tests (Playwright)
      - Upload E2E test reports
```

**Artifacts uploaded:**

| Artifact           | Retention | Contents               |
| ------------------ | --------- | ---------------------- |
| `unit-test-report` | 7 days    | HTML and JUnit reports |
| `coverage-report`  | 7 days    | Coverage HTML and LCOV |
| `e2e-test-report`  | 7 days    | Playwright HTML report |

#### 3. Build Job

Builds and publishes Docker images (depends on test job).

```yaml
jobs:
  build:
    needs: test
    steps:
      - Extract Git metadata (timestamp, SHA)
      - Generate Docker tags and labels
      - Build test image (single platform)
      - Run smoke tests
      - Login to GHCR (non-PR only)
      - Build and push multi-platform images (non-PR only)
```

**Docker Image Details:**

| Registry                  | Image                            |
| ------------------------- | -------------------------------- |
| GitHub Container Registry | `ghcr.io/brpaz/networth-tracker` |

**Platforms:** `linux/amd64`, `linux/arm64`

**Tags generated:**

- Branch name (e.g., `main`)
- PR number (e.g., `pr-123`)
- Semantic version (on release)
- Git SHA

### Workflow Concurrency

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Prevents multiple workflow runs for the same branch/PR from running simultaneously.

---

## Release Workflow

**File:** `.github/workflows/release.yml`

**Triggers:** Release published

### Jobs

#### Changelog Job

Automatically updates `CHANGELOG.md` with release notes.

```yaml
jobs:
  changelog:
    steps:
      - Checkout code
      - Generate updated changelog
      - Commit updated CHANGELOG.md
```

The commit message includes `[skip ci]` to prevent triggering another CI run.

---

## PR Checker Workflow

**File:** `.github/workflows/pr-checker.yml`

**Triggers:**

- PR opened, synchronized, reopened
- PR labeled or unlabeled

### Jobs

#### 1. Check CC Labels

Ensures PRs have at least one conventional commit label:

```yaml
labels:
  - feature
  - bug
  - docs
  - dependencies
  - security
  - chore
  - performance
```

#### 2. Check PR Title

Validates PR title follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `chore: update dependencies`

---

## Labels Sync Workflow

**File:** `.github/workflows/labels-sync.yml`

Synchronizes repository labels from `.github/labels.yml` on push to main.

---

## Release Drafter Workflow

**File:** `.github/workflows/release-drafter.yml`

Automatically drafts release notes based on merged PRs since the last release.

---

## Docker Multi-Stage Build

The `Dockerfile` uses multi-stage builds for optimized images:

```
┌─────────────────────────────────────────────┐
│                    base                      │
│  Node.js 24 Alpine + pnpm setup             │
└──────────────────┬──────────────────────────┘
│                  │                           │
│  ┌───────────────▼───────────┐               │
│  │           deps            │               │
│  │  All dependencies         │               │
│  └───────────────┬───────────┘               │
│                  │                           │
│  ┌───────────────▼───────────┐               │
│  │         prod-deps         │               │
│  │  Production dependencies  │               │
│  └───────────────────────────┘               │
│                                              │
│  ┌───────────────────────────┐               │
│  │           dev             │               │
│  │  Development server       │               │
│  └───────────────────────────┘               │
│                                              │
│  ┌───────────────────────────┐               │
│  │          build            │               │
│  │  Build Nuxt application   │               │
│  └───────────────┬───────────┘               │
│                  │                           │
│  ┌───────────────▼───────────┐               │
│  │        production         │               │
│  │  Minimal runtime image    │               │
│  └───────────────────────────┘               │
└─────────────────────────────────────────────┘
```

### Build Arguments

| Argument     | Description              |
| ------------ | ------------------------ |
| `GIT_REF`    | Git commit SHA           |
| `BUILD_DATE` | ISO 8601 build timestamp |
| `VERSION`    | Application version      |

### Build Caching

Docker layer caching via GitHub Actions cache:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

---

## Smoke Tests

After building the Docker image, smoke tests verify basic functionality:

**Script:** `scripts/ci/smoke-tests.sh`

**Tests:**

1. Health check endpoint returns 200
2. API endpoints respond correctly
3. Database migrations run successfully

---

## Local CI Simulation

Run the full CI pipeline locally using Task:

```bash
# Run linting checks
task ci:lint

# Run all tests
task ci:test

# Run smoke tests (requires Docker)
task ci:smoke

# Run full CI pipeline
task ci
```

---

## Required Permissions

The workflows require the following GitHub permissions:

| Permission            | Usage               |
| --------------------- | ------------------- |
| `contents: read`      | Checkout repository |
| `contents: write`     | Update changelog    |
| `packages: write`     | Push to GHCR        |
| `pull-requests: read` | Read PR information |
| `checks: write`       | Create check runs   |

---

## Secrets

No repository secrets are required. All workflows use `GITHUB_TOKEN` provided by GitHub Actions.
