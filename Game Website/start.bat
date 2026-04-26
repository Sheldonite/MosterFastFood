@echo off
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:4173"
  npm start
  pause
  exit /b
)

where winget >nul 2>nul
if %errorlevel%==0 (
  echo Node.js was not found.
  echo This game runs best with Node.js/npm installed.
  echo.
  set /p INSTALL_NODE="Install Node.js LTS with winget now? This downloads software from Microsoft/OpenJS. [Y/N]: "
  if /I "%INSTALL_NODE%"=="Y" (
    winget install -e --id OpenJS.NodeJS.LTS
    echo.
    echo Install finished. If npm is still not found, close this window and run start.bat again.
    where node >nul 2>nul
    if %errorlevel%==0 (
      start "" "http://localhost:4173"
      npm start
      pause
      exit /b
    )
  )
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
