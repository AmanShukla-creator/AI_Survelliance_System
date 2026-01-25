import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict, deque
from datetime import datetime
import os
from pathlib import Path
import threading

# Lazy-load YOLO model so the API can boot fast (important for PaaS health checks)
_model = None
_model_lock = threading.Lock()


def _resolve_model_path() -> str:
    """Resolve the YOLO model path.

    Priority:
      1) YOLO_MODEL_PATH env var
      2) backend/yolov8n.pt
      3) repo root yolov8n.pt
      4) fallback to 'yolov8n.pt' (ultralytics may download if needed)
    """
    env_path = os.getenv("YOLO_MODEL_PATH")
    if env_path:
        return env_path

    here = Path(__file__).resolve().parent
    candidate = here / "yolov8n.pt"
    if candidate.exists():
        return str(candidate)

    root_candidate = here.parent / "yolov8n.pt"
    if root_candidate.exists():
        return str(root_candidate)

    return "yolov8n.pt"


def _get_model() -> YOLO:
    global _model
    if _model is not None:
        return _model
    with _model_lock:
        if _model is None:
            _model = YOLO(_resolve_model_path())
    return _model

# Configuration parameters
class DetectionConfig:
    """Configuration for detection system"""
    CONF_THRESHOLD = 0.5  # Confidence threshold (0.0 to 1.0)
    IOU_THRESHOLD = 0.45  # NMS IoU threshold
    TRACK_HISTORY_LENGTH = 30  # Number of frames to keep in tracking history
    FRAME_SKIP = 1  # Process every Nth frame (1 = no skip)
    MIN_DETECTION_SIZE = 20  # Minimum bounding box size (pixels)
    
    # Classes to detect (COCO dataset - modify as needed)
    # 0: person, 1: bicycle, 2: car, 3: motorcycle, 5: bus, 7: truck
    TARGET_CLASSES = [0, 1, 2, 3, 5, 7]  # Focus on people and vehicles
    
    # Motion detection settings
    MOTION_THRESHOLD = 25  # Pixel difference threshold
    MIN_MOTION_AREA = 500  # Minimum contour area to consider
    
    # Zone-based detection (define regions of interest)
    ZONES_ENABLED = False
    ZONES = []  # List of polygons: [[(x1,y1), (x2,y2), ...], ...]

# Global variables for tracking
track_history = defaultdict(lambda: deque(maxlen=DetectionConfig.TRACK_HISTORY_LENGTH))
detection_history = deque(maxlen=100)  # Store last 100 detections
frame_counter = 0
previous_frame = None
motion_detected_frame = 0

# COCO class names
COCO_CLASSES = {
    0: 'person', 1: 'bicycle', 2: 'car', 3: 'motorcycle', 4: 'airplane',
    5: 'bus', 6: 'train', 7: 'truck', 8: 'boat', 9: 'traffic light',
    10: 'fire hydrant', 11: 'stop sign', 12: 'parking meter', 13: 'bench',
    14: 'bird', 15: 'cat', 16: 'dog', 17: 'horse', 18: 'sheep', 19: 'cow'
}


def detect_motion(frame):
    """
    Pre-filter using motion detection to save processing power.
    Returns True if motion is detected.
    """
    global previous_frame, motion_detected_frame
    
    if previous_frame is None:
        previous_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        previous_frame = cv2.GaussianBlur(previous_frame, (21, 21), 0)
        return True
    
    # Convert current frame to grayscale and blur
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (21, 21), 0)
    
    # Compute absolute difference
    frame_delta = cv2.absdiff(previous_frame, gray)
    thresh = cv2.threshold(frame_delta, DetectionConfig.MOTION_THRESHOLD, 255, cv2.THRESH_BINARY)[1]
    thresh = cv2.dilate(thresh, None, iterations=2)
    
    # Find contours
    contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Check if any contour is large enough
    motion = any(cv2.contourArea(c) > DetectionConfig.MIN_MOTION_AREA for c in contours)
    
    previous_frame = gray
    return motion


def point_in_zone(point, zone):
    """Check if a point is inside a polygon zone"""
    return cv2.pointPolygonTest(np.array(zone, dtype=np.int32), point, False) >= 0


