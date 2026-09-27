#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/DOBERTO-VCF"

cd "$APP_DIR"

git pull --ff-only origin main
npm ci --omit=dev

pm2 startOrReload ecosystem.config.cjs
pm2 save

echo
echo "Local health:"
curl -fsS http://127.0.0.1:3200/api/health
echo
