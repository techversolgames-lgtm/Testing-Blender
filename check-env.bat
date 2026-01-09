@echo off
echo ========================================
echo   Environment Check
echo ========================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo.

REM Check npm
echo [2/5] Checking npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not found in PATH
    pause
    exit /b 1
)
npm --version
echo.

REM Check Blender
echo [3/5] Checking Blender...
where blender >nul 2>&1
if errorlevel 1 (
    echo WARNING: Blender not found in PATH
    echo You can either:
    echo   1. Add Blender to your PATH
    echo   2. Set BLENDER_BIN environment variable
    echo   Example: set BLENDER_BIN="C:\Program Files\Blender Foundation\Blender 3.6\blender.exe"
    echo.
    echo Continuing anyway...
) else (
    blender --version 2>&1 | findstr /C:"Blender"
)
echo.

REM Check blend file
echo [4/5] Checking GN_test.blend...
if exist "GN_test.blend" (
    echo Found: GN_test.blend
) else (
    echo WARNING: GN_test.blend not found
    echo Make sure you have a .blend file with Geometry Nodes
    echo You can set BLEND_FILE environment variable to specify a different file
)
echo.

REM Check if dependencies are installed
echo [5/5] Checking dependencies...
if exist "server\node_modules" (
    echo Backend dependencies: INSTALLED
) else (
    echo Backend dependencies: NOT INSTALLED
)

if exist "web\node_modules" (
    echo Frontend dependencies: INSTALLED
) else (
    echo Frontend dependencies: NOT INSTALLED
)
echo.

echo ========================================
echo   Environment check complete
echo ========================================
echo.
pause
