@echo off
echo Resetting git configuration to remove pager...

REM Remove all pager configurations
git config --global --unset core.pager 2>nul
git config --global --unset pager.branch 2>nul
git config --global --unset pager.log 2>nul
git config --global --unset pager.status 2>nul
git config --global --unset pager.diff 2>nul

REM Clear environment variables
set GIT_PAGER=
set PAGER=
set LESS=
set MORE=

echo Git configuration reset complete!
echo Pager settings removed!
pause
