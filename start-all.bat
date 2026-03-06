@echo off
setlocal EnableDelayedExpansion
title AAES - Starting All Services
cd /d "%~dp0"

echo.
echo  =====================================================
echo       AAES - Academic Analytics ^& Evaluation System
echo       One-Click Startup Script
echo  =====================================================
echo.

:: ─── 1. MongoDB ───────────────────────────────────────────────────────────────
echo  [1/5]  MongoDB...
sc query MongoDB >nul 2>&1
if %errorlevel% == 0 (
    sc start MongoDB >nul 2>&1
    echo         Running as Windows service (auto-started)
) else (
    start "AAES-MongoDB" cmd /k "mongod --dbpath C:\data\db"
    echo         Started in new window (mongod)
)
timeout /t 2 /nobreak >nul

:: ─── 2. Ollama AI Engine ─────────────────────────────────────────────────────
echo  [2/5]  Ollama AI Engine...
tasklist /FI "IMAGENAME eq ollama.exe" 2>nul | find /I "ollama.exe" >nul
if %errorlevel% == 0 (
    echo         Already running
) else (
    start "AAES-Ollama" cmd /k "ollama serve"
    echo         Started in new window
)
timeout /t 2 /nobreak >nul

:: ─── 3. Python AI Service (Port 8000) ────────────────────────────────────────
echo  [3/5]  Python AI Service (port 8000)...
start "AAES-Python" cmd /k "cd /d "%~dp0python_service" && .\.venv\Scripts\python main.py"
echo         Started in new window
timeout /t 2 /nobreak >nul

:: ─── 4. Node.js Backend (Port 5000) ──────────────────────────────────────────
echo  [4/5]  Node.js Backend (port 5000)...
start "AAES-Backend" cmd /k "cd /d "%~dp0backend" && node server.js"
echo         Started in new window
timeout /t 3 /nobreak >nul

:: ─── 5. React Frontend (Port 3050) ───────────────────────────────────────────
echo  [5/5]  React Frontend (port 3050)...
start "AAES-Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo         Started in new window
timeout /t 2 /nobreak >nul

:: ─── Done ─────────────────────────────────────────────────────────────────────
echo.
echo  =====================================================
echo   All 5 services launched! Opening browser...
echo  =====================================================
echo.
echo   Frontend  :  http://localhost:3050
echo   Backend   :  http://localhost:5000
echo   Python AI :  http://localhost:8000
echo.
echo  Wait ~10 seconds for all services to initialize,
echo  then open:  http://localhost:3050
echo.

timeout /t 10 /nobreak >nul
start "" "http://localhost:3050"

echo.
echo  Opening MongoDB Compass...
start "" "C:\Users\praka\AppData\Local\MongoDBCompass\MongoDBCompass.exe" "mongodb://127.0.0.1:27017/aaes"

pause
