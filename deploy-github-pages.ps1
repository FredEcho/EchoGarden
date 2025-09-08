# GitHub Pages Deployment Script
# This script builds the client and deploys to GitHub Pages

Write-Host "🚀 Starting GitHub Pages deployment..." -ForegroundColor Green

# Step 1: Build the client
Write-Host "📦 Building client application..." -ForegroundColor Yellow
npm run build:client

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Step 2: Check if dist/public exists
if (-not (Test-Path "dist/public")) {
    Write-Host "❌ Build output directory not found!" -ForegroundColor Red
    exit 1
}

# Step 3: List build contents
Write-Host "📁 Build contents:" -ForegroundColor Cyan
Get-ChildItem -Path "dist/public" -Recurse | ForEach-Object {
    Write-Host "  $($_.FullName.Replace((Get-Location).Path + '\dist\public\', ''))" -ForegroundColor Gray
}

# Step 4: Commit and push changes
Write-Host "📤 Pushing changes to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "Deploy to GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin main

Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host "🌐 Your site will be available at: https://fredecho.github.io/EchoGarden/" -ForegroundColor Cyan
Write-Host "⏳ Please wait 2-3 minutes for GitHub Actions to complete the deployment." -ForegroundColor Yellow
Write-Host "🔧 Make sure GitHub Pages is set to 'GitHub Actions' in repository settings." -ForegroundColor Yellow
