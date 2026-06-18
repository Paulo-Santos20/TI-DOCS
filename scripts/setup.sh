#!/bin/bash
set -e

echo "=== TI DOCS Setup ==="

command -v node >/dev/null 2>&1 || { echo "Node.js is required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }

cp .env.example .env 2>/dev/null || true

echo "Starting PostgreSQL and Ollama..."
docker compose up -d postgres ollama

echo "Waiting for PostgreSQL..."
until docker compose exec postgres pg_isready -U tidocs >/dev/null 2>&1; do sleep 1; done

echo "Installing dependencies..."
npm install
npm --prefix backend install
npm --prefix frontend install

echo "Running database migrations..."
npm --prefix backend run db:migrate

echo "Seeding database..."
npm --prefix backend run db:seed

echo "=== Setup complete! Run 'npm run dev' to start ==="
