@echo off
setlocal enabledelayedexpansion
title AAES Project - First Time Setup
color 0A

echo.
echo ============================================================
echo     AAES PROJECT - FIRST TIME SETUP
echo     Academic Assessment and Evaluation System
echo ============================================================
echo.

:: ─── Check Node.js ───────────────────────────────────────────
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js NOT found!
    echo         Please install Node.js from: https://nodejs.org
    echo         Then run this script again.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo        Node.js found: %%i
)

:: ─── Check Python ─────────────────────────────────────────────
echo [2/5] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python NOT found!
    echo         Please install Python 3.10+ from: https://python.org
    echo         Make sure to check "Add Python to PATH" during install.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do echo        Python found: %%i
)

:: ─── Check MongoDB ────────────────────────────────────────────
echo [3/5] Checking MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB not found in PATH.
    echo           Make sure MongoDB is installed and running.
    echo           Download: https://mongodb.com/try/download/community
) else (
    for /f "tokens=*" %%i in ('mongod --version') do echo        MongoDB found: %%i
)

:: ─── Install Backend Node Modules ─────────────────────────────
echo.
echo [4/5] Installing Backend dependencies (npm install)...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend npm install failed!
    pause
    exit /b 1
)
cd ..
echo        Backend dependencies installed successfully!

:: ─── Install Frontend Node Modules ────────────────────────────
echo.
echo        Installing Frontend dependencies (npm install)...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend npm install failed!
    pause
    exit /b 1
)
cd ..
echo        Frontend dependencies installed successfully!

:: ─── Setup Python Virtual Environment ─────────────────────────
echo.
echo [5/5] Setting up Python AI service...
if exist ai_service\.venv (
    echo        Python virtual environment already exists. Skipping creation.
) else (
    python -m venv ai_service\.venv
    echo        Virtual environment created.
)

echo        Installing Python packages...
call ai_service\.venv\Scripts\pip.exe install -r ai_service\requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Python pip install failed!
    echo        Try running: pip install -r ai_service\requirements.txt manually
    pause
    exit /b 1
)
echo        Python AI service ready!

:: ─── Check .env file ──────────────────────────────────────────
echo.
if not exist backend\.env (
    echo [!] Creating default backend\.env file...
    (
        echo MONGO_URI=mongodb://localhost:27017/aaes
        echo JWT_SECRET=aaes_super_secret_key_2026
        echo PORT=5000
        echo NODE_ENV=development
    ) > backend\.env
    echo        .env file created at backend\.env
    echo        Edit it if your MongoDB uses a different URL.
) else (
    echo        backend\.env already exists. Skipping.
)

:: ─── Check Ollama ─────────────────────────────────────────────
echo.
echo [*] Checking Ollama AI engine...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Ollama not found!
    echo           AI Notes chat won't work without Ollama.
    echo           Install from: https://ollama.com/download
    echo           Then run: ollama pull gemma3:1b
) else (
    echo        Ollama found! Pulling AI model (gemma3:1b)...
    ollama pull gemma3:1b
    echo        AI model ready!
)

:: ─── Done ─────────────────────────────────────────────────────
echo.
echo ============================================================
echo     SETUP COMPLETE!
echo     Now run:  start.bat   to launch the project
echo ============================================================
echo.
pause
