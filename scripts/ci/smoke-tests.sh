#!/bin/bash
set -euo pipefail

# CI Smoke Tests
# Orchestrates Docker Compose startup and runs smoke tests against the application

COMPOSE_FILE="${COMPOSE_FILE:-compose.ci.yml}"

if [ -z "${IMAGE_REF:-}" ]; then
	echo "❌ ERROR: IMAGE_REF environment variable is required"
	echo "   Usage: IMAGE_REF=networth-tracker:sha $0"
	exit 1
fi

cleanup() {
	local exit_code=$?

	if [ $exit_code -ne 0 ]; then
		echo ""
		echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
		echo "🔍 Debug Information"
		echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
		echo ""
		echo "📋 Container Status:"
		docker compose -f "$COMPOSE_FILE" ps
		echo ""
		echo "📜 Container Logs:"
		docker compose -f "$COMPOSE_FILE" logs
		echo ""
		echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	fi

	echo ""
	echo "🧹 Cleaning up..."
	docker compose -f "$COMPOSE_FILE" down -v

	exit $exit_code
}

trap cleanup EXIT INT TERM

export IMAGE_REF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 CI Smoke Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Image: $IMAGE_REF"
echo "   Compose: $COMPOSE_FILE"
echo ""

echo "🚀 Starting services..."
docker compose -f "$COMPOSE_FILE" up -d --wait --wait-timeout=60

echo "✅ App is healthy"
echo ""
echo "🧪 Running smoke tests..."

curl -sf http://localhost:3000/ >/dev/null
echo "   ✓ GET / → 200"

curl -sf http://localhost:3000/api/accounts >/dev/null
echo "   ✓ GET /api/accounts → 200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All smoke tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
