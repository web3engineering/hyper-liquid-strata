@echo off
echo 🚀 Starting HyperLiquid Dashboard...
echo 📊 Backend will run on port 3004
echo 🌐 Frontend will run on port 3005
echo.

REM Kill any existing processes on these ports
echo 🔄 Stopping any existing processes on ports 3004 and 3005...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🔧 Starting backend (NestJS) on port 3004...
cd backend
start "Backend" npm run start:dev

echo 🎨 Starting frontend (Live Server) on port 3005...
cd ../frontend
start "Frontend" npm run dev

echo.
echo ✅ Dashboard started successfully!
echo 📊 Backend: http://localhost:3004
echo 🌐 Frontend: http://localhost:3005
echo.
echo Press any key to exit...
pause >nul
