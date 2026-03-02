@echo off
title AAES - Stopping All Services
echo.
echo  Stopping all AAES services...
echo.

:: Kill Node.js backends
echo  Killing Node.js processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTEN"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo    Killed PID %%a
)

:: Kill Python service
echo  Killing Python service on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTEN"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo    Killed PID %%a
)

:: Kill Vite / React dev server
echo  Killing React/Vite on port 3050...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3050" ^| find "LISTEN"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo    Killed PID %%a
)

echo.
echo  Done. Run start-all.bat to restart.
echo.
pause
