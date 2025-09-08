# Complete GitHub Pages Deployment Script
# This will build and deploy your website to GitHub Pages

Write-Host "🚀 Starting complete GitHub Pages deployment..." -ForegroundColor Green

# Step 1: Build the client
Write-Host "📦 Building React application..." -ForegroundColor Yellow
npm run build:client

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please check for errors." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Step 2: Check build output
if (-not (Test-Path "dist/public/index.html")) {
    Write-Host "❌ index.html not found in build output!" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Build contents:" -ForegroundColor Cyan
Get-ChildItem -Path "dist/public" | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor Gray
}

# Step 3: Create gh-pages branch and deploy
Write-Host "🌿 Creating/updating gh-pages branch..." -ForegroundColor Yellow

# Check if gh-pages branch exists
$ghPagesExists = git show-ref --verify --quiet refs/heads/gh-pages
if (-not $ghPagesExists) {
    Write-Host "Creating new gh-pages branch..." -ForegroundColor Cyan
    git checkout --orphan gh-pages
    git rm -rf . --ignore-unmatch
} else {
    Write-Host "Switching to existing gh-pages branch..." -ForegroundColor Cyan
    git checkout gh-pages
    git rm -rf . --ignore-unmatch
}

# Step 4: Copy built files
Write-Host "📁 Copying built files to root..." -ForegroundColor Yellow
Copy-Item -Path "dist/public/*" -Destination "." -Recurse -Force

# Step 5: Add .nojekyll file
Write-Host "📝 Adding .nojekyll file..." -ForegroundColor Yellow
echo "" > .nojekyll

# Step 6: Commit and push
Write-Host "📝 Committing changes..." -ForegroundColor Yellow
git add .
git commit -m "Deploy EchoGarden to GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Host "⬆️ Pushing to gh-pages branch..." -ForegroundColor Yellow
git push origin gh-pages --force

# Step 7: Switch back to main
Write-Host "🔄 Switching back to main branch..." -ForegroundColor Yellow
git checkout main

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your website should be available at: https://fredecho.github.io/EchoGarden/" -ForegroundColor Cyan
Write-Host "⚙️ Make sure GitHub Pages is configured to use 'gh-pages' branch in repository settings." -ForegroundColor Yellow
Write-Host "⏳ It may take 2-3 minutes for the changes to be visible." -ForegroundColor Yellow
