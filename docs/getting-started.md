# Getting Started

Net Worth Tracker is distributed as a Docker image. Running it requires no Node.js, no build step, and no external database — just Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 24+ (or Docker Desktop)

## Run with Docker

### 1. Create a volume for persistent data

```bash
docker volume create networth-data
```

This volume stores the SQLite database file. Your data persists across container restarts and upgrades.

### 2. Start the container

```bash
docker run -d \
  --name networth-tracker \
  -p 3000:3000 \
  -v networth-data:/app/data \
  ghcr.io/brpaz/networth-tracker:latest
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 3. Verify it's running

```bash
docker ps
docker logs networth-tracker
```

You should see the Nuxt server startup log with `Listening on http://[::]:3000`.

---

## Run with Docker Compose

For a more maintainable setup, use a `compose.yaml` file:

```yaml
services:
  app:
    image: ghcr.io/brpaz/networth-tracker:latest
    container_name: networth-tracker
    restart: unless-stopped
    ports:
      - '3000:3000'
    volumes:
      - networth-data:/app/data
    environment:
      NODE_ENV: production
      LOG_LEVEL: info

volumes:
  networth-data:
```

Then start it with:

```bash
docker compose up -d
```

---

## Configuration

Configure the app via environment variables passed to the container.

| Variable                    | Default                   | Description                                               |
| --------------------------- | ------------------------- | --------------------------------------------------------- |
| `NUXT_DATABASE_URL`         | `file:./data/networth.db` | Path to the SQLite database file inside the container.    |
| `NUXT_PUBLIC_BASE_CURRENCY` | `EUR`                     | Currency code for all value displays (e.g. `USD`, `GBP`). |
| `PORT`                      | `3000`                    | HTTP port the server listens on.                          |
| `LOG_LEVEL`                 | `info`                    | Log verbosity: `trace`, `debug`, `info`, `warn`, `error`. |
| `NODE_ENV`                  | `production`              | Runtime environment.                                      |

### Example: change currency to USD

```bash
docker run -d \
  --name networth-tracker \
  -p 3000:3000 \
  -v networth-data:/app/data \
  -e NUXT_PUBLIC_BASE_CURRENCY=USD \
  ghcr.io/brpaz/networth-tracker:latest
```

Or in `compose.yaml`:

```yaml
environment:
  NUXT_PUBLIC_BASE_CURRENCY: USD
```

---

## Upgrading

Pull the latest image and recreate the container. Your data volume is unaffected.

```bash
# Pull latest image
docker pull ghcr.io/brpaz/networth-tracker:latest

# Remove old container (data volume is preserved)
docker rm -f networth-tracker

# Start with the same run command
docker run -d \
  --name networth-tracker \
  -p 3000:3000 \
  -v networth-data:/app/data \
  ghcr.io/brpaz/networth-tracker:latest
```

With Docker Compose:

```bash
docker compose pull
docker compose up -d
```

---

## Backup & Restore

All data is stored in the `networth-data` volume as a single SQLite file.

### Backup

```bash
docker run --rm \
  -v networth-data:/data \
  -v $(pwd):/backup \
  alpine \
  cp /data/networth.db /backup/networth-backup.db
```

### Restore

```bash
docker run --rm \
  -v networth-data:/data \
  -v $(pwd):/backup \
  alpine \
  cp /backup/networth-backup.db /data/networth.db
```

> Make sure the app container is stopped before restoring to avoid database corruption.

---

## Next Steps

- [Architecture](./architecture.md) — understand how the app is structured
- [Development Environment](./development.md) — set up a local dev environment to contribute
