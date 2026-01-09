@echo off
echo ========================================
echo   BLENDER PATH CONFIGURATION HELPER
echo ========================================
echo.
echo This script will help you find and configure Blender.
echo.

REM Try common Blender locations
set "BLENDER_PATH="

echo Searching for Blender installation...
echo.

if exist "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe" (
    set "BLENDER_PATH=C:\Program Files\Blender Foundation\Blender 4.2\blender.exe"
    echo [FOUND] Blender 4.2
)

if exist "C:\Program Files\Blender Foundation\Blender 4.1\blender.exe" (
    set "BLENDER_PATH=C:\Program Files\Blender Foundation\Blender 4.1\blender.exe"
    echo [FOUND] Blender 4.1
)

if exist "C:\Program Files\Blender Foundation\Blender 4.0\blender.exe" (
    set "BLENDER_PATH=C:\Program Files\Blender Foundation\Blender 4.0\blender.exe"
    echo [FOUND] Blender 4.0
)

if exist "C:\Program Files\Blender Foundation\Blender 3.6\blender.exe" (
    set "BLENDER_PATH=C:\Program Files\Blender Foundation\Blender 3.6\blender.exe"
    echo [FOUND] Blender 3.6
)

if exist "C:\Program Files\Blender Foundation\Blender\blender.exe" (
    set "BLENDER_PATH=C:\Program Files\Blender Foundation\Blender\blender.exe"
    echo [FOUND] Blender (generic path)
)

echo.

if defined BLENDER_PATH (
    echo ========================================
    echo SUCCESS! Found Blender at:
    echo %BLENDER_PATH%
    echo ========================================
    echo.
    echo Testing Blender...
    "%BLENDER_PATH%" --version
    echo.
    echo ========================================
    echo NEXT STEPS:
    echo ========================================
    echo.
    echo Option 1 - Set environment variable (temporary):
    echo   set BLENDER_BIN="%BLENDER_PATH%"
    echo   cd server
    echo   npm run dev
    echo.
    echo Option 2 - Edit server/server.js (permanent):
    echo   Open server/server.js
    echo   Find line 13
    echo   Change BLENDER_BIN to: '%BLENDER_PATH%'
    echo.
    echo Option 3 - Copy this command to set it now:
    echo.
    set BLENDER_BIN=%BLENDER_PATH%
    echo Environment variable set for this session!
    echo Now run: cd server ^&^& npm run dev
    echo.
) else (
    echo ========================================
    echo WARNING: Blender not found automatically
    echo ========================================
    echo.
    echo Please locate blender.exe manually:
    echo 1. Press Win + S
    echo 2. Search for "blender.exe"
    echo 3. Right-click -^> Open file location
    echo 4. Copy the full path
    echo.
    echo Then either:
    echo - Set: set BLENDER_BIN="path\to\blender.exe"
    echo - Or edit server/server.js line 13
    echo.
)

pause
