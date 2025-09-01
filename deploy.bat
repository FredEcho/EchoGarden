@echo off
REM EchoGarden Deployment Script for Windows
REM Run this script to deploy changes from Cursor to GitHub

echo 🌱 EchoGarden Deployment Script
echo ================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the EchoGarden project root
    pause
    exit /b 1
)

REM Check git status
echo 📋 Checking git status...
git status

REM Add all changes
echo 📦 Adding all changes...
git add .

REM Get commit message from user or use default
if "%1"=="" (
    for /f "tokens=1-6 delims=/:. " %%a in ('echo %date% %time%') do set TIMESTAMP=%%a-%%b-%%c %%d:%%e:%%f
    set COMMIT_MSG=Update from Cursor - %TIMESTAMP%
) else (
    set COMMIT_MSG=%1
)

REM Commit changes
echo 💾 Committing changes: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push origin main

REM Check if push was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ Successfully deployed to GitHub!
    echo 🌐 Repository: https://github.com/FredEcho/EchoGarden
    echo 📝 Commit: %COMMIT_MSG%
) else (
    echo ❌ Failed to push to GitHub
    pause
    exit /b 1
)

pause
