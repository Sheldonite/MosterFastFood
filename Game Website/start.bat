@echo off
setlocal EnableExtensions
cd /d "%~dp0"

call :check_node
if "%NODE_READY%"=="1" goto start_node

call :offer_node_install
call :check_node
if "%NODE_READY%"=="1" goto start_node

echo.
echo Node.js/npm is still not available.
echo Trying Python as a fallback local server.
echo.
call :start_python
goto end

:check_node
set "NODE_READY=0"
where node >nul 2>nul
if errorlevel 1 goto check_common_node_paths
where npm >nul 2>nul
if errorlevel 1 goto check_common_node_paths
set "NODE_READY=1"
exit /b 0

:check_common_node_paths
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 exit /b 0
where npm >nul 2>nul
if errorlevel 1 exit /b 0
set "NODE_READY=1"
exit /b 0

:offer_node_install
echo Node.js/npm was not found.
echo This project needs Node.js/npm for the easiest local launch.
echo.
where winget >nul 2>nul
if errorlevel 1 (
  echo winget was not found, so this launcher cannot install Node.js automatically.
  echo Install Node.js LTS manually from https://nodejs.org/ and run start.bat again.
  exit /b 1
)

choice /C YN /N /M "Install Node.js LTS now with winget? [Y/N]: "
if errorlevel 2 exit /b 1

echo.
echo Installing Node.js LTS...
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
  echo.
  echo Node.js install failed or was cancelled.
  exit /b 1
)

echo.
echo Node.js install completed.
echo If Windows has not refreshed PATH yet, close this window and run start.bat again.
exit /b 0

:start_node
echo Starting local server with Node.js...
start "" "http://localhost:4173"
npm start
goto end

:start_python
where py >nul 2>nul
if not errorlevel 1 (
  start "" "http://localhost:4173"
  py -m http.server 4173
  goto end
)

where python >nul 2>nul
if not errorlevel 1 (
  start "" "http://localhost:4173"
  python -m http.server 4173
  goto end
)

echo Python was not found either.
echo Opening index.html directly instead.
echo If sprites do not load correctly, install Node.js from https://nodejs.org/
start "" "%~dp0index.html"
goto end

:end
echo.
pause
