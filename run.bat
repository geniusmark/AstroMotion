@echo off
title AstroMotion - 3D Celestial Simulator
cd /d "%~dp0"
echo ========================================================
echo   Starting AstroMotion 3D Celestial Simulator...
echo   Folder: %CD%
echo ========================================================
python serve.py
pause
