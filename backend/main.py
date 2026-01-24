import cv2
from detection import detect_objects, draw_enhanced_annotations, configure_detection
from gesture_detection import detect_hand_gestures, draw_hand_annotations, cleanup_gesture_detection
from alert import process_events, trigger_alerts, configure_alerts, get_active_alerts

print("Starting AI Surveillance System with Event-Based Alerts")
print("-" * 60)

# Optional: Configure detection parameters
# configure_detection(
#     conf_threshold=0.6,  # Higher confidence = fewer false positives
#     target_classes=[0],  # Only detect persons
#     frame_skip=1,  # Process every frame
# )

# Optional: Configure alert parameters
# configure_alerts(
#     loitering_time=20,  # Seconds before loitering alert
#     max_persons=3,  # Alert if more than 3 persons
#     crowd_threshold=5,  # Alert for crowds of 5+
#     restricted_zones=[
#         {'name': 'Restricted Area', 'polygon': [(100, 100), (300, 100), (300, 300), (100, 300)]}
#     ]
# )

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Camera not accessible")
    exit()

print("✓ Camera connected")
print("✓ YOLO object detection initialized")
print("✓ MediaPipe hand gesture detection initialized")
print("✓ Event-based alert system active")
print("-" * 60)
print("\n Alert Events Configured:")
print("  • SOS Gesture Detection (Severity 5/5)")
print("  • HELP Gesture Detection (Severity 4/5)")
print("  • Loitering Detection (Severity 3/5)")
print("  • Crowd Detection (Severity 4/5)")
print("  • Fall Detection (Severity 5/5)")
print("  • Suspicious Movement (Severity 3/5)")
print("  • Restricted Zone Breach (Severity 4/5)")
print("\n TIP: Show SOS gesture (closed fist with thumb up) to trigger emergency alert")
print("Press ESC to exit\n")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Frame read failed")
        break

    # Enhanced YOLO detection with tracking
    detection_result = detect_objects(
        frame, 
        enable_tracking=True,  # Enable object tracking
        enable_motion_filter=False  # Set to True to use motion detection pre-filter
    )

    # Detect hand gestures for SOS/HELP signals
    gesture_result = detect_hand_gestures(frame)

    # Draw enhanced annotations
    annotated_frame = draw_enhanced_annotations(frame, detection_result)
    
    # Draw hand gesture annotations
    annotated_frame = draw_hand_annotations(annotated_frame, gesture_result)

    # Event-based alert processing
    alert_events = process_events(detection_result, gesture_result)
    
    # Trigger alerts if any events detected
    if alert_events:
        trigger_alerts(alert_events)

    # Display active alerts on screen
    active_alerts = get_active_alerts(max_age_seconds=10)
    if active_alerts:
        y_pos = 150
        for alert in active_alerts[-3:]:  # Show last 3 alerts
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

    cv2.imshow("AI Surveillance System - Event-Based Alerts", annotated_frame)
    cv2.setWindowProperty(
        "AI Surveillance System - Event-Based Alerts",
        cv2.WND_PROP_TOPMOST,
        1
    )

    if cv2.waitKey(1) & 0xFF == 27:
        print("\nExiting system...")
        break

cap.release()
cv2.destroyAllWindows()
cleanup_gesture_detection()
print("Resources released")
print("System shutdown complete")