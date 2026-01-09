@echo off
echo ========================================
echo   BLENDER FILE VALIDATION
echo ========================================
echo.
echo This script tests if your Blender file works with the system.
echo.

set "BLEND_FILE=GN_test.blend"
set "BLENDER_BIN=C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
set "BLENDER_SCRIPT=blender\gn_worker.py"

echo Configuration:
echo   Blender: %BLENDER_BIN%
echo   File: %BLEND_FILE%
echo   Script: %BLENDER_SCRIPT%
echo.

if not exist "%BLEND_FILE%" (
    echo ERROR: %BLEND_FILE% not found!
    echo.
    echo Please make sure you have a .blend file in the root directory.
    pause
    exit /b 1
)

if not exist "%BLENDER_BIN%" (
    echo ERROR: Blender not found at: %BLENDER_BIN%
    echo.
    echo Please edit this script (test-blender.bat) and set the correct path.
    pause
    exit /b 1
)

echo ========================================
echo TEST 1: Can Blender run?
echo ========================================
"%BLENDER_BIN%" --version
if errorlevel 1 (
    echo FAILED!
    pause
    exit /b 1
)
echo PASSED!
echo.

echo ========================================
echo TEST 2: Can Blender open the file?
echo ========================================
"%BLENDER_BIN%" --background "%BLEND_FILE%" --python-expr "import bpy; print('File opened successfully')"
if errorlevel 1 (
    echo FAILED!
    pause
    exit /b 1
)
echo PASSED!
echo.

echo ========================================
echo TEST 3: Schema extraction
echo ========================================
echo Running: blender --background "%BLEND_FILE%" --python "%BLENDER_SCRIPT%" -- --mode=schema
echo.
"%BLENDER_BIN%" --background "%BLEND_FILE%" --python "%BLENDER_SCRIPT%" -- --mode=schema
if errorlevel 1 (
    echo.
    echo FAILED!
    echo.
    echo This means your .blend file might not have:
    echo   1. A mesh object
    echo   2. A Geometry Nodes modifier
    echo   3. Exposed Group Inputs
    echo.
    pause
    exit /b 1
)
echo.
echo PASSED!
echo.

echo ========================================
echo TEST 4: Mesh generation
echo ========================================
echo Running: blender --background "%BLEND_FILE%" --python "%BLENDER_SCRIPT%" -- --mode=mesh
echo.
"%BLENDER_BIN%" --background "%BLEND_FILE%" --python "%BLENDER_SCRIPT%" -- --mode=mesh > test_output.bin
if errorlevel 1 (
    echo FAILED!
    pause
    exit /b 1
)

if exist test_output.bin (
    for %%A in (test_output.bin) do set size=%%~zA
    echo PASSED! Generated %size% bytes
    del test_output.bin
) else (
    echo FAILED! No output generated
    pause
    exit /b 1
)
echo.

echo ========================================
echo ALL TESTS PASSED!
echo ========================================
echo.
echo Your Blender file appears to be working correctly.
echo.
echo If you're still seeing errors:
echo   1. Check the backend server terminal for detailed logs
echo   2. Check browser console (F12) for frontend errors
echo   3. Make sure both servers are running
echo.
pause
