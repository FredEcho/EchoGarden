# Deploy EchoGarden to GitHub Pages via feature branch
# This script builds the project and pushes to the feature branch for GitHub Pages deployment

Write-Host "🚀 Building and deploying EchoGarden to GitHub Pages..." -ForegroundColor Green

# Build the client
Write-Host "📦 Building client..." -ForegroundColor Yellow
npm run build:client

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Add all changes
Write-Host "📝 Adding changes..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Deploy to GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Push to feature branch
Write-Host "🚀 Pushing to feature branch..." -ForegroundColor Yellow
git push origin feature

Write-Host "✅ Deployment initiated! Check GitHub Actions for build status." -ForegroundColor Green
Write-Host "🌐 Your site will be available at: https://fredecho.github.io/EchoGarden/" -ForegroundColor Cyan