def filter_detections_by_zone(detections):
    """Filter detections to only include those in defined zones"""
    if not DetectionConfig.ZONES_ENABLED or not DetectionConfig.ZONES:
        return detections
    
    filtered = []
    for det in detections:
        x1, y1, x2, y2 = det['bbox']
        center = ((x1 + x2) / 2, (y1 + y2) / 2)
        
        # Check if center point is in any zone
        if any(point_in_zone(center, zone) for zone in DetectionConfig.ZONES):
            filtered.append(det)
    
    return filtered


def extract_detections(results):
    """
    Extract and filter detections from YOLO results.
    Returns list of detection dictionaries with enhanced information.
    """
    detections = []
    
    for result in results:
        boxes = result.boxes
        
        if boxes is None or len(boxes) == 0:
            continue
        
        for i in range(len(boxes)):
            # Get box coordinates
            box = boxes.xyxy[i].cpu().numpy()
            x1, y1, x2, y2 = map(int, box)
            
            # Get confidence and class
            conf = float(boxes.conf[i].cpu().numpy())
            cls = int(boxes.cls[i].cpu().numpy())
            
            # Filter by confidence threshold
            if conf < DetectionConfig.CONF_THRESHOLD:
                continue
            
            # Filter by target classes
            if DetectionConfig.TARGET_CLASSES and cls not in DetectionConfig.TARGET_CLASSES:
                continue
            
            # Filter by minimum size
            width = x2 - x1
            height = y2 - y1
            if width < DetectionConfig.MIN_DETECTION_SIZE or height < DetectionConfig.MIN_DETECTION_SIZE:
                continue
            
            # Get track ID if available
            track_id = None
            if hasattr(boxes, 'id') and boxes.id is not None:
                track_id = int(boxes.id[i].cpu().numpy())
            
            detection = {
                'bbox': (x1, y1, x2, y2),
                'confidence': conf,
                'class_id': cls,
                'class_name': COCO_CLASSES.get(cls, f'class_{cls}'),
                'track_id': track_id,
                'center': ((x1 + x2) / 2, (y1 + y2) / 2),
                'area': width * height,
                'timestamp': datetime.now()
            }
            
            detections.append(detection)
    
    return detections


def update_tracking_history(detections):
    """Update tracking history for tracked objects"""
    for det in detections:
        if det['track_id'] is not None:
            track_history[det['track_id']].append(det['center'])


def get_detection_stats():
    """Get statistics about recent detections"""
    if not detection_history:
        return {}
    
    class_counts = defaultdict(int)
    avg_confidence = []
    
    for det in detection_history:
        class_counts[det['class_name']] += 1
        avg_confidence.append(det['confidence'])
    
    return {
        'total_detections': len(detection_history),
        'class_distribution': dict(class_counts),
        'avg_confidence': np.mean(avg_confidence) if avg_confidence else 0,
        'unique_tracks': len(track_history)
    }


