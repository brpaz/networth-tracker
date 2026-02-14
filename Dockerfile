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
