import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from database import SessionLocal, engine
from models import Vehicle, EntranceRecord, Base

from routes.entrance import process_vehicle_entrance
from sqlalchemy import func

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("--- Testing Entrance Recording Feature ---")

# 1. Ensure a test vehicle exists
test_plate = "WP-CAB-9999"
vehicle = db.query(Vehicle).filter(func.upper(Vehicle.plate_number) == test_plate).first()
if not vehicle:
    vehicle = Vehicle(
        plate_number=test_plate,
        owner_name="John Doe",
        owner_id="NIC-99887766V",
        vehicle_model="Toyota Prius 2022",
        vehicle_image="uploads/sample_car.jpg"
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    print(f"Created test vehicle with plate: {vehicle.plate_number}")
else:
    print(f"Existing test vehicle found: {vehicle.plate_number}")

# 2. Process Entrance Event
result = process_vehicle_entrance(
    db=db,
    plate_number=test_plate,
    snapshot_path="uploads/test_entrance_snapshot.jpg",
    parking_slot_name="Slot A-10",
    status="Approved"
)

print("\n--- Process Entrance Result ---")
print("Success:", result["success"])
print("Message:", result["message"])
print("Recorded Record ID:", result["record"]["id"])
print("Snapshot Path:", result["record"]["snapshot"])
print("Entrance Timestamp:", result["record"]["entrance_time"])
print("Assigned Parking Slot:", result["record"]["parking_slot"])
print("Approval Status:", result["record"]["status"])
print("\nVehicle Details:")
print("Owner Name:", result["vehicle"]["owner_name"])
print("Owner ID:", result["vehicle"]["owner_id"])
print("Vehicle Model:", result["vehicle"]["vehicle_model"])

# 3. Verify record saved in database
saved_rec = db.query(EntranceRecord).filter(EntranceRecord.id == result["record"]["id"]).first()
assert saved_rec is not None, "Entrance record was not found in DB!"
assert saved_rec.plate_number == test_plate, "Plate number mismatch!"
print("\nDatabase verification PASSED!")

db.close()
