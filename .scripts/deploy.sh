#!/bin/bash
set -e  # Exit on error
set -u  # Exit on undefined variable

echo "🚀 Starting deployment..."

# Note: git pull is done in the GitHub Action workflow before this script runs

# Install dependencies
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile

# Build the application
echo "🔨 Building application..."
yarn build

# Restart the application (adjust this based on your process manager)
echo "♻️  Restarting application..."

# Option 1: If using PM2
if command -v pm2 &> /dev/null; then
  pm2 restart megyk || pm2 start yarn --name megyk -- start
  echo "✅ PM2 restart complete"

# Option 2: If using systemd
elif systemctl is-active --quiet megyk; then
  sudo systemctl restart megyk
  echo "✅ Systemd restart complete"

# Option 3: If no process manager (manual)
else
  echo "⚠️  No process manager detected"
  echo "⚠️  Please restart the app manually with: yarn start"
fi

echo "🎉 Deployment complete!"
echo "📊 App should be live at: https://megyk.com"
