@echo off
echo 🚀 Starting Python Chatbot Server...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo Please copy .env.example to .env and configure your API key
    pause
    exit /b 1
)

REM Start server
echo Starting Flask server...
python app.py
