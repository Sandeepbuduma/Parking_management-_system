@echo off
title Smart Parking Management System - Launcher
color 0A

echo ========================================================
echo    STARTING SMART PARKING MANAGEMENT SYSTEM
echo ========================================================
echo.

set "PROJECT_DIR=C:\Users\PUJARI ABHIRAM\OneDrive\Desktop\sandeep46"

:: 1. Check MySQL Service
echo [1/3] Verifying MySQL Database Service...
sc query MySQL80 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo Starting MySQL80 service...
    net start MySQL80 >nul 2>&1
)
echo MySQL Database is ready.
echo.

:: 2. Launch Backend in a separate window
echo [2/3] Starting Spring Boot Backend (port 8080)...
start "Smart Parking - Backend" cmd /k "cd /d "%PROJECT_DIR%\backend" && mvnw.cmd spring-boot:run"

:: 3. Launch Frontend in a separate window
echo [3/3] Starting React Vite Frontend (port 5173)...
start "Smart Parking - Frontend" cmd /k "cd /d "%PROJECT_DIR%\frontend" && npm run dev"

:: 4. Wait and open default browser
echo.
echo Initializing servers... opening application in browser in 6 seconds...
timeout /t 6 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================================
echo  Smart Parking System is now running!
echo  URL: http://localhost:5173
echo ========================================================
echo.
timeout /t 3 >nul
exit
