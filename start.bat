@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    AAES PROJECT UNIFIED STARTUP SYSTEM
echo    (C) 2026 SYSTEM ARCHITECTURE
echo ==========================================
echo.

:: 1. Start MongoDB Compass
echo [0/3] Opening MongoDB Compass Interface...
start "" "C:\Users\praka\AppData\Local\MongoDBCompass\app-1.49.4\MongoDBCompass.exe" --no-sandbox --disable-gpu
echo.

:: 2. Start Backend
echo [1/3] Initializing Node KERNEL (Backend)...
start "AAES Backend" cmd /k "cd backend && npm run dev"

:: 3. Start Frontend
echo [2/3] Launching Neural Interface (Frontend)...
start "AAES Frontend" cmd /k "cd frontend && npm run dev"

:: 4. Start AI Service
echo [3/3] Activating Intelligence Layer (Python)...
start "AAES AI Service" cmd /k "call .venv\Scripts\activate && cd ai_service && python main.py"

echo.
echo Waiting for services to warm up (10s)...
timeout /t 10 /nobreak > nul

:: 5. Open Chrome with all dashboards
echo Opening dynamic dashboards in Chrome...
:: Note: Removed port 8081 as it was for the Docker dashboard.
:: Added port 5000 for backend home page (shows system stats)
start chrome "http://localhost:3051" "http://localhost:5000" "http://localhost:8000/docs"

echo.
echo ==========================================
echo    ALL SYSTEMS ARE OPERATIONAL
echo ==========================================
echo.
pause