def detect_objects(frame, enable_tracking=True, enable_motion_filter=False):
    """
    Enhanced object detection with multiple improvements:
    - Confidence thresholding
    - Class filtering
    - Object tracking
    - Motion detection pre-filtering
    - Frame skipping
    - Zone-based detection
    - Detection history and statistics
    
    Args:
        frame: Input frame (numpy array)
        enable_tracking: Whether to enable object tracking (default: True)
        enable_motion_filter: Whether to use motion detection as pre-filter (default: False)
    
    Returns:
        Dictionary containing:
        - 'results': Raw YOLO results
        - 'detections': List of filtered detection dictionaries
        - 'stats': Detection statistics
        - 'motion_detected': Whether motion was detected (if enabled)
    """
    global frame_counter, detection_history
    
    frame_counter += 1
    
    # Frame skipping optimization
    if frame_counter % DetectionConfig.FRAME_SKIP != 0:
        return {
            'results': None,
            'detections': [],
            'stats': get_detection_stats(),
            'motion_detected': None,
            'skipped': True
        }
    
    # Motion detection pre-filter
    motion_detected = True
    if enable_motion_filter:
        motion_detected = detect_motion(frame)
        if not motion_detected:
            return {
                'results': None,
                'detections': [],
                'stats': get_detection_stats(),
                'motion_detected': False,
                'skipped': False
            }
    
    yolo = _get_model()

    # Run YOLO detection with tracking if enabled
    if enable_tracking:
        results = yolo.track(
            frame,
            conf=DetectionConfig.CONF_THRESHOLD,
            iou=DetectionConfig.IOU_THRESHOLD,
            persist=True,
            verbose=False
        )
    else:
        results = yolo(
            frame,
            conf=DetectionConfig.CONF_THRESHOLD,
            iou=DetectionConfig.IOU_THRESHOLD,
            verbose=False
        )
    
    # Extract and filter detections
    detections = extract_detections(results)
    
    # Apply zone filtering if enabled
    detections = filter_detections_by_zone(detections)
    
    # Update tracking history
    if enable_tracking:
        update_tracking_history(detections)
    
    # Update detection history
    detection_history.extend(detections)
    
    return {
        'results': results,
        'detections': detections,
        'stats': get_detection_stats(),
        'motion_detected': motion_detected,
        'skipped': False
    }


def draw_enhanced_annotations(frame, detection_result):
    """
    Draw enhanced annotations on frame including:
    - Bounding boxes with labels
    - Tracking trails
    - Zone boundaries
    - Statistics overlay
    """
    annotated_frame = frame.copy()
    
    if detection_result['skipped'] or not detection_result['detections']:
        return annotated_frame
    
    # Draw zones if enabled
    if DetectionConfig.ZONES_ENABLED and DetectionConfig.ZONES:
        for zone in DetectionConfig.ZONES:
            pts = np.array(zone, dtype=np.int32)
            cv2.polylines(annotated_frame, [pts], True, (255, 255, 0), 2)
    
    # Draw detections
    for det in detection_result['detections']:
        x1, y1, x2, y2 = det['bbox']
        conf = det['confidence']
        class_name = det['class_name']
        track_id = det['track_id']
        
        # Color based on class
        color = (0, 255, 0) if class_name == 'person' else (255, 0, 0)
        
        # Draw bounding box
        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
        
        # Create label
        label = f"{class_name} {conf:.2f}"
        if track_id is not None:
            label = f"ID:{track_id} {label}"
        
        # Draw label background
        (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
        cv2.rectangle(annotated_frame, (x1, y1 - label_h - 10), (x1 + label_w, y1), color, -1)
        cv2.putText(annotated_frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Draw tracking trail
        if track_id is not None and track_id in track_history:
            points = track_history[track_id]
            if len(points) > 1:
                pts = np.array(points, dtype=np.int32).reshape((-1, 1, 2))
                cv2.polylines(annotated_frame, [pts], False, color, 2)
    
    # Draw statistics overlay
    stats = detection_result['stats']
    y_offset = 30
    cv2.rectangle(annotated_frame, (10, 10), (350, 80), (0, 0, 0), -1)
    cv2.putText(annotated_frame, f"Detections: {len(detection_result['detections'])}", 
                (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    cv2.putText(annotated_frame, f"Tracked Objects: {stats.get('unique_tracks', 0)}", 
                (20, y_offset + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    return annotated_frame


def configure_detection(conf_threshold=None, target_classes=None, frame_skip=None, 
                       zones=None, enable_zones=None):
    """
    Configure detection parameters at runtime.
    
    Args:
        conf_threshold: Confidence threshold (0.0 to 1.0)
        target_classes: List of class IDs to detect
        frame_skip: Process every Nth frame
        zones: List of polygon zones
        enable_zones: Enable/disable zone filtering
    """
    if conf_threshold is not None:
        DetectionConfig.CONF_THRESHOLD = conf_threshold
    if target_classes is not None:
        DetectionConfig.TARGET_CLASSES = target_classes
    if frame_skip is not None:
        DetectionConfig.FRAME_SKIP = frame_skip
    if zones is not None:
        DetectionConfig.ZONES = zones
    if enable_zones is not None:
        DetectionConfig.ZONES_ENABLED = enable_zones