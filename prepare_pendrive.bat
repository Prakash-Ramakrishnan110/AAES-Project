@echo off
setlocal enabledelayedexpansion
title AAES - Preparing Pendrive Package...
color 0E

set "ROOT=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"
set "OUTPUT=%DESKTOP%\PENDRIVE_READY"

echo.
echo ============================================================
echo     AAES PROJECT - PENDRIVE PACKAGE CREATOR
echo     This will create a ready-to-copy folder on Desktop
echo ============================================================
echo.

:: ─── Clean old output ─────────────────────────────────────────
if exist "%OUTPUT%" (
    echo [!] Old PENDRIVE_READY folder found. Deleting...
    rmdir /s /q "%OUTPUT%"
)

mkdir "%OUTPUT%"
mkdir "%OUTPUT%\Installers"
mkdir "%OUTPUT%\AAES-Project"

echo [1/4] Copying AAES-Project (excluding node_modules and .venv)...
echo       This may take a minute...

:: Use robocopy to exclude heavy folders
robocopy "%ROOT:~0,-1%" "%OUTPUT%\AAES-Project" /E /XD node_modules .venv .git __pycache__ dist build /XF *.pyc *.pyo *.log /NFL /NDL /NJH /NJS /nc /ns /np

echo       Project copied!
echo.

:: ─── Copy Ollama models ───────────────────────────────────────
echo [2/4] Copying Ollama AI models (this may take a while ~815MB)...
if exist "%USERPROFILE%\.ollama" (
    echo       Found .ollama folder. Copying...
    robocopy "%USERPROFILE%\.ollama" "%OUTPUT%\ollama_models" /E /NFL /NDL /NJH /NJS /nc /ns /np
    echo       Ollama models copied!
) else (
    echo       [SKIP] .ollama folder not found. Staff will need to download the model.
)
echo.

:: ─── Create Installers download guide ────────────────────────
echo [3/4] Creating Installers download links file...
(
    echo ============================================================
    echo  REQUIRED INSTALLERS - Download and put in this folder
    echo ============================================================
    echo.
    echo  1. Node.js v20 LTS ^(Windows x64^)
    echo     Download: https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi
    echo     Save as : node-v20-x64.msi
    echo.
    echo  2. Python 3.11 ^(Windows x64^)
    echo     Download: https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
    echo     Save as : python-3.11.exe
    echo     IMPORTANT: During install check "Add Python to PATH"
    echo.
    echo  3. MongoDB Community Server v7
    echo     Download: https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.14-signed.msi
    echo     Save as : mongodb-installer.msi
    echo.
    echo  4. Ollama ^(Local AI Engine^)
    echo     Download: https://ollama.com/download/OllamaSetup.exe
    echo     Save as : OllamaSetup.exe
    echo     NOTE: If ollama_models folder exists in pendrive, skip this.
    echo.
    echo ============================================================
    echo  INSTALL ORDER: Node.js → Python → MongoDB → Ollama
    echo ============================================================
) > "%OUTPUT%\Installers\DOWNLOAD_THESE_FIRST.txt"

:: ─── Create root instruction note ────────────────────────────
echo [4/4] Creating pendrive root instruction file...
(
    echo ============================================================
    echo  AAES PROJECT - PENDRIVE PACKAGE
    echo  Academic Assessment ^& Evaluation System
    echo ============================================================
    echo.
    echo  CONTENTS OF THIS PENDRIVE:
    echo.
    echo   [1] AAES-Project\         = The main project code
    echo   [2] Installers\           = Required software installers
    echo   [3] ollama_models\        = AI model ^(copy to C:\Users\^<name^>\.ollama^)
    echo   [4] STAFF_SETUP_GUIDE.txt = Full step-by-step instructions
    echo   [5] HOW_TO_USE.txt        = This file
    echo.
    echo ============================================================
    echo  QUICK START:
    echo ============================================================
    echo.
    echo  Step 1: Install all software from "Installers\" folder
    echo  Step 2: Copy "ollama_models" folder contents to:
    echo             C:\Users\^<your-username^>\.ollama\
    echo  Step 3: Copy "AAES-Project" folder to your Desktop
    echo  Step 4: Open "AAES-Project" folder
    echo  Step 5: Double-click  setup.bat   ^(first time only^)
    echo  Step 6: Double-click  start.bat   ^(every time to launch^)
    echo  Step 7: Browser opens at http://localhost:3051
    echo.
    echo  Read STAFF_SETUP_GUIDE.txt for full details.
    echo ============================================================
) > "%OUTPUT%\HOW_TO_USE.txt"

:: Copy the staff guide to pendrive root
copy "%ROOT%STAFF_SETUP_GUIDE.txt" "%OUTPUT%\STAFF_SETUP_GUIDE.txt" >nul

:: ─── Done ─────────────────────────────────────────────────────
echo.
echo ============================================================
echo     PENDRIVE PACKAGE READY!
echo.
echo     Location: %OUTPUT%
echo.
echo     FOLDER STRUCTURE:
echo     PENDRIVE_READY\
echo       AAES-Project\        (project code)
echo       Installers\          (download guide inside)
echo       ollama_models\       (AI model - if found)
echo       STAFF_SETUP_GUIDE.txt
echo       HOW_TO_USE.txt
echo.
echo     NEXT STEPS:
echo     1. Download installers and put them in Installers\ folder
echo     2. Copy entire PENDRIVE_READY folder to your pendrive
echo     3. Give pendrive to staff with STAFF_SETUP_GUIDE.txt
echo ============================================================
echo.

:: Open the output folder in Windows Explorer
explorer "%OUTPUT%"

pause
