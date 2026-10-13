@echo off
TITLE Deploy Smart Parking to Vercel
COLOR 0B
echo ========================================================
echo        SMART PARKING MANAGEMENT SYSTEM - VERCEL DEPLOY
echo ========================================================
echo.

set "PROJECT_DIR=C:\Users\PUJARI ABHIRAM\OneDrive\Desktop\sandeep46"
cd /d "%PROJECT_DIR%"

echo Project Directory: %PROJECT_DIR%
echo.

echo [1/3] Checking Node.js and Vercel CLI...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found on PATH. Please install Node.js first.
    pause
    exit /b 1
)

echo [2/3] Checking Vercel Authentication...
call npx vercel whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ----------------------------------------------------
    echo You are not logged into Vercel yet.
    echo A browser window will open shortly to log into Vercel.
    echo (You can sign in with your GitHub, GitLab, or Email)
    echo ----------------------------------------------------
    echo.
    call npx vercel login
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Vercel login failed or was cancelled.
        pause
        exit /b 1
    )
)

echo.
echo [3/3] Deploying to Vercel Production...
echo ----------------------------------------------------
call npx vercel --prod --yes
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Vercel deployment encountered an issue.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   SUCCESS! Your application is now deployed on Vercel!
echo ========================================================
echo.
pause
