# EchoGarden GitHub Deployment Guide

Write-Host "EchoGarden GitHub Deployment Guide" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

Write-Host "STEP 1: Upload source code to GitHub" -ForegroundColor Yellow
Write-Host "git add ." -ForegroundColor White
Write-Host "git commit -m 'Deploy EchoGarden'" -ForegroundColor White
Write-Host "git push origin main" -ForegroundColor White
Write-Host ""

Write-Host "STEP 2: Build the project" -ForegroundColor Yellow
Write-Host "npm run build:client" -ForegroundColor White
Write-Host ""

Write-Host "STEP 3: Create gh-pages branch" -ForegroundColor Yellow
Write-Host "git checkout --orphan gh-pages" -ForegroundColor White
Write-Host "git rm -rf . --ignore-unmatch" -ForegroundColor White
Write-Host ""

Write-Host "STEP 4: Copy built files" -ForegroundColor Yellow
Write-Host "Copy-Item -Path 'dist/public/*' -Destination '.' -Recurse -Force" -ForegroundColor White
Write-Host "echo '' > .nojekyll" -ForegroundColor White
Write-Host ""

Write-Host "STEP 5: Deploy to gh-pages" -ForegroundColor Yellow
Write-Host "git add ." -ForegroundColor White
Write-Host "git commit -m 'Deploy to GitHub Pages'" -ForegroundColor White
Write-Host "git push origin gh-pages --force" -ForegroundColor White
Write-Host ""

Write-Host "STEP 6: Switch back to main" -ForegroundColor Yellow
Write-Host "git checkout main" -ForegroundColor White
Write-Host ""

Write-Host "STEP 7: Configure GitHub Pages" -ForegroundColor Yellow
Write-Host "Go to: https://github.com/FredEcho/EchoGarden/settings/pages" -ForegroundColor White
Write-Host "Select 'Deploy from a branch'" -ForegroundColor White
Write-Host "Select 'gh-pages' branch" -ForegroundColor White
Write-Host "Select '/ (root)' folder" -ForegroundColor White
Write-Host "Click 'Save'" -ForegroundColor White
Write-Host ""

Write-Host "Your website will be live at:" -ForegroundColor Green
Write-Host "https://fredecho.github.io/EchoGarden/" -ForegroundColor White
Write-Host ""

Write-Host "Ready to deploy! Follow the steps above." -ForegroundColor Green