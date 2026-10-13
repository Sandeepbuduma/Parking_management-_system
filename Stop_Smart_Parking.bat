@echo off
title Stop Smart Parking Management System
color 0C

echo ========================================================
echo    STOPPING SMART PARKING MANAGEMENT SYSTEM
echo ========================================================
echo.

echo Terminating servers running on port 8080 and 5173...

for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    echo Stopping process on port 8080 (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo Stopping process on port 5173 (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ========================================================
echo  All Smart Parking servers have been stopped.
echo ========================================================
echo.
timeout /t 3 >nul
exit
