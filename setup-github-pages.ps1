# Setup GitHub Pages for EchoGarden
# This script helps configure the repository for GitHub Pages

Write-Host "🔧 Setting up GitHub Pages for EchoGarden..." -ForegroundColor Green

Write-Host "`n📋 Instructions to configure GitHub Pages:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/FredEcho/EchoGarden/settings/pages" -ForegroundColor White
Write-Host "2. Under 'Source', select 'Deploy from a branch'" -ForegroundColor White
Write-Host "3. Select 'gh-pages' branch" -ForegroundColor White
Write-Host "4. Select '/ (root)' folder" -ForegroundColor White
Write-Host "5. Click 'Save'" -ForegroundColor White

Write-Host "`n🚀 After configuring, run the deployment:" -ForegroundColor Yellow
Write-Host "powershell -ExecutionPolicy Bypass -File deploy-gh-pages.ps1" -ForegroundColor Cyan

Write-Host "`n🌐 Your site will be available at:" -ForegroundColor Green
Write-Host "https://fredecho.github.io/EchoGarden/" -ForegroundColor Cyan

Write-Host "`n⏳ Deployment process:" -ForegroundColor Yellow
Write-Host "1. Builds the React app" -ForegroundColor White
Write-Host "2. Creates/updates gh-pages branch" -ForegroundColor White
Write-Host "3. Pushes built files to gh-pages branch" -ForegroundColor White
Write-Host "4. GitHub Pages serves from gh-pages branch" -ForegroundColor White

Write-Host "`n✅ Ready to deploy!" -ForegroundColor Green
