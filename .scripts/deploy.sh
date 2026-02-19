#!/bin/bash
set -e

echo "Deploying .."

git pull origin master
docker compose -f ../n8n-docker-caddy/docker-compose.yml build megyk-dashboard
docker compose -f ../n8n-docker-caddy/docker-compose.yml up -d megyk-dashboard

echo "Deploy complete!"
