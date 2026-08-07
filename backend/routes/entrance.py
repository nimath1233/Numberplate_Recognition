from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import os
import re
import uuid
import shutil

from database import get_db
from models import Vehicle, EntranceRecord, ParkingSlot, ParkingSession, DetectionLog, Alert
from schemas import EntranceRecordCreate, GuestAuthorizeRequest, GuestDenyRequest

router = APIRouter(
    prefix="/entrance",
    tags=["Entrance Records"]
)

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def process_vehicle_entrance(
    db: Session,
    plate_number: str,
    snapshot_path: str | None = None,
    parking_slot_name: str | None = None,
    status: str = "Approved"
):
    clean_plate = plate_number.strip().upper()
    clean_no_spaces = re.sub(r'[\s\-_]', '', clean_plate)
    fallback_snap = snapshot_path if (snapshot_path and snapshot_path.strip()) else "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80"

    # 1. Search PostgreSQL database for plate number (space & hyphen insensitive)
    all_vehicles = db.query(Vehicle).all()
    vehicle = None
    for v in all_vehicles:
        if v.plate_number:
            v_clean = re.sub(r'[\s\-_]', '', v.plate_number.strip().upper())
            if v_clean == clean_no_spaces:
                vehicle = v
                break

    # Permanent registered vehicles enter automatically; Guest & Unregistered vehicles ALWAYS ask officer permission!
    if not vehicle or vehicle.is_guest:
        # Do NOT log a security alert here! Only raise 403 so frontend displays officer permission prompt.
        raise HTTPException(
            status_code=403,
            detail=f"GUEST / UNREGISTERED VEHICLE: Vehicle '{clean_plate}' requires security officer entrance permission."
        )

    # 2. Accept and resolve latest snapshot
    final_snapshot = snapshot_path if (snapshot_path and snapshot_path.strip()) else vehicle.vehicle_image

    # 3. Resolve assigned parking slot (if available)
    assigned_slot = parking_slot_name
    if not assigned_slot:
        # Check active session or auto-assign available slot
        active_session = db.query(ParkingSession).filter(
            ParkingSession.vehicle_id == vehicle.id,
            ParkingSession.status == "Active"
        ).first()

        if active_session:
            slot = db.query(ParkingSlot).filter(ParkingSlot.id == active_session.slot_id).first()
            if slot:
                assigned_slot = slot.slot_name
        else:
            available_slot = db.query(ParkingSlot).filter(
                ParkingSlot.status == "Available"
            ).order_by(ParkingSlot.slot_name).first()

            if available_slot:
                session = ParkingSession(
                    vehicle_id=vehicle.id,
                    slot_id=available_slot.id,
                    status="Active"
                )
                db.add(session)
                available_slot.status = "Occupied"
                db.commit()
                assigned_slot = available_slot.slot_name

    # 4. Save entrance record & Allowed DetectionLog
    record = EntranceRecord(
        plate_number=vehicle.plate_number,
        vehicle_id=vehicle.id,
        snapshot=final_snapshot,
        parking_slot=assigned_slot,
        status=status or "Approved",
        entrance_time=datetime.utcnow()
    )
    db.add(record)

    allowed_detection = DetectionLog(
        plate_number=vehicle.plate_number,
        snapshot=final_snapshot,
        status="Allowed",
        detection_time=datetime.utcnow()
    )
    db.add(allowed_detection)

    db.commit()
    db.refresh(record)

    return {
        "success": True,
        "message": f"Entrance event recorded successfully for plate '{vehicle.plate_number}'.",
        "plate_number": vehicle.plate_number,
        "slot_name": assigned_slot,
        "category": vehicle.category or "Car",
        "is_guest": vehicle.is_guest or False,
        "owner_name": vehicle.owner_name,
        "status": record.status,
        "record": {
            "id": record.id,
            "plate_number": record.plate_number,
            "vehicle_id": record.vehicle_id,
            "snapshot": record.snapshot,
            "parking_slot": record.parking_slot,
            "status": record.status,
            "entrance_time": (record.entrance_time.isoformat() + "Z") if record.entrance_time else None
        },
        "vehicle": {
            "id": vehicle.id,
            "plate_number": vehicle.plate_number,
            "owner_name": vehicle.owner_name,
            "owner_id": vehicle.owner_id,
            "vehicle_model": vehicle.vehicle_model,
            "category": vehicle.category,
            "is_guest": vehicle.is_guest or False,
            "vehicle_image": vehicle.vehicle_image,
            "registered_date": (vehicle.registered_date.isoformat() + "Z") if vehicle.registered_date else None
        }
    }


