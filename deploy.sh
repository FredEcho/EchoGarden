#!/bin/bash

# EchoGarden Deployment Script
# Run this script to deploy changes from Cursor to GitHub

echo "🌱 EchoGarden Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the EchoGarden project root"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
git status

# Add all changes
echo "📦 Adding all changes..."
git add .

# Get commit message from user or use default
if [ -z "$1" ]; then
    COMMIT_MSG="Update from Cursor - $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

# Commit changes
echo "💾 Committing changes: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed to GitHub!"
    echo "🌐 Repository: https://github.com/FredEcho/EchoGarden"
    echo "📝 Commit: $COMMIT_MSG"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi
