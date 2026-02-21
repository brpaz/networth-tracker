# Net Worth Tracker Documentation

Welcome to the Net Worth Tracker documentation. This section contains detailed technical documentation for developers working on the project.

## Table of Contents

| Document                                    | Description                                                       |
| ------------------------------------------- | ----------------------------------------------------------------- |
| [Tech Stack](./tech-stack.md)               | Complete overview of technologies, frameworks, and libraries used |
| [Architecture](./architecture.md)           | Application architecture, folder structure, and design patterns   |
| [Development Environment](./development.md) | Setup instructions for local development                          |
| [CI/CD Workflows](./ci-cd.md)               | Continuous integration and deployment pipelines                   |
| [Available Tasks](./tasks.md)               | Task runner commands for common operations                        |

## Quick Start

```bash
# Enter development shell (installs all dependencies)
devenv shell

# Start development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Overview

Net Worth Tracker is a personal finance application built with Nuxt 4 that allows users to:

- Track multiple accounts across various types (stocks, cash, crypto, real estate, bonds, retirement)
- Record value snapshots over time
- Visualize net worth evolution with interactive charts
- Simulate compound interest projections

The application is designed for single-user, local deployment with SQLite storage.
