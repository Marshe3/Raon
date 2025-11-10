#!/bin/bash

echo "🚀 Starting Python Chatbot Server..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Please copy .env.example to .env and configure your API key"
    exit 1
fi

# Start server
echo "Starting Flask server..."
python app.py
