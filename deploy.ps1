# EchoGarden Deploy Script - GitHub + GitHub Pages
Write-Host "🚀 Deploying EchoGarden to GitHub and GitHub Pages..." -ForegroundColor Green
Write-Host "Repository: https://github.com/FredEcho/EchoGarden.git" -ForegroundColor Cyan

# Check if we're in a Git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in a Git repository!" -ForegroundColor Red
    Write-Host "Please run 'git init' first or navigate to your Git repository." -ForegroundColor Yellow
    exit 1
}

# Check if remote origin is configured
$remoteUrl = git --no-pager remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "❌ Error: No remote origin configured!" -ForegroundColor Red
    Write-Host "Please run: git remote add origin https://github.com/FredEcho/EchoGarden.git" -ForegroundColor Yellow
    exit 1
}

Write-Host "Remote repository: $remoteUrl" -ForegroundColor Gray

# Step 1: Deploy source code to GitHub main branch
Write-Host ""
Write-Host "📤 Step 1: Uploading source code to GitHub..." -ForegroundColor Yellow
git --no-pager add .
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
git --no-pager commit -m "Deploy EchoGarden - $timestamp"
git --no-pager push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ GitHub upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Successfully uploaded to GitHub!" -ForegroundColor Green

# Step 2: Build and deploy to GitHub Pages
Write-Host ""
Write-Host "🌐 Step 2: Building and deploying to GitHub Pages..." -ForegroundColor Yellow

# Build the client with corrected configuration
Write-Host "Building React application..." -ForegroundColor Cyan
npm run build:client

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Check if build output exists
if (-not (Test-Path "dist/public/index.html")) {
    Write-Host "❌ Build output not found!" -ForegroundColor Red
    exit 1
}

# Deploy to GitHub Pages
Write-Host "Creating/updating gh-pages branch..." -ForegroundColor Cyan

# Check if gh-pages branch exists
$ghPagesExists = git --no-pager show-ref --verify --quiet refs/heads/gh-pages 2>$null
if (-not $ghPagesExists) {
    Write-Host "Creating new gh-pages branch..." -ForegroundColor Gray
    git --no-pager checkout --orphan gh-pages
    git --no-pager rm -rf . --ignore-unmatch
} else {
    Write-Host "Switching to existing gh-pages branch..." -ForegroundColor Gray
    git --no-pager checkout gh-pages
    git --no-pager rm -rf . --ignore-unmatch
}

# Copy built files
Write-Host "Copying built files..." -ForegroundColor Cyan
Copy-Item -Path "dist/public/*" -Destination "." -Recurse -Force

# Add .nojekyll file
Write-Host "Adding .nojekyll file..." -ForegroundColor Cyan
echo "" > .nojekyll

# Commit and push to gh-pages
Write-Host "Committing to gh-pages..." -ForegroundColor Cyan
git --no-pager add .
git --no-pager commit -m "Deploy EchoGarden to GitHub Pages - $timestamp"

Write-Host "Pushing to gh-pages branch..." -ForegroundColor Cyan
git --no-pager push origin gh-pages --force

# Switch back to main
Write-Host "Switching back to main branch..." -ForegroundColor Cyan
git --no-pager checkout main

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

Write-Host ""
Write-Host "🌐 Your website is now live at:" -ForegroundColor Cyan
Write-Host "https://fredecho.github.io/EchoGarden/" -ForegroundColor White

Write-Host ""
Write-Host "⚙️ GitHub Pages Configuration:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/FredEcho/EchoGarden/settings/pages" -ForegroundColor White
Write-Host "2. Under 'Source', select 'Deploy from a branch'" -ForegroundColor White
Write-Host "3. Select 'gh-pages' branch" -ForegroundColor White
Write-Host "4. Select '/ (root)' folder" -ForegroundColor White
Write-Host "5. Click 'Save'" -ForegroundColor White

Write-Host ""
Write-Host "It may take 2-3 minutes for changes to be visible." -ForegroundColor Yellow
Write-Host "Refresh the page after a few minutes to see your website!" -ForegroundColor Yellow