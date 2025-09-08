# Simple and Reliable GitHub Upload Script
Write-Host "Uploading EchoGarden to GitHub..." -ForegroundColor Green

# Check if git is available
try {
    git --version | Out-Null
    Write-Host "Git is available" -ForegroundColor Green
} catch {
    Write-Host "Git is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/downloads" -ForegroundColor White
    exit 1
}

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Check for changes
$gitStatus = git status --porcelain
if (-not $gitStatus) {
    Write-Host "No changes to commit" -ForegroundColor Blue
    exit 0
}

# Add all files
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

# Create commit
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Update EchoGarden project - $timestamp"
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m $commitMessage

# Check if commit was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Commit created successfully" -ForegroundColor Green

# Check remote
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "No remote origin configured!" -ForegroundColor Yellow
    Write-Host "Current repository: https://github.com/FredEcho/EchoGarden.git" -ForegroundColor Cyan
    git remote add origin https://github.com/FredEcho/EchoGarden.git
}

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow

# Try different push strategies
$pushSuccess = $false

# Strategy 1: Regular push
Write-Host "Trying regular push..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    $pushSuccess = $true
}

# Strategy 2: Upstream push
if (-not $pushSuccess) {
    Write-Host "Trying upstream push..." -ForegroundColor Yellow
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        $pushSuccess = $true
    }
}

# Strategy 3: Force push (if needed)
if (-not $pushSuccess) {
    Write-Host "Trying force push..." -ForegroundColor Yellow
    git push -f origin main
    if ($LASTEXITCODE -eq 0) {
        $pushSuccess = $true
    }
}

if ($pushSuccess) {
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/FredEcho/EchoGarden" -ForegroundColor Cyan
    Write-Host "Upload completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Push failed!" -ForegroundColor Red
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check your internet connection" -ForegroundColor White
    Write-Host "2. Verify GitHub credentials (use Personal Access Token)" -ForegroundColor White
    Write-Host "3. Check repository permissions" -ForegroundColor White
    Write-Host "4. Try manual: git push origin main" -ForegroundColor White
}