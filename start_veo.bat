@echo off
echo ===================================================
echo   🚀 STARTING VEO ULTIMATE (BACKEND + FRONTEND)
echo ===================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b
)

:: Navigate to backend
cd backend

:: Check if virtual environment exists, if not ask to install
if not exist venv (
    echo [INFO] Virtual environment not found.
    echo [INFO] Creating venv and installing dependencies...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    echo [INFO] Activating virtual environment...
    call venv\Scripts\activate
)

:: Start Backend in background
echo [INFO] Starting Flask Backend (Port 5001)...
start "Veo Ultimate Backend" python app.py

:: Wait a moment for backend to initialize
timeout /t 3 >nul

:: Open Frontend in default browser
echo [INFO] Opening Frontend in Browser...
cd ..
start frontend\index.html

echo.
echo [SUCCESS] Veo Ultimate is running! 
echo Close the backend command window to stop the server.
echo.
pause
