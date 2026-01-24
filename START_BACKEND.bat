@echo off
echo ================================================
echo Starting AI Surveillance Backend API Server
echo ================================================
echo.

cd backend
rem Optional: set to RTSP URL or webcam index (0, 1, ...)
rem set CAMERA_SOURCE=rtsp://username:password@192.168.1.50:554/stream1
rem set CAMERA_SOURCE=0
python api.py

pause
