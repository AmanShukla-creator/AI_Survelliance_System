import cv2
from detection import detect_objects
from alert import check_for_person

print("Starting AI Surveillance System")

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Camera not accessible")
    exit()

print("Camera connected")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Frame read failed")
        break

    # YOLO detection
    results = detect_objects(frame)

    # Draw bounding boxes
    annotated_frame = results[0].plot()

    # Surveillance logic
    persons = check_for_person(results)

    if persons > 0:
        cv2.putText(
            annotated_frame,
            f"ALERT: Persons Detected = {persons}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )

    cv2.imshow("AI Surveillance System", annotated_frame)
    cv2.setWindowProperty(
        "AI Surveillance System",
        cv2.WND_PROP_TOPMOST,
        1
    )

    if cv2.waitKey(1) & 0xFF == 27:
        print("Exiting system")
        break

cap.release()
cv2.destroyAllWindows()
print("Resources released")
