# Deploy to GitHub Pages using gh-pages branch
# This script builds the client and pushes to gh-pages branch

Write-Host "🚀 Deploying to GitHub Pages via gh-pages branch..." -ForegroundColor Green

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

# Step 3: Create or switch to gh-pages branch
Write-Host "🌿 Setting up gh-pages branch..." -ForegroundColor Yellow

# Check if gh-pages branch exists
$ghPagesExists = git show-ref --verify --quiet refs/heads/gh-pages
if (-not $ghPagesExists) {
    Write-Host "Creating new gh-pages branch..." -ForegroundColor Cyan
    git checkout --orphan gh-pages
    git rm -rf .
} else {
    Write-Host "Switching to existing gh-pages branch..." -ForegroundColor Cyan
    git checkout gh-pages
    git rm -rf . --ignore-unmatch
}

# Step 4: Copy built files to root
Write-Host "📁 Copying built files..." -ForegroundColor Yellow
Copy-Item -Path "dist/public/*" -Destination "." -Recurse -Force

# Step 5: Add and commit
Write-Host "📝 Committing changes..." -ForegroundColor Yellow
git add .
git commit -m "Deploy to GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Step 6: Push to gh-pages branch
Write-Host "⬆️ Pushing to gh-pages branch..." -ForegroundColor Yellow
git push origin gh-pages

# Step 7: Switch back to main
Write-Host "🔄 Switching back to main branch..." -ForegroundColor Yellow
git checkout main

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your site should be available at: https://fredecho.github.io/EchoGarden/" -ForegroundColor Cyan
Write-Host "⚙️ Make sure GitHub Pages is set to 'Deploy from a branch' -> 'gh-pages' in repository settings." -ForegroundColor Yellow
