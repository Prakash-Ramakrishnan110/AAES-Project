@echo off
setlocal enabledelayedexpansion
title AAES Project - Starting...
color 0B

:: Get the directory of this batch file (works from any location)
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo.
echo ==========================================
echo     AAES PROJECT - STARTUP SYSTEM
echo     Academic Assessment & Evaluation
echo ==========================================
echo.

:: ─── Check if setup has been run ──────────────────────────────
if not exist "backend\node_modules" (
    echo [!] Backend not set up yet. Running setup first...
    call setup.bat
)

if not exist "frontend\node_modules" (
    echo [!] Frontend not set up yet. Running setup first...
    call setup.bat
)

:: ─── Start MongoDB (if installed as a service, it auto-starts) ─
echo [0/3] Starting MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo        MongoDB service not found - trying to start manually...
    start "" mongod --dbpath "%ROOT%data\db" >nul 2>&1
)
echo        MongoDB ready!
echo.

:: ─── Start Backend ────────────────────────────────────────────
echo [1/3] Starting Backend (Node.js on port 5000)...
start "AAES Backend" cmd /k "cd /d "%ROOT%backend" && npm run dev"
echo        Backend starting...
echo.

:: ─── Start Frontend ───────────────────────────────────────────
echo [2/3] Starting Frontend (Vite on port 3051)...
start "AAES Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev"
echo        Frontend starting...
echo.

:: ─── Start AI Service ─────────────────────────────────────────
echo [3/3] Starting AI Service (Python on port 8000)...
start "AAES AI Service" cmd /k "cd /d "%ROOT%" && ai_service\.venv\Scripts\python.exe ai_service\main.py"
echo        AI Service starting...
echo.

:: ─── Wait and open browser ────────────────────────────────────
echo Waiting 12 seconds for all services to start...
timeout /t 12 /nobreak >nul

echo Opening application in browser...
start "" "http://localhost:3051"

echo.
echo ==========================================
echo     ALL SYSTEMS RUNNING!
echo.
echo     App:      http://localhost:3051
echo     Backend:  http://localhost:5000
echo     AI Docs:  http://localhost:8000/docs
echo ==========================================
echo.
echo Press any key to exit this window...
echo (Services will keep running in their own windows)
pause >nul
