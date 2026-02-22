# ADR-001: Use SQLite Instead of PostgreSQL

- **Status**: Accepted
- **Date**: 2026-02-22
- **Authors**: Bruno Paz

## Context

Net Worth Tracker is a single-user personal finance application intended for self-hosted, local deployment. The primary use case is an individual tracking their own net worth over time — not a multi-tenant SaaS with concurrent users or distributed infrastructure.

A database engine must be chosen to persist accounts, snapshots, and application state. The two most common options considered were SQLite and PostgreSQL.

## Decision

Use **SQLite** (via `better-sqlite3`) as the database engine, managed by **Drizzle ORM**.

## Rationale

### SQLite fits the deployment model

The application is designed to run as a single Docker container on a personal machine or homelab. SQLite stores the entire database in a single file, which means:

- No separate database process to manage or monitor
- No network socket, authentication, or connection pooling required
- Backup is a simple file copy (`cp networth.db networth.db.bak`)
- The Docker image remains self-contained — no need for a `compose.yaml` with a PostgreSQL service

### Concurrency is not a concern

SQLite serialises writes, which would be a limitation for high-concurrency workloads. This app has a single user and predictably low write frequency (a few snapshots per month). WAL mode (enabled by default in `better-sqlite3`) handles the read/write overlap without issue.

### Operational simplicity wins at this scale

Running PostgreSQL for a personal app introduces unnecessary operational overhead: separate container lifecycle, health checks, init scripts, volume management, connection strings with credentials, and migration bootstrapping. SQLite eliminates all of that.

### Drizzle ORM abstracts the dialect

Using Drizzle ORM means the query layer is not deeply tied to SQLite specifics. If requirements ever change (e.g., multi-user support, hosted deployment), migrating to a PostgreSQL-compatible Drizzle dialect is achievable with targeted schema and config changes — not a full rewrite.

## Consequences

### Positive

- Zero-dependency deployment: one container, one file
- Simple backup and restore story
- Fast local performance with synchronous `better-sqlite3` API
- No credential management for the database layer

### Negative

- Not suitable if the app evolves into a multi-user or remotely-hosted service
- SQLite dialect has minor feature gaps vs PostgreSQL (e.g., no `RETURNING` with `UPDATE` in older versions, limited `ALTER TABLE` support)
- Horizontal scaling (multiple app replicas sharing one DB) is not possible without switching databases

## Alternatives Considered

### PostgreSQL

Would be the right choice if the app needed multi-user support, concurrent writes from multiple processes, or was deployed as a hosted service. Rejected for this use case because it adds infrastructure complexity without benefit at personal scale.
