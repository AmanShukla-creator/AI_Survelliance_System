import cv2
import numpy as np
from collections import deque
from datetime import datetime

# Simplified gesture detection without mediapipe.solutions
# This version works with OpenCV only

# Gesture history for stability
gesture_history = deque(maxlen=10)  # Last 10 frames


class GestureType:
    """Enum for different gesture types"""
    SOS = "SOS"
    HELP = "HELP"
    WAVING = "WAVING"
    STOP = "STOP"
    POINTING = "POINTING"
    NONE = "NONE"



# Color-based hand detection
def detect_hand_gestures(frame):
    """
    Detect hand gestures using color-based detection
    No longer requires mediapipe.solutions
    
    Args:
        frame: Input frame (BGR format)
        
    Returns:
        Dictionary containing gesture detection results
    """
    detected_gestures = []
    gesture_type = GestureType.NONE
    
    # Convert to YCrCb color space (better for skin detection)
    ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
    
    # Define skin color range in YCrCb
    lower_skin = np.array([0, 133, 77], dtype=np.uint8)
    upper_skin = np.array([255, 173, 127], dtype=np.uint8)
    
    # Create mask for skin detection
    mask = cv2.inRange(ycrcb, lower_skin, upper_skin)
    
    # Apply morphological operations to reduce noise
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    hand_count = 0
    hand_detected = False
    
    if contours:
        # Get largest contours (potential hands)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:2]
        
        for contour in contours:
            area = cv2.contourArea(contour)
            
            # Filter by minimum area
            if area > 5000:
                hand_detected = True
                hand_count += 1
                
                # Analyze contour shape for gesture recognition
                hull = cv2.convexHull(contour)
                hull_area = cv2.contourArea(hull)
                
                if hull_area > 0:
                    solidity = float(area) / hull_area
                    
                    # Get defects for finger counting
                    hull_indices = cv2.convexHull(contour, returnPoints=False)
                    if len(hull_indices) > 3 and len(contour) > 3:
                        try:
                            defects = cv2.convexityDefects(contour, hull_indices)
                            
                            if defects is not None:
                                finger_count = 0
                                
                                for i in range(defects.shape[0]):
                                    s, e, f, d = defects[i, 0]
                                    start = tuple(contour[s][0])
                                    end = tuple(contour[e][0])
                                    far = tuple(contour[f][0])
                                    
                                    # Calculate angle
                                    a = np.sqrt((end[0] - start[0])**2 + (end[1] - start[1])**2)
                                    b = np.sqrt((far[0] - start[0])**2 + (far[1] - start[1])**2)
                                    c = np.sqrt((end[0] - far[0])**2 + (end[1] - far[1])**2)
                                    
                                    if a > 0 and b > 0:
                                        angle = np.arccos((b**2 + c**2 - a**2) / (2 * b * c))
                                        
                                        # Count fingers based on angle
                                        if angle <= np.pi / 2 and d > 10000:
                                            finger_count += 1
                                
                                # Gesture classification based on finger count and solidity
                                if finger_count >= 4 and solidity > 0.7:
                                    gesture_type = GestureType.HELP  # Open hand
                                elif finger_count <= 1 and solidity > 0.8:
                                    gesture_type = GestureType.SOS  # Closed fist
                                elif finger_count >= 3:
                                    gesture_type = GestureType.STOP  # Open palm
                        except:
                            pass
    
    # Add to history for stability
    gesture_history.append(gesture_type)
    
    # Check if gesture is stable
    stable_gesture = None
    if len(gesture_history) >= 5:
        recent_gestures = list(gesture_history)[-5:]
        if recent_gestures.count(GestureType.SOS) >= 3:
            stable_gesture = GestureType.SOS
        elif recent_gestures.count(GestureType.HELP) >= 3:
            stable_gesture = GestureType.HELP
        elif recent_gestures.count(GestureType.STOP) >= 3:
            stable_gesture = GestureType.STOP
    
    if hand_detected and stable_gesture:
        detected_gestures.append({
            'type': stable_gesture,
            'hand': 'Detected',
            'landmarks': None,
            'timestamp': datetime.now()
        })
    
    return {
        'gestures': detected_gestures,
        'hand_landmarks': [],
        'gesture_type': gesture_type,
        'stable_gesture': stable_gesture,
        'hand_count': hand_count,
        'mask': mask
    }


def draw_hand_annotations(frame, gesture_result):
    """
    Draw hand detection visualization on frame
    """
    annotated_frame = frame.copy()
    
    # Draw gesture label if detected
    if gesture_result.get('stable_gesture') and gesture_result['stable_gesture'] != GestureType.NONE:
        gesture_text = f"GESTURE: {gesture_result['stable_gesture']}"
        
        # Color based on gesture type
        if gesture_result['stable_gesture'] == GestureType.SOS:
            color = (0, 0, 255)  # Red for SOS
        elif gesture_result['stable_gesture'] == GestureType.HELP:
            color = (0, 165, 255)  # Orange for HELP
        else:
            color = (0, 255, 255)  # Yellow for others
        
        # Draw background
        (text_w, text_h), _ = cv2.getTextSize(gesture_text, cv2.FONT_HERSHEY_SIMPLEX, 1, 2)
        cv2.rectangle(annotated_frame, (10, 100), (text_w + 20, 140), color, -1)
        cv2.putText(annotated_frame, gesture_text, (15, 130), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    return annotated_frame


def cleanup_gesture_detection():
    """Cleanup resources"""
    pass
