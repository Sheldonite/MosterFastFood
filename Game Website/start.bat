@echo off
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:4173"
  npm start
  pause
  exit /b
)

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:4173"
  py -m http.server 4173
  pause
  exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:4173"
  python -m http.server 4173
  pause
  exit /b
)

echo Node.js or Python was not found.
echo Opening index.html directly instead.
echo If sprites do not load correctly, install Node.js from https://nodejs.org/
start "" "%~dp0index.html"
pause
