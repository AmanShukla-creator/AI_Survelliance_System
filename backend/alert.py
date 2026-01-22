import time
import numpy as np
from collections import defaultdict, deque
from datetime import datetime, timedelta
import os
import sys

# Try multiple audio backends
AUDIO_METHOD = None

# Method 1: Try pygame
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
try:
    import pygame
    pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
    AUDIO_METHOD = "pygame"
except:
    pass

# Method 2: Windows ctypes beep (most reliable on Windows)
if sys.platform == 'win32':
    import ctypes
    AUDIO_METHOD = "ctypes"

print(f"Audio method: {AUDIO_METHOD}")

# Alert configuration
class AlertConfig:
    """Configuration for event-based alerts"""
    # Cooldown settings
    ALERT_COOLDOWN = 5  # Seconds between same alert type
    
    # Loitering detection
    LOITERING_TIME_THRESHOLD = 15  # Seconds in same area
    LOITERING_DISTANCE_THRESHOLD = 50  # Pixels - movement threshold
    
    # Restricted zone alerts
    RESTRICTED_ZONES = []  # Define zones: [{'name': 'Zone1', 'polygon': [(x1,y1), ...]}]
    
    # Multiple person alerts
    MAX_PERSONS_ALLOWED = 3  # Alert if more than this
    CROWD_THRESHOLD = 5  # Alert for crowd
    
    # Gesture alert settings
    SOS_PRIORITY = 1  # Highest priority
    HELP_PRIORITY = 2
    
    # Fall detection
    FALL_ASPECT_RATIO_THRESHOLD = 1.5  # Width/Height ratio
    
    # Suspicious behavior
    FAST_MOVEMENT_THRESHOLD = 100  # Pixels per frame
    ERRATIC_MOVEMENT_FRAMES = 5  # Consecutive erratic movements


# Global tracking variables
last_alert_times = defaultdict(lambda: datetime.min)
track_positions = defaultdict(lambda: deque(maxlen=50))  # Track last 50 positions
track_first_seen = {}  # When track was first detected
active_alerts = []  # List of active alert events


class AlertType:
    """Types of alert events"""
    SOS_GESTURE = "SOS_GESTURE"
    HELP_GESTURE = "HELP_GESTURE"
    LOITERING = "LOITERING"
    RESTRICTED_ZONE = "RESTRICTED_ZONE"
    CROWD_DETECTED = "CROWD_DETECTED"
    UNAUTHORIZED_PERSON = "UNAUTHORIZED_PERSON"
    FALL_DETECTED = "FALL_DETECTED"
    SUSPICIOUS_BEHAVIOR = "SUSPICIOUS_BEHAVIOR"
    ABANDONED_OBJECT = "ABANDONED_OBJECT"


class AlertEvent:
    """Represents an alert event"""
    def __init__(self, alert_type, severity, description, metadata=None):
        self.alert_type = alert_type
        self.severity = severity  # 1-5, 5 being critical
        self.description = description
        self.timestamp = datetime.now()
        self.metadata = metadata or {}
    
    def __str__(self):
        return f"[{self.severity}/5] {self.alert_type}: {self.description}"


def generate_beep(frequency, duration, sample_rate=22050, volume=0.8):
    """Generate a beep sound using numpy"""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    # Generate sine wave
    wave = np.sin(frequency * 2 * np.pi * t)
    # Add envelope to prevent clicking
    attack = int(sample_rate * 0.01)  # 10ms attack
    release = int(sample_rate * 0.05)  # 50ms release
    if attack < len(wave):
        wave[:attack] = wave[:attack] * np.linspace(0, 1, attack)
    if release < len(wave):
        wave[-release:] = wave[-release:] * np.linspace(1, 0, release)
    # Ensure that audio is in 16-bit range with higher volume
    audio = wave * (2**15 - 1) * volume
    audio = audio.astype(np.int16)
    return audio


