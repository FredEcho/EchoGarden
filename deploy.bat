@echo off
echo Resetting git configuration and uploading...

REM Remove all pager configurations
git config --global --unset core.pager 2>nul
git config --global --unset pager.branch 2>nul
git config --global --unset pager.log 2>nul
git config --global --unset pager.status 2>nul
git config --global --unset pager.diff 2>nul

echo Git configuration reset complete!

echo Uploading to GitHub...
git checkout feature 2>nul || git checkout -b feature 2>nul
git add .
git commit -m "Update EchoGarden project"
git push origin feature

echo Done!
pause