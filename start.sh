#!/bin/bash

# Exit on error
set -e

# Function to handle script exit
cleanup() {
    echo "Stopping all services..."
    # Kill child processes (background jobs)
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) to cleanup
trap cleanup SIGINT

echo "🚀 Initializing Takeat Project..."

# 1. Start Database
echo "🐘 Starting PostgreSQL container..."
docker-compose up -d

# Wait for DB to be ready
echo "⏳ Waiting for Database to be ready..."
sleep 5

# 2. Setup Backend
echo "🔙 Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
else 
    echo "📦 Backend dependencies already installed."
fi

echo "🌱 Running Backend Seeds..."
npm run seed

echo "🚀 Starting Backend Server..."
npm run dev &
BACKEND_PID=$!
cd ..

# 3. Setup Frontend
echo "🎨 Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "📦 Frontend dependencies already installed."
  fi

echo "🚀 Starting Frontend..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo "📡 Backend running on http://localhost:3001"
echo "💻 Frontend running on http://localhost:3000"
echo "Press Ctrl+C to stop all services."

# Wait for processes to keep the script running
wait $BACKEND_PID $FRONTEND_PID