@router.post("/guest-authorize")
def authorize_guest_entrance(
    data: GuestAuthorizeRequest,
    db: Session = Depends(get_db)
):
    clean_plate = data.plate_number.strip().upper()
    guest_name = data.owner_name.strip() if data.owner_name else "Visitor / Guest"
    category = data.category or "Car"
    purpose = data.purpose or "Guest Visit"

    # 1. Search or create guest vehicle
    vehicle = db.query(Vehicle).filter(func.upper(Vehicle.plate_number) == clean_plate).first()
    if not vehicle:
        vehicle = Vehicle(
            plate_number=clean_plate,
            owner_name=guest_name,
            owner_id="GUEST-PASS",
            vehicle_model=purpose,
            category=category,
            is_guest=True
        )
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)
    else:
        vehicle.is_guest = True
        vehicle.category = category
        db.commit()

    # 2. Auto-assign available slot
    available_slot = db.query(ParkingSlot).filter(ParkingSlot.status == "Available").order_by(ParkingSlot.slot_name).first()
    assigned_slot = "P1"
    if available_slot:
        session = ParkingSession(
            vehicle_id=vehicle.id,
            slot_id=available_slot.id,
            status="Active"
        )
        db.add(session)
        available_slot.status = "Occupied"
        db.commit()
        assigned_slot = available_slot.slot_name

    # 3. Create Entrance Record (Status: Guest Approved)
    fallback_snap = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80"
    record = EntranceRecord(
        plate_number=vehicle.plate_number,
        vehicle_id=vehicle.id,
        snapshot=fallback_snap,
        parking_slot=assigned_slot,
        status="Guest Approved",
        entrance_time=datetime.utcnow()
    )
    db.add(record)

    allowed_detection = DetectionLog(
        plate_number=vehicle.plate_number,
        snapshot=fallback_snap,
        status="Allowed",
        detection_time=datetime.utcnow()
    )
    db.add(allowed_detection)

    db.commit()
    db.refresh(record)

    return {
        "success": True,
        "is_guest": True,
        "message": f"Guest Pass entry authorized for '{vehicle.plate_number}'. Assigned Bay: {assigned_slot}",
        "plate_number": vehicle.plate_number,
        "slot_name": assigned_slot,
        "category": vehicle.category or "Car",
        "owner_name": vehicle.owner_name
    }


@router.post("/guest-deny")
def deny_guest_entrance(
    data: GuestDenyRequest,
    db: Session = Depends(get_db)
):
    clean_plate = data.plate_number.strip().upper()
    fallback_snap = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80"

    # 1. Create Flagged DetectionLog entry
    flag_detection = DetectionLog(
        plate_number=clean_plate,
        snapshot=fallback_snap,
        status="Flagged",
        detection_time=datetime.utcnow()
    )
    db.add(flag_detection)

    # 2. Create Security Alert record
    security_alert = Alert(
        plate_number=clean_plate,
        snapshot=fallback_snap,
        reason=f"Guest/Unregistered vehicle '{clean_plate}' entry REJECTED by officer. Barrier kept closed.",
        alert_time=datetime.utcnow()
    )
    db.add(security_alert)
    db.commit()

    return {
        "success": True,
        "message": f"Security alert logged for denied vehicle '{clean_plate}'."
    }


@router.post("/record")
def record_entrance_json(
    data: EntranceRecordCreate,
    db: Session = Depends(get_db)
):
    """
    JSON endpoint for AI module / system to post entrance events.
    Receives license plate, snapshot path, and optional parking slot.
    """
    return process_vehicle_entrance(
        db=db,
        plate_number=data.plate_number,
        snapshot_path=data.snapshot,
        parking_slot_name=data.parking_slot,
        status=data.status or "Approved"
    )