def play_audio(audio, sample_rate=22050):
    """Play audio using available method"""
    if AUDIO_METHOD == "pygame":
        try:
            # Create stereo audio (2 channels)
            stereo_audio = np.column_stack((audio, audio))
            # Create pygame sound from array
            sound = pygame.sndarray.make_sound(stereo_audio)
            sound.set_volume(1.0)  # Max volume
            channel = sound.play()
            # Wait for sound to finish playing
            while channel.get_busy():
                pygame.time.wait(10)
        except Exception as e:
            print(f" ✗ Audio playback error: {e}")
            print('\a')
    else:
        print('\a')


def beep_alert(severity=3):
    """Play beep sound based on severity"""
    try:
        print("=" * 60)
        print(f" 🚨 ALERT TRIGGERED! Severity: {severity}/5")
        print("=" * 60)
        print(f" 🔊 Audio Method: {AUDIO_METHOD}")
        
        # ALWAYS use terminal bell as backup - this is most reliable
        for _ in range(min(severity, 3)):
            print('\a', end='', flush=True)
            time.sleep(0.15)
        
        # Use Windows native beep for maximum reliability
        if AUDIO_METHOD == "ctypes":
            print(f" 🔊 Playing Windows native beep...")
            try:
                if severity >= 4:  # Critical
                    for i in range(3):
                        ctypes.windll.kernel32.Beep(1500, 200)
                        time.sleep(0.1)
                elif severity >= 3:  # High
                    ctypes.windll.kernel32.Beep(1200, 500)
                else:  # Medium/Low
                    ctypes.windll.kernel32.Beep(1000, 400)
            except Exception as e:
                print(f" Note: PC speaker beep not available - {e}")
        elif AUDIO_METHOD == "pygame":
            # Different beep patterns based on severity
            if severity >= 4:  # Critical
                print(" 🚨 Playing CRITICAL alert sound (3 beeps)...")
                for i in range(3):
                    beep = generate_beep(1500, 0.2, volume=0.9)
                    play_audio(beep)
                    if i < 2:
                        time.sleep(0.1)
            elif severity >= 3:  # High
                print(" ⚠️ Playing HIGH alert sound...")
                beep = generate_beep(1200, 0.5, volume=0.9)
                play_audio(beep)
            else:  # Medium/Low
                print(" ℹ️ Playing MEDIUM alert sound...")
                beep = generate_beep(1000, 0.4, volume=0.8)
                play_audio(beep)
        
        print(" ✓ Alert sound completed")
        print("=" * 60)
    except Exception as e:
        print(f" ✗ Alert sound error: {e}")
        import traceback
        traceback.print_exc()
        # Final fallback - aggressive terminal bells
        print(" 🔔 Using terminal bell alerts...")
        for _ in range(severity * 2):
            print('\a', end='', flush=True)
            time.sleep(0.15)


def can_trigger_alert(alert_type):
    """Check if enough time has passed since last alert of this type"""
    last_time = last_alert_times[alert_type]
    cooldown = timedelta(seconds=AlertConfig.ALERT_COOLDOWN)
    
    if datetime.now() - last_time > cooldown:
        last_alert_times[alert_type] = datetime.now()
        return True
    return False


def point_in_polygon(point, polygon):
    """Check if point is inside polygon"""
    import cv2
    return cv2.pointPolygonTest(np.array(polygon, dtype=np.int32), point, False) >= 0


def check_loitering(track_id, current_position):
    """
    Detect if a person is loitering (staying in same area too long)
    """
    track_positions[track_id].append((current_position, datetime.now()))
    
    if track_id not in track_first_seen:
        track_first_seen[track_id] = datetime.now()
        return None
    
    # Calculate time in area
    time_in_area = (datetime.now() - track_first_seen[track_id]).total_seconds()
    
    if time_in_area < AlertConfig.LOITERING_TIME_THRESHOLD:
        return None
    
    # Check if person has moved significantly
    positions = [pos for pos, _ in track_positions[track_id]]
    if len(positions) < 10:
        return None
    
    # Calculate movement range
    positions_array = np.array(positions)
    x_range = np.max(positions_array[:, 0]) - np.min(positions_array[:, 0])
    y_range = np.max(positions_array[:, 1]) - np.min(positions_array[:, 1])
    movement = max(x_range, y_range)
    
    # If minimal movement for extended time = loitering
    if movement < AlertConfig.LOITERING_DISTANCE_THRESHOLD:
        return AlertEvent(
            AlertType.LOITERING,
            severity=3,
            description=f"Person ID:{track_id} loitering for {int(time_in_area)}s",
            metadata={'track_id': track_id, 'duration': time_in_area, 'position': current_position}
        )
    
    return None


