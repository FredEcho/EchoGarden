# GitHub Project Upload Instructions
# Complete guide to upload a project to GitHub

Write-Host "📋 GitHub Project Upload Instructions" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. INITIAL SETUP (First time only):" -ForegroundColor Yellow
Write-Host "   a) Create a new repository on GitHub.com" -ForegroundColor White
Write-Host "   b) Copy the repository URL (e.g., https://github.com/username/project.git)" -ForegroundColor White
Write-Host "   c) Initialize git in your project folder:" -ForegroundColor White
Write-Host "      git init" -ForegroundColor Gray
Write-Host "   d) Add the remote repository:" -ForegroundColor White
Write-Host "      git remote add origin https://github.com/username/project.git" -ForegroundColor Gray
Write-Host ""

Write-Host "2. UPLOAD YOUR PROJECT:" -ForegroundColor Yellow
Write-Host "   a) Add all files to staging:" -ForegroundColor White
Write-Host "      git add ." -ForegroundColor Gray
Write-Host "   b) Create your first commit:" -ForegroundColor White
Write-Host "      git commit -m 'Initial commit'" -ForegroundColor Gray
Write-Host "   c) Push to GitHub:" -ForegroundColor White
Write-Host "      git push -u origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "3. SUBSEQUENT UPDATES:" -ForegroundColor Yellow
Write-Host "   a) Add changes:" -ForegroundColor White
Write-Host "      git add ." -ForegroundColor Gray
Write-Host "   b) Commit changes:" -ForegroundColor White
Write-Host "      git commit -m 'Your commit message'" -ForegroundColor Gray
Write-Host "   c) Push changes:" -ForegroundColor White
Write-Host "      git push origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "4. IMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host "   - Replace 'username/project' with your actual GitHub username and repository name" -ForegroundColor White
Write-Host "   - Make sure you have Git installed on your system" -ForegroundColor White
Write-Host "   - You may need to authenticate with GitHub (use Personal Access Token)" -ForegroundColor White
Write-Host "   - If you get authentication errors, set up SSH keys or use GitHub CLI" -ForegroundColor White
Write-Host ""

Write-Host "5. ALTERNATIVE: Using GitHub CLI (if installed):" -ForegroundColor Yellow
Write-Host "   gh repo create project-name --public" -ForegroundColor Gray
Write-Host "   git remote add origin https://github.com/username/project-name.git" -ForegroundColor Gray
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Initial commit'" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Instructions complete! Follow these steps to upload your project to GitHub." -ForegroundColor Green
