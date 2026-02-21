# Tech Stack

This document provides an overview of the technologies, frameworks, and libraries used in the Net Worth Tracker project.

## Runtime & Package Management

- **Node.js** — JavaScript runtime
- **pnpm** — Fast, disk-efficient package manager

## Framework & Core

- **Nuxt** — Full-stack Vue.js framework with SSR/SSG capabilities
- **Vue** — Progressive JavaScript framework
- **Vue Router** — Official router for Vue.js
- **TypeScript** — Type-safe JavaScript

## Frontend

### UI Framework

- **Nuxt UI** — UI component library built on Tailwind CSS
- **Tailwind CSS** — Utility-first CSS framework
- **Lucide Icons** — Icon set via Iconify

### Data Visualization

- **Chart.js** — JavaScript charting library
- **vue-chartjs** — Vue wrapper for Chart.js

### Validation

- **Zod** — TypeScript-first schema validation

## Backend & Database

### Database

- **SQLite** — Embedded SQL database
- **better-sqlite3** — Synchronous SQLite bindings for Node.js
- **Drizzle ORM** — TypeScript ORM for SQL databases
- **drizzle-kit** — Database migrations and introspection

### Logging

- **Pino** — High-performance Node.js logger
- **pino-http** — HTTP logging middleware
- **pino-pretty** — Log formatter for development

## Testing

### Unit Testing

- **Vitest** — Vite-powered unit testing framework
- **@vitest/coverage-v8** — Code coverage with V8
- **@vue/test-utils** — Vue.js component testing utilities
- **happy-dom** — JS implementation of DOM for testing
- **@nuxt/test-utils** — Nuxt testing utilities

### End-to-End Testing

- **Playwright** — Browser automation and E2E testing

## Code Quality

- **ESLint** — JavaScript/TypeScript linter
- **@nuxt/eslint** — Nuxt-specific ESLint configuration
- **Prettier** — Code formatter

## Development Tools

- **Lefthook** — Fast git hooks manager
- **devenv** — Reproducible development shell with Nix
- **direnv** — Environment auto-loader
- **Task** — Task runner and build tool

## Containerization & Deployment

- **Docker** — Containerization platform
- **Docker Compose** — Multi-container orchestration
- **Kustomize** — Kubernetes native configuration management
- **Renovate** — Automated dependency updates

## Technology Decisions

### Why Nuxt?

- Full-stack framework with SSR/SSG capabilities
- Built-in file-based routing
- Auto-imports for composables and components
- Nitro server engine with multiple deployment presets

### Why SQLite with Drizzle?

- Zero-configuration database perfect for single-user deployment
- Drizzle ORM provides type-safe queries with minimal overhead
- Portable database file for easy backup and migration

### Why Vitest over Jest?

- Native ESM support without configuration
- Faster test execution with Vite's transformation pipeline
- Drop-in compatible API with Jest

### Why Playwright?

- Cross-browser testing (Chromium, Firefox, WebKit)
- Auto-wait capabilities for reliable tests
- Built-in tracing and debugging tools
