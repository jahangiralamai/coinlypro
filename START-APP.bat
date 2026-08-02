@echo off
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║    Ads Rewards - Coinly Pro Startup Script            ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Kill any existing node and python processes
echo Cleaning up old processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
timeout /t 1 /nobreak >nul

REM Start Backend Server
echo.
echo 🚀 Starting Backend Server on port 5000...
echo.
start "Ads Rewards Backend - Node.js" cmd /k "cd /d "%~dp0" && node server/index.js"
timeout /t 2 /nobreak >nul

REM Start Frontend Server
echo 🌐 Starting Frontend Server on port 8080...
echo.
start "Ads Rewards Frontend - Python" cmd /k "cd /d "%~dp0" && python -m http.server 8080"
timeout /t 2 /nobreak >nul

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║           ✅ Servers Started Successfully!             ║
echo ╠════════════════════════════════════════════════════════╣
echo ║  Backend:  http://localhost:5000                       ║
echo ║  Frontend: http://localhost:8080                       ║
echo ║                                                        ║
echo ║  📱 Open your browser and go to:                       ║
echo ║     http://localhost:8080                              ║
echo ║                                                        ║
echo ║  🛑 To stop: Close both terminal windows               ║
echo ╚════════════════════════════════════════════════════════╝
echo.
pause
