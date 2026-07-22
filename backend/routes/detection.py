from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import shutil
import os
import uuid

from database import SessionLocal
from dependencies import get_current_user
from models import User, Vehicle, DetectionLog, Alert, ParkingSlot, ParkingSession
from schemas import PlateCheckRequest



router = APIRouter(
    prefix="/detection",
    tags=["AI Detection"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


    
UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)



@router.post("/upload")
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):

    # Allow only image files
    allowed_extensions = [
        ".jpg",
        ".jpeg",
        ".png"
    ]

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed"
        )


    # create unique filename
    filename = f"{uuid.uuid4()}{extension}"


    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )


    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    return {
        "message": "Image uploaded successfully",
        "filename": filename,
        "path": file_path,
        "uploaded_by": current_user.username
    }


@router.post("/manual-check")
def manual_check(
    request: PlateCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plate_number = request.plate_number.strip().upper()

    # 1. Check if vehicle exists in DB
    vehicle = db.query(Vehicle).filter(func.upper(Vehicle.plate_number) == plate_number).first()

    status = "Allowed" if vehicle else "Flagged"

    # 2. Log the detection
    log_entry = DetectionLog(
        plate_number=plate_number,
        snapshot=vehicle.vehicle_image if (vehicle and vehicle.vehicle_image) else None,
        status=status
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    # 3. If flagged, also create an alert
    alert_entry = None
    if status == "Flagged":
        alert_entry = Alert(
            plate_number=plate_number,
            reason="Unauthorized vehicle plate manually checked",
            snapshot=None
        )
        db.add(alert_entry)
        db.commit()
        db.refresh(alert_entry)

    # 4. Handle Parking Slot Auto-Assignment if vehicle is found
    parking_assigned = False
    parking_slot_name = None
    parking_message = "No slot assigned (unregistered vehicle)"

    if vehicle:
        # Check if vehicle is already parked
        active_session = db.query(ParkingSession).filter(
            ParkingSession.vehicle_id == vehicle.id,
            ParkingSession.status == "Active"
        ).first()

        if active_session:
            # Find the slot name
            slot = db.query(ParkingSlot).filter(ParkingSlot.id == active_session.slot_id).first()
            parking_message = f"Vehicle is already parked in slot {slot.slot_name if slot else 'unknown'}."
        else:
            # Check for available parking slot
            available_slot = db.query(ParkingSlot).filter(
                ParkingSlot.status == "Available"
            ).order_by(ParkingSlot.slot_name).first()

            if available_slot:
                # Create parking session
                session = ParkingSession(
                    vehicle_id=vehicle.id,
                    slot_id=available_slot.id,
                    status="Active"
                )
                db.add(session)
                
                # Mark slot as Occupied
                available_slot.status = "Occupied"
                
                db.commit()
                db.refresh(session)
                
                parking_assigned = True
                parking_slot_name = available_slot.slot_name
                parking_message = f"Assigned to parking slot {available_slot.slot_name}."
            else:
                parking_message = "All parking slots are fully occupied."

    return {
        "status": status,
        "found": vehicle is not None,
        "vehicle": {
            "id": vehicle.id,
            "plate_number": vehicle.plate_number,
            "owner_name": vehicle.owner_name,
            "owner_id": vehicle.owner_id,
            "vehicle_model": vehicle.vehicle_model,
            "vehicle_image": vehicle.vehicle_image
        } if vehicle else None,
        "log_id": log_entry.id,
        "alert_id": alert_entry.id if alert_entry else None,
        "parking_assigned": parking_assigned,
        "parking_slot": parking_slot_name,
        "parking_message": parking_message
    }
