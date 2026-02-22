# syntax=docker/dockerfile:1

# =================================================
# Base Stage
# Setups PNPM and base Dependencies
# =================================================
FROM node:24-alpine AS base
RUN apk add --no-cache curl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
COPY package.json ./
RUN corepack enable && corepack install

# =================================================
# Dependencies Stage
# =================================================
FROM base AS deps
RUN apk add --no-cache python3 make g++ # required for better-sqlite3
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# =================================================
# Production Dependencies Stage
# =================================================
FROM base AS prod-deps
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

# =================================================
# Development Stage
# =================================================
FROM deps AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["sh", "-c", "pnpm install && pnpm db:migrate && pnpm dev"]

# =================================================
# Build Stage
# =================================================
FROM deps AS build
COPY . .
ARG GIT_REF
ARG BUILD_DATE
ARG VERSION
ENV GIT_REF=${GIT_REF}
ENV BUILD_DATE=${BUILD_DATE}
ENV VERSION=${VERSION}
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=cache,id=nuxt,target=/app/node_modules/.cache \
    pnpm build

# =================================================
# Runtime Stage
# =================================================
FROM node:24-alpine AS production

RUN apk add --no-cache curl libstdc++

ARG GIT_REF
ARG BUILD_DATE
ARG VERSION

LABEL org.opencontainers.image.source="https://github.com/brpaz/networth-tracker"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${GIT_REF}"

ENV NODE_ENV=production
ENV GIT_REF=${GIT_REF}
ENV BUILD_DATE=${BUILD_DATE}
ENV VERSION=${VERSION}

WORKDIR /app

COPY --from=build /app/.output /app/.output
COPY --from=build /app/drizzle.config.ts /app/drizzle.config.ts
COPY --from=build /app/server/database/schema.ts /app/server/database/schema.ts
COPY --from=build /app/server/database/migrations /app/server/database/migrations
COPY --from=prod-deps /app/node_modules /app/node_modules

RUN mkdir -p /app/data && chown -R node:node /app/data

COPY deploy/docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD sh -c 'curl -f http://localhost:$${PORT:-3000}/api/health' || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
