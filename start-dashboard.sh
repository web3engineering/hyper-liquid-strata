#!/bin/bash

echo "🚀 Starting HyperLiquid Dashboard..."
echo "📊 Backend will run on port 3004"
echo "🌐 Frontend will run on port 3005"
echo ""

# Kill any existing processes on these ports
echo "🔄 Stopping any existing processes on ports 3004 and 3005..."
pkill -f "nest start" 2>/dev/null || true
pkill -f "live-server.*3005" 2>/dev/null || true

sleep 2

echo "🔧 Starting backend (NestJS) on port 3004..."
cd backend && npm run start:dev &
BACKEND_PID=$!

echo "🎨 Starting frontend (Live Server) on port 3005..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Dashboard started successfully!"
echo "📊 Backend: http://localhost:3004"
echo "🌐 Frontend: http://localhost:3005"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
