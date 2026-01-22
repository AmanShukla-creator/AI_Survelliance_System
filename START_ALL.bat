@echo off
echo ========================================================
echo   AI Surveillance System - Quick Start
echo ========================================================
echo.
echo Starting Backend API Server and Frontend...
echo.

start "Backend API" cmd /k "cd backend && python api.py"
timeout /t 3 /nobreak >nul

start "Frontend Dev Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Both servers are starting in separate windows
echo ========================================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo ========================================================
echo.
echo Press any key to exit this window (servers will continue running)
pause >nul
