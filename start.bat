@echo off
echo ========================================
echo   Blender Geometry Nodes - React Setup
echo ========================================
echo.

echo [1/4] Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Installing web dependencies...
cd web
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install web dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Setup complete!
echo.
echo [4/4] Starting servers...
echo.
echo Starting backend server on http://localhost:8080
echo Starting frontend dev server on http://localhost:3000
echo.
echo Press Ctrl+C in either window to stop the servers.
echo.
pause

start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak >nul
start "Frontend Server" cmd /k "cd web && npm run dev"

echo.
echo Servers are starting in separate windows...
echo Open http://localhost:3000 in your browser
echo.