@router.post("/upload-record")
def record_entrance_upload(
    plate_number: str = Form(...),
    parking_slot: str = Form(None),
    status: str = Form("Approved"),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """
    Multipart/form-data endpoint for AI module to upload image directly with plate_number.
    """
    snapshot_path = None
    if file:
        allowed_extensions = [".jpg", ".jpeg", ".png", ".webp"]
        extension = os.path.splitext(file.filename)[1].lower()
        if extension not in allowed_extensions:
            extension = ".jpg"
        filename = f"entrance_{uuid.uuid4()}{extension}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        snapshot_path = f"uploads/{filename}"

    return process_vehicle_entrance(
        db=db,
        plate_number=plate_number,
        snapshot_path=snapshot_path,
        parking_slot_name=parking_slot,
        status=status
    )


@router.get("/records")
def get_entrance_history(
    db: Session = Depends(get_db)
):
    # Only clean up Flagged or Denied entry attempts
    db.query(EntranceRecord).filter(EntranceRecord.status.in_(["Flagged", "Denied"])).delete(synchronize_session=False)
    db.commit()

    records = db.query(EntranceRecord).filter(
        EntranceRecord.status.in_(["Approved", "Guest Approved"])
    ).order_by(EntranceRecord.entrance_time.desc()).all()

    results = []
    for rec in records:
        vehicle_info = None
        if rec.vehicle:
            vehicle_info = {
                "id": rec.vehicle.id,
                "plate_number": rec.vehicle.plate_number,
                "owner_name": rec.vehicle.owner_name,
                "owner_id": rec.vehicle.owner_id,
                "vehicle_model": rec.vehicle.vehicle_model,
                "category": rec.vehicle.category,
                "is_guest": rec.vehicle.is_guest or False,
                "vehicle_image": rec.vehicle.vehicle_image
            }
        elif rec.vehicle_id:
            v = db.query(Vehicle).filter(Vehicle.id == rec.vehicle_id).first()
            if v:
                vehicle_info = {
                    "id": v.id,
                    "plate_number": v.plate_number,
                    "owner_name": v.owner_name,
                    "owner_id": v.owner_id,
                    "vehicle_model": v.vehicle_model,
                    "category": v.category,
                    "is_guest": v.is_guest or False,
                    "vehicle_image": v.vehicle_image
                }
        elif rec.plate_number:
            v = db.query(Vehicle).filter(func.upper(Vehicle.plate_number) == rec.plate_number.strip().upper()).first()
            if v:
                vehicle_info = {
                    "id": v.id,
                    "plate_number": v.plate_number,
                    "owner_name": v.owner_name,
                    "owner_id": v.owner_id,
                    "vehicle_model": v.vehicle_model,
                    "category": v.category,
                    "is_guest": v.is_guest or False,
                    "vehicle_image": v.vehicle_image
                }

        total_seconds = None
        duration_text = "🟢 Still Inside"
        if rec.entrance_time and rec.exit_time:
            total_seconds = max(0, int((rec.exit_time - rec.entrance_time).total_seconds()))
            hrs = total_seconds // 3600
            mins = (total_seconds % 3600) // 60
            secs = total_seconds % 60
            duration_text = f"{hrs}h {mins}m" if hrs > 0 else (f"{mins}m {secs}s" if mins > 0 else f"{secs}s")

        results.append({
            "id": rec.id,
            "plate_number": rec.plate_number,
            "vehicle_id": rec.vehicle_id,
            "snapshot": rec.snapshot,
            "parking_slot": rec.parking_slot,
            "status": rec.status,
            "entrance_time": (rec.entrance_time.isoformat() + "Z") if rec.entrance_time else None,
            "exit_time": (rec.exit_time.isoformat() + "Z") if rec.exit_time else None,
            "duration_text": duration_text,
            "vehicle": vehicle_info
        })

    return results


@router.get("/records/latest")
def get_latest_entrance(
    db: Session = Depends(get_db)
):
    """
    Fetch latest entrance record for dashboard display.
    """
    rec = db.query(EntranceRecord).order_by(EntranceRecord.entrance_time.desc()).first()
    if not rec:
        return {"record": None}

    vehicle_info = None
    if rec.vehicle:
        vehicle_info = {
            "id": rec.vehicle.id,
            "plate_number": rec.vehicle.plate_number,
            "owner_name": rec.vehicle.owner_name,
            "owner_id": rec.vehicle.owner_id,
            "vehicle_model": rec.vehicle.vehicle_model,
            "vehicle_image": rec.vehicle.vehicle_image
        }
    elif rec.plate_number:
        v = db.query(Vehicle).filter(func.upper(Vehicle.plate_number) == rec.plate_number.strip().upper()).first()
        if v:
            vehicle_info = {
                "id": v.id,
                "plate_number": v.plate_number,
                "owner_name": v.owner_name,
                "owner_id": v.owner_id,
                "vehicle_model": v.vehicle_model,
                "vehicle_image": v.vehicle_image
            }

    return {
        "record": {
            "id": rec.id,
            "plate_number": rec.plate_number,
            "vehicle_id": rec.vehicle_id,
            "snapshot": rec.snapshot,
            "parking_slot": rec.parking_slot,
            "status": rec.status,
            "entrance_time": (rec.entrance_time.isoformat() + "Z") if rec.entrance_time else None,
            "vehicle": vehicle_info
        }
    }


@router.delete("/records/{record_id}")
def delete_entrance_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    rec = db.query(EntranceRecord).filter(EntranceRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Entrance record not found")
    db.delete(rec)
    db.commit()
    return {"message": "Entrance record deleted successfully"}


@router.delete("/records")
def clear_all_entrance_records(
    db: Session = Depends(get_db)
):
    db.query(EntranceRecord).delete()
    db.commit()
    return {"message": "All entrance records cleared successfully"}
