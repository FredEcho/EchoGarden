# Manual GitHub Pages Deployment Script
# This builds the client and pushes to gh-pages branch

Write-Host "🚀 Building and deploying to GitHub Pages..." -ForegroundColor Green

# Build the client
Write-Host "📦 Building client..." -ForegroundColor Yellow
npm run build:client

# Check if gh-pages branch exists
$ghPagesExists = git show-ref --verify --quiet refs/remotes/origin/gh-pages
if (-not $ghPagesExists) {
    Write-Host "🌿 Creating gh-pages branch..." -ForegroundColor Yellow
    git checkout --orphan gh-pages
    git rm -rf .
} else {
    Write-Host "🌿 Switching to gh-pages branch..." -ForegroundColor Yellow
    git checkout gh-pages
fi

# Copy built files
Write-Host "📁 Copying built files..." -ForegroundColor Yellow
Copy-Item -Path "dist/public/*" -Destination "." -Recurse -Force

# Add and commit
git add .
git commit -m "Deploy to GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Push to gh-pages branch
Write-Host "⬆️ Pushing to gh-pages branch..." -ForegroundColor Yellow
git push origin gh-pages

# Switch back to main
git checkout main

Write-Host "✅ Deployed to GitHub Pages!" -ForegroundColor Green
Write-Host "🌐 Your site should be available at: https://fredecho.github.io/EchoGarden/" -ForegroundColor Cyan
