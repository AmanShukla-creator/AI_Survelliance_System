"""
Flask API Server for AI Surveillance System
Render-safe version (no server-side webcam)
"""

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import base64
import cv2
import os
from datetime import datetime
import numpy as np
import threading

try:
    from .detection import detect_objects, draw_enhanced_annotations
    from .gesture_detection import detect_hand_gestures, draw_hand_annotations
    from .alert import process_events, trigger_alerts, get_active_alerts, AlertConfig
except ImportError:
    # Fallback for running from within the backend folder (python api.py)
    from detection import detect_objects, draw_enhanced_annotations
    from gesture_detection import detect_hand_gestures, draw_hand_annotations
    from alert import process_events, trigger_alerts, get_active_alerts, AlertConfig

app = Flask(__name__)
CORS(app)

# =========================
# GLOBAL STATE
# =========================
camera = None
camera_lock = threading.Lock()
frame_lock = threading.Lock()
latest_frame = None
last_ingest_time = None

latest_stats = {
    "person_count": 0,
    "total_detections": 0,
    "active_alerts": 0,
    "gesture_detected": None,
    "timestamp": None
}

DISABLE_CAMERA = os.environ.get("DISABLE_CAMERA", "true").lower() == "true"

# =========================
# CAMERA (LOCAL ONLY)
# =========================
def get_camera():
    if DISABLE_CAMERA:
        return None

    global camera
    with camera_lock:
        if camera is None or not camera.isOpened():
            camera = cv2.VideoCapture(0)
            if not camera.isOpened():
                return None

            camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            camera.set(cv2.CAP_PROP_FPS, 15)
    return camera

# =========================
# UTILS
# =========================
def decode_base64_image(data):
    if not data:
        return None

    if "," in data:
        data = data.split(",", 1)[1]

    try:
        raw = base64.b64decode(data)
        arr = np.frombuffer(raw, np.uint8)
        return cv2.imdecode(arr, cv2.IMREAD_COLOR)
    except Exception:
        return None


def encode_image(frame):
    ret, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
    if not ret:
        return None
    b64 = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


def ingest_online(max_age=5):
    if last_ingest_time is None:
        return False
    return (datetime.now() - last_ingest_time).total_seconds() <= max_age

# =========================
# ROUTES
# =========================
@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "service": "AI Surveillance System API",
        "camera_enabled": not DISABLE_CAMERA
    })


@app.route("/video_feed")
def video_feed():
    return jsonify({
        "success": False,
        "error": "Server-side camera disabled. Use /api/process_frame"
    }), 400


@app.route("/api/process_frame", methods=["POST"])
def process_frame():
    global latest_frame, latest_stats, last_ingest_time

    payload = request.get_json(silent=True) or {}
    image_data = payload.get("image")

    frame = decode_base64_image(image_data)
    if frame is None:
        return jsonify({"success": False, "error": "Invalid image"}), 400

    try:
        detection_result = detect_objects(frame, enable_tracking=False)
        gesture_result = detect_hand_gestures(frame)

        annotated = draw_enhanced_annotations(frame, detection_result)
        annotated = draw_hand_annotations(annotated, gesture_result)

        alert_events = process_events(detection_result, gesture_result)
        if alert_events:
            trigger_alerts(alert_events)

        active_alerts = get_active_alerts(max_age_seconds=10)

        now = datetime.now()
        last_ingest_time = now

        latest_stats = {
            "person_count": detection_result.get("person_count", 0),
            "total_detections": len(detection_result.get("detections", [])),
            "active_alerts": len(active_alerts),
            "gesture_detected": gesture_result.get("stable_gesture"),
            "timestamp": now.isoformat()
        }

        with frame_lock:
            latest_frame = annotated.copy()

        return jsonify({
            "success": True,
            "stats": latest_stats,
            "alerts": len(active_alerts),
            "annotated_image": encode_image(annotated)
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/stats")
def stats():
    return jsonify({
        "success": True,
        "data": latest_stats
    })


@app.route("/api/alerts")
def alerts():
    active = get_active_alerts(max_age_seconds=60)
    return jsonify({
        "success": True,
        "count": len(active),
        "alerts": [
            {
                "type": a.alert_type,
                "severity": a.severity,
                "timestamp": a.timestamp.isoformat()
            } for a in active
        ]
    })


@app.route("/api/cameras")
def cameras():
    return jsonify({
        "success": True,
        "cameras": [{
            "id": "cam_001",
            "status": "online" if ingest_online() else "offline",
            "mode": "browser_ingest"
        }]
    })


@app.route("/api/config", methods=["GET", "POST"])
def config():
    if request.method == "POST":
        data = request.get_json() or {}
        AlertConfig.LOITERING_TIME_THRESHOLD = data.get("loitering_time", AlertConfig.LOITERING_TIME_THRESHOLD)
        AlertConfig.MAX_PERSONS_ALLOWED = data.get("max_persons", AlertConfig.MAX_PERSONS_ALLOWED)
        AlertConfig.CROWD_THRESHOLD = data.get("crowd_threshold", AlertConfig.CROWD_THRESHOLD)
        return jsonify({"success": True})

    return jsonify({
        "success": True,
        "config": {
            "loitering_time": AlertConfig.LOITERING_TIME_THRESHOLD,
            "max_persons": AlertConfig.MAX_PERSONS_ALLOWED,
            "crowd_threshold": AlertConfig.CROWD_THRESHOLD
        }
    })


# =========================
# ENTRY
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
