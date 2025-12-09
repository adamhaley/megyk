#!/bin/bash
set -e  # Exit on error
set -u  # Exit on undefined variable

echo "Starting deployment..."

# Note: git pull is done in the GitHub Action workflow before this script runs

# Install dependencies
echo "Installing dependencies..."
yarn install --frozen-lockfile

# Build the application
echo "🔨 Building application..."
yarn build


echo "Deployment complete!"
