# GitHub Pages Configuration Helper
# This script helps you configure GitHub Pages properly

Write-Host "🔧 GitHub Pages Configuration Helper" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "`n📋 Follow these steps to configure GitHub Pages:" -ForegroundColor Yellow

Write-Host "`n1️⃣ Go to your repository settings:" -ForegroundColor Cyan
Write-Host "   https://github.com/FredEcho/EchoGarden/settings/pages" -ForegroundColor White

Write-Host "`n2️⃣ Configure the source:" -ForegroundColor Cyan
Write-Host "   • Under 'Source', select 'Deploy from a branch'" -ForegroundColor White
Write-Host "   • Select 'gh-pages' branch" -ForegroundColor White
Write-Host "   • Select '/ (root)' folder" -ForegroundColor White
Write-Host "   • Click 'Save'" -ForegroundColor White

Write-Host "`n3️⃣ Wait for deployment:" -ForegroundColor Cyan
Write-Host "   • GitHub will show 'Your site is published at...'" -ForegroundColor White
Write-Host "   • It may take 2-3 minutes to be visible" -ForegroundColor White

Write-Host "`n4️⃣ Your website will be available at:" -ForegroundColor Cyan
Write-Host "   https://fredecho.github.io/EchoGarden/" -ForegroundColor Green

Write-Host "`n🚀 After configuring, run the deployment:" -ForegroundColor Yellow
Write-Host "   powershell -ExecutionPolicy Bypass -File deploy-to-github-pages.ps1" -ForegroundColor White

Write-Host "`n✅ That's it! Your EchoGarden website will be live!" -ForegroundColor Green
