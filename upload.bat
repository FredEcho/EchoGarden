@echo off
echo Uploading EchoGarden to GitHub...

REM Completely disable pager
set GIT_PAGER=
set PAGER=
set LESS=
set MORE=

REM Configure git to never use pager
git config --global core.pager "" 2>nul
git config --global pager.branch false 2>nul
git config --global pager.log false 2>nul
git config --global pager.status false 2>nul
git config --global pager.diff false 2>nul

echo Checking Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo Git not found!
    pause
    exit /b 1
)
echo Git is available

echo Switching to feature branch...
git checkout feature >nul 2>&1 || git checkout -b feature >nul 2>&1

echo Checking for changes...
git status --porcelain >nul 2>&1
if errorlevel 1 (
    echo No changes to commit
    pause
    exit /b 0
)

echo Found changes, committing...
git add . >nul 2>&1
git commit -m "Update EchoGarden project" >nul 2>&1

echo Pushing to GitHub...
git push origin feature >nul 2>&1
if errorlevel 1 (
    echo Trying force push...
    git push -f origin feature >nul 2>&1
    if errorlevel 1 (
        echo Upload failed!
        echo Check your internet connection and GitHub credentials.
        pause
        exit /b 1
    )
)

echo SUCCESS! Project uploaded to GitHub!
echo Repository: https://github.com/FredEcho/EchoGarden
echo Feature branch: https://github.com/FredEcho/EchoGarden/tree/feature
echo.
echo Next steps:
echo 1. Go to: https://github.com/FredEcho/EchoGarden/settings/pages
echo 2. Set Source to 'GitHub Actions'
echo 3. Wait 5-10 minutes for deployment
echo 4. Visit: https://fredecho.github.io/EchoGarden/
echo.
pause
