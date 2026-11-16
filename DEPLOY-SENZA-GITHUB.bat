@echo off
cd /d "%~dp0"
call npm install
if errorlevel 1 pause & exit /b 1
call npx netlify login
if errorlevel 1 pause & exit /b 1
call npx netlify deploy --prod
pause
