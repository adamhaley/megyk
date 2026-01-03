#!/bin/bash
set -e

echo "Deploying .."

git pull origin master
docker compose -f ../n8n-docker-caddy/docker-compose.yml up -d --build megyk-dashboard

echo "Deploy complete!"
