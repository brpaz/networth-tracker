#!/bin/sh
set -e

echo "Running database migrations..."
/app/node_modules/.bin/drizzle-kit migrate

echo "Starting application..."
exec "$@"