def check_restricted_zones(detections):
    """
    Check if any person is in a restricted zone
    """
    if not AlertConfig.RESTRICTED_ZONES:
        return []
    
    alerts = []
    for det in detections:
        if det['class_name'] != 'person':
            continue
        
        center = det['center']
        for zone in AlertConfig.RESTRICTED_ZONES:
            if point_in_polygon(center, zone['polygon']):
                alert = AlertEvent(
                    AlertType.RESTRICTED_ZONE,
                    severity=4,
                    description=f"Person detected in restricted zone: {zone['name']}",
                    metadata={'zone': zone['name'], 'track_id': det.get('track_id'), 'position': center}
                )
                alerts.append(alert)
    
    return alerts


def check_crowd_detection(person_count):
    """
    Alert if too many people detected
    """
    if person_count > AlertConfig.CROWD_THRESHOLD:
        return AlertEvent(
            AlertType.CROWD_DETECTED,
            severity=4,
            description=f"Crowd detected: {person_count} persons",
            metadata={'count': person_count}
        )
    elif person_count > AlertConfig.MAX_PERSONS_ALLOWED:
        return AlertEvent(
            AlertType.UNAUTHORIZED_PERSON,
            severity=3,
            description=f"More than allowed: {person_count} persons (max: {AlertConfig.MAX_PERSONS_ALLOWED})",
            metadata={'count': person_count}
        )
    
    return None


def check_fall_detection(detection):
    """
    Detect if person has fallen (horizontal orientation)
    """
    x1, y1, x2, y2 = detection['bbox']
    width = x2 - x1
    height = y2 - y1
    
    if height == 0:
        return None
    
    aspect_ratio = width / height
    
    # If person's bounding box is much wider than tall = potential fall
    if aspect_ratio > AlertConfig.FALL_ASPECT_RATIO_THRESHOLD:
        return AlertEvent(
            AlertType.FALL_DETECTED,
            severity=5,  # Critical
            description=f"Potential fall detected (aspect ratio: {aspect_ratio:.2f})",
            metadata={'track_id': detection.get('track_id'), 'position': detection['center'], 'aspect_ratio': aspect_ratio}
        )
    
    return None


def check_suspicious_movement(track_id, current_position):
    """
    Detect erratic or suspicious movement patterns
    """
    track_positions[track_id].append((current_position, datetime.now()))
    
    positions = [pos for pos, _ in track_positions[track_id]]
    if len(positions) < 3:
        return None
    
    # Calculate speed of movement
    recent_positions = positions[-3:]
    distances = []
    for i in range(len(recent_positions) - 1):
        dist = np.sqrt(
            (recent_positions[i+1][0] - recent_positions[i][0])**2 +
            (recent_positions[i+1][1] - recent_positions[i][1])**2
        )
        distances.append(dist)
    
    avg_speed = np.mean(distances)
    
    # Fast movement could indicate running or suspicious activity
    if avg_speed > AlertConfig.FAST_MOVEMENT_THRESHOLD:
        return AlertEvent(
            AlertType.SUSPICIOUS_BEHAVIOR,
            severity=3,
            description=f"Fast movement detected for ID:{track_id} (speed: {avg_speed:.1f})",
            metadata={'track_id': track_id, 'speed': avg_speed}
        )
    
    return None


def check_gesture_alerts(gesture_result):
    """
    Check for SOS or HELP gesture alerts
    """
    if not gesture_result or 'stable_gesture' not in gesture_result:
        return None
    
    stable_gesture = gesture_result['stable_gesture']
    
    if stable_gesture == "SOS":
        return AlertEvent(
            AlertType.SOS_GESTURE,
            severity=5,  # Critical
            description="🆘 SOS GESTURE DETECTED - IMMEDIATE ATTENTION REQUIRED!",
            metadata={'gesture_type': 'SOS', 'hand_count': gesture_result.get('hand_count', 0)}
        )
    elif stable_gesture == "HELP":
        return AlertEvent(
            AlertType.HELP_GESTURE,
            severity=4,
            description="🙋 HELP GESTURE DETECTED - Assistance needed",
            metadata={'gesture_type': 'HELP', 'hand_count': gesture_result.get('hand_count', 0)}
        )
    
    return None


