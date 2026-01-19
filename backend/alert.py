def check_for_person(results):
    person_count = 0
    for r in results:
        for cls in r.boxes.cls:
            if int(cls) == 0: # Class 0 corresponds to 'person' in COCO dataset
                person_count += 1
                
    
    return person_count
    