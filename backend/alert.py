import winsound
import time

beep_frequency = 2500  # Higher frequency, more noticeable
beep_duration = 1000  # Duration in milliseconds
last_beep_time = 0
beep_cooldown = 3  # Cooldown in seconds between beeps

def beep_alert():
    """Play beep sound - synchronous to ensure it plays"""
    try:
        print("=" * 50)
        print(" BEEP ALERT TRIGGERED!")
        print("=" * 50)
        # Play system beep first
        winsound.MessageBeep(winsound.MB_ICONHAND)
        # Play custom frequency beep
        winsound.Beep(beep_frequency, beep_duration)
        print(" Beep completed successfully")
    except Exception as e:
        print(f" Beep error: {e}")
        # Fallback: Try printing ASCII bell character
        print('\a' * 5)  # ASCII bell character
    
def check_for_person(results):
    global last_beep_time
    person_count = 0
    for r in results:
        for cls in r.boxes.cls:
            
            if int(cls) == 0: # Class 0 corresponds to 'person' in COCO dataset
                person_count += 1
    
    print(f"Persons detected: {person_count}")  # Debug message
    
    # Only beep if persons detected and cooldown period has passed
    if person_count > 0:
        current_time = time.time()
        print(f"Time since last beep: {current_time - last_beep_time:.1f}s / {beep_cooldown}s cooldown")
        if current_time - last_beep_time >= beep_cooldown:
            beep_alert()
            last_beep_time = current_time
        else:
            print(" Cooldown active - skipping beep")
                
    return person_count
    