def process_events(detection_result, gesture_result=None):
    """
    Main event processing function - analyzes detections and gestures
    Returns list of alert events
    
    Args:
        detection_result: Result from detect_objects()
        gesture_result: Result from detect_hand_gestures() (optional)
    
    Returns:
        List of AlertEvent objects
    """
    events = []
    
    # Skip if no detections
    if not detection_result or detection_result.get('skipped'):
        return events
    
    detections = detection_result.get('detections', [])
    
    # Count persons
    person_detections = [d for d in detections if d['class_name'] == 'person']
    person_count = len(person_detections)
    
    # 1. Check for gesture alerts (highest priority)
    if gesture_result:
        gesture_alert = check_gesture_alerts(gesture_result)
        if gesture_alert and can_trigger_alert(gesture_alert.alert_type):
            events.append(gesture_alert)
    
    # 2. Check crowd detection
    crowd_alert = check_crowd_detection(person_count)
    if crowd_alert and can_trigger_alert(crowd_alert.alert_type):
        events.append(crowd_alert)
    
    # 3. Check individual person behaviors
    for person in person_detections:
        track_id = person.get('track_id')
        center = person['center']
        
        if track_id is not None:
            # Check loitering
            loiter_alert = check_loitering(track_id, center)
            if loiter_alert and can_trigger_alert(f"{AlertType.LOITERING}_{track_id}"):
                events.append(loiter_alert)
            
            # Check suspicious movement
            movement_alert = check_suspicious_movement(track_id, center)
            if movement_alert and can_trigger_alert(f"{AlertType.SUSPICIOUS_BEHAVIOR}_{track_id}"):
                events.append(movement_alert)
        
        # Check fall detection
        fall_alert = check_fall_detection(person)
        if fall_alert and can_trigger_alert(f"{AlertType.FALL_DETECTED}_{track_id}"):
            events.append(fall_alert)
    
    # 4. Check restricted zones
    zone_alerts = check_restricted_zones(person_detections)
    for alert in zone_alerts:
        zone_key = f"{alert.alert_type}_{alert.metadata.get('zone')}"
        if can_trigger_alert(zone_key):
            events.append(alert)
    
    return events


def trigger_alerts(events):
    """
    Trigger alerts for detected events
    """
    if not events:
        return
    
    # Sort by severity (highest first)
    events.sort(key=lambda x: x.severity, reverse=True)
    
    for event in events:
        print("\n" + "="*70)
        print(f"🚨 {event}")
        print(f"⏰ Time: {event.timestamp.strftime('%H:%M:%S')}")
        if event.metadata:
            print(f"📋 Details: {event.metadata}")
        print("="*70)
        
        # Play alert sound
        beep_alert(event.severity)
        
        # Add to active alerts
        active_alerts.append(event)
        
        # Keep only recent alerts
        if len(active_alerts) > 50:
            active_alerts.pop(0)


def configure_alerts(loitering_time=None, max_persons=None, crowd_threshold=None, 
                    restricted_zones=None):
    """
    Configure alert parameters at runtime
    """
    if loitering_time is not None:
        AlertConfig.LOITERING_TIME_THRESHOLD = loitering_time
    if max_persons is not None:
        AlertConfig.MAX_PERSONS_ALLOWED = max_persons
    if crowd_threshold is not None:
        AlertConfig.CROWD_THRESHOLD = crowd_threshold
    if restricted_zones is not None:
        AlertConfig.RESTRICTED_ZONES = restricted_zones


def get_active_alerts(max_age_seconds=60):
    """
    Get list of recent active alerts
    """
    cutoff_time = datetime.now() - timedelta(seconds=max_age_seconds)
    return [alert for alert in active_alerts if alert.timestamp > cutoff_time]
    