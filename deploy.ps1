# Simple EchoGarden Deployment Script
# Run this to push changes from Cursor to GitHub

Write-Host "🚀 Deploying to GitHub..." -ForegroundColor Green

git add .
git commit -m "Update from Cursor - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin main

Write-Host "✅ Deployed to https://github.com/FredEcho/EchoGarden.git" -ForegroundColor Green
