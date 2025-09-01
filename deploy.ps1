# EchoGarden Deployment Script for PowerShell
# Run this script to deploy changes from Cursor to GitHub

Write-Host "🌱 EchoGarden Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the EchoGarden project root" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

# Check git status
Write-Host "📋 Checking git status..." -ForegroundColor Yellow
git status

# Add all changes
Write-Host "📦 Adding all changes..." -ForegroundColor Yellow
git add .

# Get commit message from user or use default
if ($args.Count -eq 0) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMsg = "Update from Cursor - $timestamp"
} else {
    $commitMsg = $args[0]
}

# Commit changes
Write-Host "💾 Committing changes: $commitMsg" -ForegroundColor Yellow
git commit -m $commitMsg

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

# Check if push was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully deployed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 Repository: https://github.com/FredEcho/EchoGarden" -ForegroundColor Cyan
    Write-Host "📝 Commit: $commitMsg" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Read-Host "Press Enter to continue"
