"""
Flask API Server for AI Surveillance System
Production-safe version (browser camera ingestion)
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import base64
import cv2
import os
from datetime import datetime
import numpy as np
import threading

# -------------------------
# IMPORTS (safe for local + prod)
# -------------------------
try:
    from detection import detect_objects, draw_enhanced_annotations
    from gesture_detection import detect_hand_gestures, draw_hand_annotations
    from alert import (
        process_events,
        trigger_alerts,
        get_active_alerts,
        AlertConfig,
    )
except Exception as e:
    print("❌ Import error:", e)
    raise

# -------------------------
# APP SETUP
# -------------------------
app = Flask(__name__)
CORS(app)

# -------------------------
# GLOBAL STATE
# -------------------------
frame_lock = threading.Lock()
latest_frame = None
last_ingest_time = None

latest_stats = {
    "person_count": 0,
    "total_detections": 0,
    "active_alerts": 0,
    "gesture_detected": None,
    "timestamp": None,
}

# Explicitly disable server-side camera in cloud
DISABLE_CAMERA = os.environ.get("DISABLE_CAMERA", "true").lower() == "true"

# -------------------------
# UTILS
# -------------------------
def decode_base64_image(data: str):
    """Decode base64 image from browser"""
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
    """Encode OpenCV frame to base64 JPEG"""
    try:
        ret, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if not ret:
            return None
        return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode()}"
    except Exception:
        return None


def ingest_online(max_age=5):
    """Check if browser is actively sending frames"""
    if last_ingest_time is None:
        return False
    return (datetime.now() - last_ingest_time).total_seconds() <= max_age


# -------------------------
# ROUTES
# -------------------------
@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "service": "AI Surveillance System API",
        "camera_mode": "browser_ingest",
        "camera_enabled": not DISABLE_CAMERA,
        "time": datetime.now().isoformat(),
    })


@app.route("/video_feed")
def video_feed():
    return jsonify({
        "success": False,
        "error": "Server-side camera disabled. Use /api/process_frame",
    }), 400


@app.route("/api/process_frame", methods=["POST"])
def process_frame():
    """
    Receive a base64 image from frontend camera,
    run AI detection, return annotated image + stats
    """
    global latest_frame, latest_stats, last_ingest_time

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"success": False, "error": "Invalid JSON payload"}), 400

    image_data = payload.get("image")
    if not image_data:
        return jsonify({"success": False, "error": "Missing image"}), 400

    frame = decode_base64_image(image_data)
    if frame is None:
        return jsonify({"success": False, "error": "Invalid image"}), 400

    # -------------------------
    # AI PIPELINE (safe guarded)
    # -------------------------
    try:
        detection_result = detect_objects(frame, enable_tracking=False)
    except Exception:
        detection_result = {"person_count": 0, "detections": []}

    try:
        gesture_result = detect_hand_gestures(frame)
    except Exception:
        gesture_result = {"stable_gesture": None}

    annotated = draw_enhanced_annotations(frame, detection_result)
    annotated = draw_hand_annotations(annotated, gesture_result)

    # -------------------------
    # ALERTS
    # -------------------------
    try:
        events = process_events(detection_result, gesture_result)
        if events:
            trigger_alerts(events)
        active_alerts = get_active_alerts(max_age_seconds=10)
    except Exception:
        active_alerts = []

    now = datetime.now()
    last_ingest_time = now

    latest_stats = {
        "person_count": detection_result.get("person_count", 0),
        "total_detections": len(detection_result.get("detections", [])),
        "active_alerts": len(active_alerts),
        "gesture_detected": gesture_result.get("stable_gesture"),
        "timestamp": now.isoformat(),
    }

    with frame_lock:
        latest_frame = annotated.copy()

    return jsonify({
        "success": True,
        "stats": latest_stats,
        "alerts": len(active_alerts),
        "annotated_image": encode_image(annotated),
    })


@app.route("/api/stats")
def stats():
    return jsonify({
        "success": True,
        "data": {
            **latest_stats,
            "timestamp": latest_stats.get("timestamp") or datetime.now().isoformat(),
        },
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
                "timestamp": a.timestamp.isoformat(),
            }
            for a in active
        ],
    })


@app.route("/api/cameras")
def cameras():
    return jsonify({
        "success": True,
        "cameras": [
            {
                "id": "cam_001",
                "status": "online" if ingest_online() else "offline",
                "mode": "browser_ingest",
            }
        ],
    })


@app.route("/api/config", methods=["GET", "POST"])
def config():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        AlertConfig.LOITERING_TIME_THRESHOLD = data.get(
            "loitering_time", AlertConfig.LOITERING_TIME_THRESHOLD
        )
        AlertConfig.MAX_PERSONS_ALLOWED = data.get(
            "max_persons", AlertConfig.MAX_PERSONS_ALLOWED
        )
        AlertConfig.CROWD_THRESHOLD = data.get(
            "crowd_threshold", AlertConfig.CROWD_THRESHOLD
        )
        return jsonify({"success": True})

    return jsonify({
        "success": True,
        "config": {
            "loitering_time": AlertConfig.LOITERING_TIME_THRESHOLD,
            "max_persons": AlertConfig.MAX_PERSONS_ALLOWED,
            "crowd_threshold": AlertConfig.CROWD_THRESHOLD,
        },
    })


# -------------------------
# ENTRY POINT
# -------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("==========================================")
    print("AI Surveillance System API")
    print("Mode: Browser Camera Ingest")
    print(f"Running on port {port}")
    print("==========================================")
    app.run(host="0.0.0.0", port=port)
