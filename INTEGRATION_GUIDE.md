# AI Surveillance System - Integration Guide

## Overview

This guide explains how to integrate the Python backend with the React frontend.

## Architecture

```
Frontend (React + Vite)  <-->  Backend (Flask API)  <-->  Detection System
     Port 5173                      Port 5000              (YOLO + Gestures)
```

## Setup Instructions

### 1. Install Backend Dependencies

```bash
# Navigate to project root
cd F:\VS CODE FILES\AI_Survelliance_System

# Install API requirements
pip install -r backend/requirements-api.txt
```

### 2. Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd frontend

# Install npm packages
npm install
```

### 3. Start the Backend API Server

**Option A: Using batch file (Windows)**

```bash
# Double-click START_BACKEND.bat
# OR run from terminal:
START_BACKEND.bat
```

**Option B: Manual start**

```bash
cd backend
python api.py
```

The backend will start on `http://localhost:5000`

### 4. Start the Frontend Development Server

**Option A: Using batch file (Windows)**

```bash
# In a NEW terminal window
# Double-click START_FRONTEND.bat
# OR run from terminal:
START_FRONTEND.bat
```

**Option B: Manual start**

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Video Streaming

- **GET** `/video_feed` - MJPEG video stream with AI annotations

### Statistics

- **GET** `/api/stats` - Real-time detection statistics
  ```json
  {
    "person_count": 2,
    "total_detections": 5,
    "active_alerts": 1,
    "cameras_online": 1
  }
  ```

### Alerts

- **GET** `/api/alerts?max_age=60` - Get recent alerts
  ```json
  {
    "count": 3,
    "alerts": [
      {
        "type": "SOS_GESTURE",
        "severity": 5,
        "description": "SOS gesture detected",
        "timestamp": "2026-01-23T10:30:00"
      }
    ]
  }
  ```

### Cameras

- **GET** `/api/cameras` - Get available cameras
  ```json
  {
    "cameras": [
      {
        "id": "cam_001",
        "name": "Main Camera",
        "status": "online",
        "stream_url": "/video_feed"
      }
    ]
  }
  ```

### Configuration

- **GET** `/api/config` - Get current configuration
- **POST** `/api/config` - Update configuration
  ```json
  {
    "loitering_time": 20,
    "max_persons": 3,
    "crowd_threshold": 5
  }
  ```

### Snapshot

- **GET** `/api/snapshot` - Get current frame as JPEG image

## Frontend Integration

The React frontend automatically connects to the backend API. Key components:

### VideoStream Component

Located at `frontend/src/components/VideoStream.jsx`

- Displays live video feed from `/video_feed`
- Shows connection status
- Handles disconnection gracefully

### Stats Display

The dashboard fetches and displays:

- Person count
- Total detections
- Active alerts count
- Camera status

### Alert Feed

Real-time alerts are fetched from `/api/alerts` and displayed in the sidebar.

## Testing the Integration

1. **Start Backend**: Run `START_BACKEND.bat` or `python backend/api.py`
2. **Verify Backend**: Open `http://localhost:5000` in browser - should see API status
3. **Start Frontend**: Run `START_FRONTEND.bat` or `npm run dev` in frontend folder
4. **Open Dashboard**: Navigate to `http://localhost:5173`
5. **Check Video Feed**: Should see live camera feed with AI annotations
6. **Trigger Alert**: Show SOS gesture (closed fist) to trigger an alert

## Troubleshooting

### "Cannot connect to backend" Error

- Ensure backend is running on port 5000
- Check if camera is accessible
- Verify CORS is enabled (already configured in api.py)

### No Video Stream

- Check camera permissions
- Ensure no other application is using the camera
- Try different camera index in `cv2.VideoCapture(0)` → try 1, 2, etc.

### Port Already in Use

- Backend: Change port in `api.py` (line: `app.run(port=5000)`)
- Frontend: Change port in `vite.config.js` or let Vite auto-assign

### Slow Performance

- Reduce video resolution in detection.py
- Increase frame skip: `configure_detection(frame_skip=2)`
- Lower JPEG quality in api.py

## Production Deployment

For production deployment:

1. **Build Frontend**:

   ```bash
   cd frontend
   npm run build
   ```

2. **Serve Static Files**: Configure Flask to serve the built frontend:

   ```python
   app = Flask(__name__, static_folder='../frontend/dist')
   ```

3. **Use Production Server**: Replace Flask dev server with Gunicorn:

   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 backend.api:app
   ```

4. **Add HTTPS**: Use nginx or Apache as reverse proxy with SSL

## Features

✅ Real-time video streaming with AI annotations
✅ Person detection and tracking
✅ Gesture recognition (SOS, HELP, STOP)
✅ Event-based alert system
✅ Live statistics dashboard
✅ Alert history and logging
✅ Multi-camera support (extensible)
✅ RESTful API design
✅ CORS-enabled for cross-origin requests

## Next Steps

- [ ] Add user authentication to API endpoints
- [ ] Implement WebSocket for real-time alerts push
- [ ] Add database for alert persistence
- [ ] Support multiple camera streams
- [ ] Add recording and playback features
- [ ] Implement zone configuration UI
- [ ] Add mobile app support

---

**Need Help?** Check the API status at `http://localhost:5000` or review the console logs.
