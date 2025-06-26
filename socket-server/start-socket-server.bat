@echo off
echo Starting DDS Portal Socket.IO Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the socket-server directory
if not exist package.json (
    echo ERROR: package.json not found
    echo Please make sure you're running this from the socket-server directory
    pause
    exit /b 1
)

REM Check if .env exists, create from example if not
if not exist .env (
    if exist config.example (
        echo Creating .env from config.example...
        copy config.example .env
        echo.
        echo IMPORTANT: Please edit .env file with your database credentials
        echo Press any key to continue after editing .env file...
        pause
    ) else (
        echo ERROR: No .env file found and no config.example to copy from
        pause
        exit /b 1
    )
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

echo Starting Socket.IO server...
echo Press Ctrl+C to stop the server
echo.
npm start 