#!/bin/bash

echo "🚀 Starting HyperLiquid Trader Dashboard..."

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No .env file found in backend directory."
    echo "📝 Please create backend/.env with your ClickHouse credentials:"
    echo ""
    echo "CLICKHOUSE_HOST=your_host"
    echo "CLICKHOUSE_PORT=8123"
    echo "CLICKHOUSE_DATABASE=hyperliquid"
    echo "CLICKHOUSE_USERNAME=your_username"
    echo "CLICKHOUSE_PASSWORD=your_password"
    echo ""
    echo "💡 You can copy from backend/env.example"
    exit 1
fi

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm install
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Dashboard started successfully!"
echo "🌐 Backend: http://localhost:3000"
echo "🎨 Frontend: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT

# Wait for both processes
wait
