@echo off
echo 🚀 Starting HyperLiquid Trader Dashboard...

REM Check if .env file exists in backend
if not exist "backend\.env" (
    echo ⚠️  No .env file found in backend directory.
    echo 📝 Please create backend\.env with your ClickHouse credentials:
    echo.
    echo CLICKHOUSE_HOST=your_host
    echo CLICKHOUSE_PORT=8123
    echo CLICKHOUSE_DATABASE=hyperliquid
    echo CLICKHOUSE_USERNAME=your_username
    echo CLICKHOUSE_PASSWORD=your_password
    echo.
    echo 💡 You can copy from backend\env.example
    pause
    exit /b 1
)

REM Start backend
echo 🔧 Starting backend server...
cd backend
call npm install
start "Backend Server" npm run start:dev
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend...
cd frontend
call npm install
start "Frontend Server" npm start
cd ..

echo.
echo ✅ Dashboard started successfully!
echo 🌐 Backend: http://localhost:3000
echo 🎨 Frontend: http://localhost:8080
echo.
echo Both servers are now running in separate windows.
echo Close the windows to stop the servers.
pause
