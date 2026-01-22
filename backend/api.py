"""
Flask API Server for AI Surveillance System
Integrates with React frontend for real-time video streaming and alerts
"""

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import json
from datetime import datetime
import threading
import time

from detection import detect_objects, draw_enhanced_annotations, configure_detection
from gesture_detection import detect_hand_gestures, draw_hand_annotations
from alert import process_events, trigger_alerts, get_active_alerts, AlertConfig

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global variables for video streaming
camera = None
camera_lock = threading.Lock()
latest_frame = None
latest_stats = {
    'person_count': 0,
    'total_detections': 0,
    'active_alerts': 0,
    'gesture_detected': None
}

# Configure detection (optional)
# configure_detection(conf_threshold=0.6, target_classes=[0], frame_skip=1)


def get_camera():
    """Initialize camera if not already initialized"""
    global camera
    with camera_lock:
        if camera is None or not camera.isOpened():
            camera = cv2.VideoCapture(0)
            if not camera.isOpened():
                print("❌ Camera not accessible")
                return None
    return camera


def generate_frames():
    """Generate video frames with AI annotations"""
    global latest_frame, latest_stats
    
    cam = get_camera()
    if cam is None:
        return
    
    print("✓ Video streaming started")
    
    while True:
        with camera_lock:
            success, frame = cam.read()
        
        if not success:
            print("Failed to read frame")
            break
        
        try:
            # Enhanced YOLO detection with tracking
            detection_result = detect_objects(
                frame, 
                enable_tracking=True,
                enable_motion_filter=False
            )
            
            # Detect hand gestures
            gesture_result = detect_hand_gestures(frame)
            
            # Draw annotations
            annotated_frame = draw_enhanced_annotations(frame, detection_result)
            annotated_frame = draw_hand_annotations(annotated_frame, gesture_result)
            
            # Event-based alert processing
            alert_events = process_events(detection_result, gesture_result)
            
            # Trigger alerts if any events detected
            if alert_events:
                trigger_alerts(alert_events)
            
            # Display active alerts on frame
            active_alerts = get_active_alerts(max_age_seconds=10)
            if active_alerts:
                y_pos = 150
                for alert in active_alerts[-3:]:
                    alert_color = (0, 0, 255) if alert.severity >= 4 else (0, 165, 255)
                    cv2.putText(
                        annotated_frame,
                        f"⚠ {alert.alert_type}",
                        (20, y_pos),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        alert_color,
                        2
                    )
                    y_pos += 30
            
            # Update stats
            latest_stats = {
                'person_count': detection_result.get('person_count', 0),
                'total_detections': len(detection_result.get('detections', [])),
                'active_alerts': len(active_alerts),
                'gesture_detected': gesture_result.get('stable_gesture'),
                'timestamp': datetime.now().isoformat()
            }
            
            # Store latest frame
            latest_frame = annotated_frame.copy()
            
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if not ret:
                continue
                
            frame_bytes = buffer.tobytes()
            
            # Yield frame in multipart format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        except Exception as e:
            print(f"Error processing frame: {e}")
            continue


@app.route('/')
def index():
    """API health check"""
    return jsonify({
        'status': 'online',
        'service': 'AI Surveillance System API',
        'version': '1.0',
        'endpoints': {
            'video_feed': '/video_feed',
            'stats': '/api/stats',
            'alerts': '/api/alerts',
            'cameras': '/api/cameras'
        }
    })


@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/api/stats')
def get_stats():
    """Get current detection statistics"""
    return jsonify({
        'success': True,
        'data': {
            'person_count': latest_stats.get('person_count', 0),
            'total_detections': latest_stats.get('total_detections', 0),
            'active_alerts': latest_stats.get('active_alerts', 0),
            'cameras_online': 1 if camera and camera.isOpened() else 0,
            'gesture_detected': latest_stats.get('gesture_detected'),
            'timestamp': latest_stats.get('timestamp', datetime.now().isoformat())
        }
    })


@app.route('/api/alerts')
def get_alerts():
    """Get active alerts"""
    max_age = request.args.get('max_age', default=60, type=int)
    active_alerts = get_active_alerts(max_age_seconds=max_age)
    
    alerts_data = []
    for alert in active_alerts:
        alerts_data.append({
            'type': alert.alert_type,
            'severity': alert.severity,
            'description': alert.description,
            'timestamp': alert.timestamp.isoformat(),
            'metadata': alert.metadata
        })
    
    return jsonify({
        'success': True,
        'count': len(alerts_data),
        'alerts': alerts_data
    })


@app.route('/api/cameras')
def get_cameras():
    """Get available cameras"""
    is_online = camera is not None and camera.isOpened()
    
    cameras_data = [{
        'id': 'cam_001',
        'name': 'Main Camera',
        'location': 'Front Entrance',
        'status': 'online' if is_online else 'offline',
        'stream_url': '/video_feed' if is_online else None
    }]
    
    return jsonify({
        'success': True,
        'count': len(cameras_data),
        'cameras': cameras_data
    })


@app.route('/api/config', methods=['GET', 'POST'])
def config():
    """Get or update configuration"""
    if request.method == 'POST':
        config_data = request.get_json()
        
        # Update AlertConfig
        if 'loitering_time' in config_data:
            AlertConfig.LOITERING_TIME_THRESHOLD = config_data['loitering_time']
        if 'max_persons' in config_data:
            AlertConfig.MAX_PERSONS_ALLOWED = config_data['max_persons']
        if 'crowd_threshold' in config_data:
            AlertConfig.CROWD_THRESHOLD = config_data['crowd_threshold']
        
        return jsonify({'success': True, 'message': 'Configuration updated'})
    
    # GET request - return current config
    return jsonify({
        'success': True,
        'config': {
            'loitering_time': AlertConfig.LOITERING_TIME_THRESHOLD,
            'max_persons': AlertConfig.MAX_PERSONS_ALLOWED,
            'crowd_threshold': AlertConfig.CROWD_THRESHOLD,
            'alert_cooldown': AlertConfig.ALERT_COOLDOWN
        }
    })


@app.route('/api/snapshot')
def get_snapshot():
    """Get current frame as snapshot"""
    global latest_frame
    
    if latest_frame is None:
        return jsonify({'success': False, 'error': 'No frame available'}), 404
    
    ret, buffer = cv2.imencode('.jpg', latest_frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
    if not ret:
        return jsonify({'success': False, 'error': 'Failed to encode frame'}), 500
    
    return Response(buffer.tobytes(), mimetype='image/jpeg')


def cleanup():
    """Cleanup resources on shutdown"""
    global camera
    if camera is not None:
        camera.release()
    print("\n✓ Resources released")


if __name__ == '__main__':
    try:
        print("=" * 60)
        print("AI Surveillance System - Flask API Server")
        print("=" * 60)
        print("✓ Starting server on http://localhost:5000")
        print("✓ CORS enabled for frontend")
        print("✓ Video streaming endpoint: /video_feed")
        print("✓ API endpoints: /api/stats, /api/alerts, /api/cameras")
        print("=" * 60)
        print("\n💡 TIP: Start the React frontend with 'npm run dev' in the frontend folder")
        print("Press Ctrl+C to stop\n")
        
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    except KeyboardInterrupt:
        print("\n\nShutting down...")
    finally:
        cleanup()
