# ===============================================
#     ECHOGARDEN GITHUB UPLOAD SCRIPT
# ===============================================

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "     ECHOGARDEN GITHUB UPLOAD SCRIPT" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting upload process..." -ForegroundColor Green
Write-Host ""

# Step 1: Check if we're on feature branch
Write-Host "Step 1: Checking branch..." -ForegroundColor Yellow
git branch --show-current

# Step 2: Switch to feature branch
Write-Host "Step 2: Switching to feature branch..." -ForegroundColor Yellow
git checkout feature

# Step 3: Add all files
Write-Host "Step 3: Adding files..." -ForegroundColor Yellow
git add .

# Step 4: Commit changes
Write-Host "Step 4: Committing changes..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Update EchoGarden project - $timestamp"

# Step 5: Push to GitHub
Write-Host "Step 5: Pushing to GitHub..." -ForegroundColor Yellow
git push origin feature

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "SUCCESS! Project uploaded to GitHub!" -ForegroundColor Green
Write-Host "Repository: https://github.com/FredEcho/EchoGarden" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/FredEcho/EchoGarden/settings/pages" -ForegroundColor White
Write-Host "2. Set Source to 'GitHub Actions'" -ForegroundColor White
Write-Host "3. Click Save" -ForegroundColor White
Write-Host "4. Wait 5-10 minutes for deployment" -ForegroundColor White
Write-Host "5. Visit: https://fredecho.github.io/EchoGarden/" -ForegroundColor White
Write-Host ""
Write-Host "Your website will be live in 5-10 minutes! 🎉" -ForegroundColor Green