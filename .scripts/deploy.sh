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

# Restart the application
echo "♻️  Restarting application..."

# Check if megyk-dashboard service exists
if systemctl is-active --quiet megyk-dashboard; then
  sudo systemctl restart megyk-dashboard
  echo "✅ Systemd restart complete (megyk-dashboard)"
  systemctl status megyk-dashboard --no-pager
elif systemctl is-active --quiet megyk; then
  sudo systemctl restart megyk
  echo "✅ Systemd restart complete (megyk)"
  systemctl status megyk --no-pager
elif command -v pm2 &> /dev/null && pm2 list | grep -q megyk; then
  pm2 restart megyk
  echo "✅ PM2 restart complete"
else
  echo "⚠️  No service found - manual restart needed"
  echo "⚠️  Run: sudo systemctl restart megyk-dashboard"
fi

echo "🎉 Deployment complete!"
echo "📊 App should be live at: https://megyk.com"
