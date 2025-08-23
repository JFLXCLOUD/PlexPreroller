@echo off
title PlexPreroller (Node.js Version)
color 0A

echo.
echo ========================================
echo    PlexPreroller (Node.js Version)
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this launcher again.
    echo.
    pause
    exit /b 1
)

REM Check if config.env exists
if not exist "config.env" (
    echo ERROR: config.env file not found!
    echo.
    echo Please create a config.env file with your Plex settings:
    echo.
    echo PLEX_BASE_URL=http://localhost:32400
    echo PLEX_TOKEN=your_plex_token_here
    echo ADMIN_API_KEY=your_secure_key_here
    echo PORT=8088
    echo.
    pause
    exit /b 1
)

REM Check if frontend folder exists
if not exist "frontend" (
    echo ERROR: frontend folder not found!
    echo.
    echo Please make sure the frontend folder is in the same directory.
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo Starting PlexPreroller...
echo.
echo The application will be available at: http://localhost:8088
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the application
node main.js

echo.
echo Server stopped. Press any key to exit...
pause > nul
