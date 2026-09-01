from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
import math

from database import get_db
from models import ParkingSlot, ParkingSession, Vehicle, EntranceRecord
from schemas import ParkingAssign, ParkingRelease
from dependencies import get_current_admin_user, get_current_user
from models import User
from routes.entrance import check_post_exit_cooldown, record_vehicle_exit_timestamp, find_open_entrance_record_by_plate

router = APIRouter(
    prefix="/parking",
    tags=["Parking"]
)


def get_utc_now():
    return datetime.now()


@router.post("/create-slots")
def create_slots(admin_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    existing = db.query(ParkingSlot).count()

    if existing > 0:
        return {
            "message": "Parking slots are already initialized."
        }

    slots = [
        ParkingSlot(slot_name="P1", status="Available"),
        ParkingSlot(slot_name="P2", status="Available"),
        ParkingSlot(slot_name="P3", status="Available"),
    ]
    db.add_all(slots)
    db.commit()

    return {
        "message": "3 standard parking slots created (P1, P2, P3)"
    }


@router.post("/add-slot")
def add_custom_slot(slot_name: str, admin_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    clean_name = (slot_name or "").strip().upper()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Slot name cannot be empty")

    existing = db.query(ParkingSlot).filter(ParkingSlot.slot_name == clean_name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Slot '{clean_name}' already exists")

    new_slot = ParkingSlot(slot_name=clean_name, status="Available")
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    return {"message": f"Parking slot '{clean_name}' created successfully", "slot": {"id": new_slot.id, "slot_name": new_slot.slot_name, "status": new_slot.status}}


@router.post("/reset-slot/{slot_id}")
def reset_slot_status(slot_id: int, admin_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    slot.status = "Available"
    # Close any active parking session for this slot
    active_sessions = db.query(ParkingSession).filter(ParkingSession.slot_id == slot_id, ParkingSession.status == "Active").all()
    for s in active_sessions:
        s.status = "Completed"
        s.exit_time = get_utc_now()

    # Close any open entrance record for this slot
    open_entrance_recs = db.query(EntranceRecord).filter(
        EntranceRecord.parking_slot == slot.slot_name,
        EntranceRecord.exit_time == None
    ).all()
    for er in open_entrance_recs:
        er.exit_time = get_utc_now()

    db.commit()
    return {"message": f"Slot '{slot.slot_name}' force-released to Available"}


@router.delete("/slots/{slot_id}")
def delete_parking_slot(slot_id: int, admin_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    slot_name = slot.slot_name

    # 1. Delete all parking sessions referencing this slot ID to avoid foreign key constraint error
    db.query(ParkingSession).filter(ParkingSession.slot_id == slot_id).delete(synchronize_session=False)

    # 2. Clear parking_slot references in EntranceRecord for this slot name
    entrance_recs = db.query(EntranceRecord).filter(EntranceRecord.parking_slot == slot_name).all()
    for er in entrance_recs:
        er.parking_slot = None

    # 3. Delete the slot
    db.delete(slot)
    db.commit()

    return {"message": f"Parking slot '{slot_name}' deleted successfully"}




@router.get("/slots")
def get_slots(db: Session = Depends(get_db)):
    slots = db.query(ParkingSlot).order_by(ParkingSlot.slot_name).all()
    return slots


@router.get("/status")
def get_parking_status(db: Session = Depends(get_db)):
    total = db.query(ParkingSlot).count()
    available = db.query(ParkingSlot).filter(ParkingSlot.status == "Available").count()
    occupied = db.query(ParkingSlot).filter(ParkingSlot.status == "Occupied").count()
    return {
        "total": total,
        "available": available,
        "occupied": occupied
    }


@router.post("/assign")
def assign_slot(data: ParkingAssign, db: Session = Depends(get_db)):
    # 1. Resolve vehicle
    vehicle = None
    if data.vehicle_id is not None:
        vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=404,
                detail="Vehicle not found"
            )
    elif data.plate_number is not None:
        plate = data.plate_number.strip().upper()
        if not plate:
            raise HTTPException(
                status_code=400,
                detail="Plate number cannot be empty"
            )
        vehicle = db.query(Vehicle).filter(Vehicle.plate_number == plate).first()
        if not vehicle:
            # Auto-register vehicle to support future seamless AI integration
            vehicle = Vehicle(
                plate_number=plate,
                owner_name="AI Assigned",
                owner_id="AI_TEMP"
            )
            db.add(vehicle)
            db.commit()
            db.refresh(vehicle)
    else:
        raise HTTPException(
            status_code=400,
            detail="Either vehicle_id or plate_number must be provided"
        )

    # 2. Check if vehicle is already parked in an active session
    active_session = db.query(ParkingSession).filter(
        ParkingSession.vehicle_id == vehicle.id,
        ParkingSession.status == "Active"
    ).first()

    if active_session:
        raise HTTPException(
            status_code=400,
            detail="Vehicle is already parked."
        )

    # 2.5 Check 60-Second Post-Exit Re-Entry Cooldown
    in_exit_cd, rem_cd = check_post_exit_cooldown(db, vehicle.plate_number, vehicle.id, 60)
    if in_exit_cd and not getattr(data, "force_override", False):
        raise HTTPException(
            status_code=400,
            detail=f"Re-Entry Cooldown Active: Vehicle '{vehicle.plate_number}' recently exited. Entry is locked for {rem_cd}s."
        )

    # 3. Resolve parking slot
    slot = None
    if data.slot_id is not None:
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == data.slot_id).first()
    elif data.slot_name is not None:
        slot = db.query(ParkingSlot).filter(ParkingSlot.slot_name == data.slot_name).first()
    
    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Parking slot not found"
        )

    # 4. Check slot availability
    if slot.status != "Available":
        raise HTTPException(
            status_code=400,
            detail="Slot already occupied"
        )

    # 5. Create parking session
    session = ParkingSession(
        vehicle_id=vehicle.id,
        slot_id=slot.id,
        status="Active"
    )
    db.add(session)

    # 6. Update slot status
    slot.status = "Occupied"

    db.commit()
    db.refresh(session)

    return {
        "message": "Vehicle assigned successfully",
        "session_id": session.id
    }


@router.post("/release")
def release_slot(data: ParkingRelease, db: Session = Depends(get_db)):
    session = None
    
    if data.session_id is not None:
        session = db.query(ParkingSession).filter(
            ParkingSession.id == data.session_id,
            ParkingSession.status == "Active"
        ).first()
    elif data.plate_number is not None:
        vehicle = db.query(Vehicle).filter(Vehicle.plate_number == data.plate_number.strip().upper()).first()
        if vehicle:
            session = db.query(ParkingSession).filter(
                ParkingSession.vehicle_id == vehicle.id,
                ParkingSession.status == "Active"
            ).first()
    elif data.slot_name is not None:
        slot = db.query(ParkingSlot).filter(ParkingSlot.slot_name == data.slot_name).first()
        if slot:
            session = db.query(ParkingSession).filter(
                ParkingSession.slot_id == slot.id,
                ParkingSession.status == "Active"
            ).first()
            
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Active parking session not found"
        )

    slot = db.query(ParkingSlot).filter(
        ParkingSlot.id == session.slot_id
    ).first()

    session.exit_time = get_utc_now()
    session.status = "Completed"

    if slot:
        slot.status = "Available"

    # Also update matching open EntranceRecord
    if session.vehicle_id:
        v = db.query(Vehicle).filter(Vehicle.id == session.vehicle_id).first()
        if v and v.plate_number:
            open_rec = db.query(EntranceRecord).filter(
                EntranceRecord.plate_number == v.plate_number,
                EntranceRecord.exit_time.is_(None)
            ).order_by(EntranceRecord.entrance_time.desc()).first()
            if open_rec:
                open_rec.exit_time = session.exit_time

    db.commit()

    return {
        "message": "Vehicle released successfully"
    }


@router.post("/exit-process")
def process_vehicle_exit(data: ParkingRelease, db: Session = Depends(get_db)):
    session = None
    if data.session_id is not None:
        session = db.query(ParkingSession).filter(
            ParkingSession.id == data.session_id,
            ParkingSession.status == "Active"
        ).first()
    elif data.plate_number is not None:
        plate = data.plate_number.strip().upper()
        vehicle = db.query(Vehicle).filter(Vehicle.plate_number == plate).first()
        if vehicle:
            session = db.query(ParkingSession).filter(
                ParkingSession.vehicle_id == vehicle.id,
                ParkingSession.status == "Active"
            ).first()

    if not session:
        # Fallback check for vehicles inside premises with open EntranceRecord (e.g. No Slot Available or auto-assigned)
        entrance_rec = None
        if data.session_id is not None:
            entrance_rec = db.query(EntranceRecord).filter(
                EntranceRecord.id == data.session_id,
                EntranceRecord.exit_time.is_(None)
            ).first()
        if not entrance_rec and data.plate_number:
            entrance_rec = find_open_entrance_record_by_plate(db, data.plate_number)

        if entrance_rec:
            now = datetime.now()
            entry_time = entrance_rec.entrance_time or now
            if entry_time.tzinfo is not None and now.tzinfo is None:
                from datetime import timezone
                now = datetime.now(timezone.utc)
            elif entry_time.tzinfo is None and now.tzinfo is not None:
                entry_time = entry_time.replace(tzinfo=now.tzinfo)

            total_seconds = max(0, int((now - entry_time).total_seconds()))

            # Backend 60-second transit buffer enforcement
            if total_seconds < 60 and not getattr(data, "force_override", False):
                rem_sec = max(0, 60 - total_seconds)
                raise HTTPException(
                    status_code=400,
                    detail=f"Gate Transit Protection: Vehicle '{entrance_rec.plate_number}' entered {total_seconds}s ago. Exit is locked for {rem_sec}s while vehicle passes the gate."
                )

            exit_time = get_utc_now()
            entrance_rec.exit_time = exit_time

            vehicle = None
            if entrance_rec.vehicle_id:
                vehicle = db.query(Vehicle).filter(Vehicle.id == entrance_rec.vehicle_id).first()
            if not vehicle and data.plate_number:
                clean_p = data.plate_number.strip().upper()
                vehicle = db.query(Vehicle).filter(func.upper(Vehicle.plate_number) == clean_p).first()

            db.commit()
            record_vehicle_exit_timestamp(entrance_rec.plate_number)
            if vehicle and vehicle.plate_number:
                record_vehicle_exit_timestamp(vehicle.plate_number)

            hours = math.floor(total_seconds / 3600)
            mins = math.floor((total_seconds % 3600) / 60)
            secs = total_seconds % 60
            duration_text = f"{hours}h {mins}m" if hours > 0 else (f"{mins}m {secs}s" if mins > 0 else f"{secs}s")

            cat = getattr(vehicle, "category", "Car") if vehicle else "Car"
            owner_name = getattr(vehicle, "owner_name", None) or getattr(vehicle, "visitor_name", None) or "Visitor / Guest"

            return {
                "message": "Vehicle departure processed successfully",
                "session_id": entrance_rec.id,
                "plate_number": entrance_rec.plate_number,
                "category": cat,
                "owner_name": owner_name,
                "vehicle_model": getattr(vehicle, "vehicle_model", "N/A"),
                "slot_name": entrance_rec.parking_slot or "Unassigned",
                "entry_time": entry_time.isoformat(),
                "exit_time": exit_time.isoformat(),
                "duration_seconds": total_seconds,
                "duration_text": duration_text,
                "status": "Exit Authorized"
            }

        raise HTTPException(
            status_code=404,
            detail="No active parking session or entrance record found for this vehicle/plate"
        )

    # Active ParkingSession found
    now = datetime.now()
    entry_time = session.entry_time or now
    if entry_time.tzinfo is not None and now.tzinfo is None:
        from datetime import timezone
        now = datetime.now(timezone.utc)
    elif entry_time.tzinfo is None and now.tzinfo is not None:
        entry_time = entry_time.replace(tzinfo=now.tzinfo)

    total_seconds = max(0, int((now - entry_time).total_seconds()))

    # Backend 60-second transit buffer enforcement
    if total_seconds < 60 and not getattr(data, "force_override", False):
        rem_sec = max(0, 60 - total_seconds)
        raise HTTPException(
            status_code=400,
            detail=f"Gate Transit Protection: Vehicle entered {total_seconds}s ago. Exit is locked for {rem_sec}s while vehicle passes the gate."
        )

    vehicle = db.query(Vehicle).filter(Vehicle.id == session.vehicle_id).first()
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == session.slot_id).first()

    exit_time = get_utc_now()
    session.exit_time = exit_time
    session.status = "Completed"

    if slot:
        slot.status = "Available"

    # Also update matching EntranceRecord
    if vehicle:
        entrance_rec = find_open_entrance_record_by_plate(db, vehicle.plate_number)
        if entrance_rec:
            entrance_rec.exit_time = exit_time

    db.commit()
    if vehicle and vehicle.plate_number:
        record_vehicle_exit_timestamp(vehicle.plate_number)

    hours = math.floor(total_seconds / 3600)
    mins = math.floor((total_seconds % 3600) / 60)
    secs = total_seconds % 60

    if hours > 0:
        duration_text = f"{hours}h {mins}m"
    elif mins > 0:
        duration_text = f"{mins}m {secs}s"
    else:
        duration_text = f"{secs}s"

    cat = getattr(vehicle, "category", "Car") if vehicle else "Car"

    return {
        "message": "Vehicle departure processed successfully",
        "session_id": session.id,
        "plate_number": vehicle.plate_number if vehicle else "UNKNOWN",
        "category": cat,
        "owner_name": vehicle.owner_name if vehicle else "Guest",
        "vehicle_model": vehicle.vehicle_model if vehicle else "N/A",
        "slot_name": slot.slot_name if slot else "N/A",
        "entry_time": entry_time.isoformat(),
        "exit_time": exit_time.isoformat(),
        "duration_seconds": total_seconds,
        "duration_text": duration_text,
        "status": "Exit Authorized"
    }


@router.get("/active")
def get_active_vehicles(db: Session = Depends(get_db)):
    active_entrances = db.query(EntranceRecord).filter(
        EntranceRecord.exit_time.is_(None),
        ~EntranceRecord.status.in_(["Flagged", "Denied"])
    ).order_by(EntranceRecord.entrance_time.desc()).all()

    result = []
    seen_plates = set()

    for rec in active_entrances:
        plate = rec.plate_number or "UNKNOWN"
        if plate in seen_plates:
            continue
        seen_plates.add(plate)

        v = None
        if rec.vehicle_id:
            v = db.query(Vehicle).filter(Vehicle.id == rec.vehicle_id).first()
        if not v and rec.plate_number:
            v = db.query(Vehicle).filter(Vehicle.plate_number == rec.plate_number).first()

        owner_name = "Visitor / Guest"
        vehicle_model = getattr(v, "vehicle_model", None) or "N/A"
        if v:
            if getattr(v, "is_guest", False) or getattr(v, "visitor_name", None):
                owner_name = getattr(v, "visitor_name", None) or getattr(v, "owner_name", None) or "Visitor / Guest"
            else:
                owner_name = getattr(v, "owner_name", None) or "Registered Owner"
        elif rec.status == "Approved":
            owner_name = "Registered Owner"

        result.append({
            "session_id": rec.id,
            "plate_number": plate,
            "category": getattr(v, "category", "Car") if v else "Car",
            "owner_name": owner_name,
            "vehicle_model": vehicle_model,
            "slot_number": rec.parking_slot or "Unassigned",
            "entry_time": rec.entrance_time.isoformat() if rec.entrance_time else None
        })

    # Include any active ParkingSession that didn't have an open EntranceRecord
    sessions = db.query(ParkingSession).filter(ParkingSession.status == "Active").all()
    for session in sessions:
        vehicle = db.query(Vehicle).filter(Vehicle.id == session.vehicle_id).first()
        plate = vehicle.plate_number if vehicle else None
        if plate and plate not in seen_plates:
            seen_plates.add(plate)
            slot = db.query(ParkingSlot).filter(ParkingSlot.id == session.slot_id).first()
            result.append({
                "session_id": session.id,
                "plate_number": plate,
                "category": getattr(vehicle, "category", "Car") if vehicle else "Car",
                "owner_name": vehicle.owner_name if vehicle else "Registered Owner",
                "vehicle_model": getattr(vehicle, "vehicle_model", "N/A"),
                "slot_number": slot.slot_name if slot else "Assigned",
                "entry_time": session.entry_time.isoformat() if session.entry_time else None
            })

    return result


@router.get("/history")
def parking_history(db: Session = Depends(get_db)):
    sessions = db.query(ParkingSession).order_by(ParkingSession.entry_time.desc()).all()

    result = []

    for session in sessions:
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == session.vehicle_id
        ).first()

        slot = db.query(ParkingSlot).filter(
            ParkingSlot.id == session.slot_id
        ).first()

        result.append({
            "session_id": session.id,
            "plate_number": vehicle.plate_number if vehicle else None,
            "category": getattr(vehicle, "category", "Car") if vehicle else "Car",
            "owner_name": vehicle.owner_name if vehicle else None,
            "vehicle_model": vehicle.vehicle_model if vehicle else None,
            "slot_number": slot.slot_name if slot else None,
            "entry_time": session.entry_time.isoformat() if session.entry_time else None,
            "exit_time": session.exit_time.isoformat() if session.exit_time else None,
            "status": session.status
        })

    return result


@router.delete("/history/{session_id}")
def delete_parking_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ParkingSession).filter(ParkingSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Parking session not found"
        )
    
    if session.status == "Active":
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == session.slot_id).first()
        if slot:
            slot.status = "Available"

    db.delete(session)
    db.commit()

    return {
        "message": "Parking session log deleted successfully",
        "session_id": session_id
    }


@router.delete("/history")
def clear_all_parking_history(db: Session = Depends(get_db)):
    active_sessions = db.query(ParkingSession).filter(ParkingSession.status == "Active").all()
    for session in active_sessions:
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == session.slot_id).first()
        if slot:
            slot.status = "Available"

    db.query(ParkingSession).delete()
    db.commit()

    return {
        "message": "All parking session logs cleared successfully"
    }


@router.get("/occupancy-analytics")
def get_occupancy_analytics(db: Session = Depends(get_db)):
    active_entrances = db.query(EntranceRecord).filter(
        EntranceRecord.exit_time.is_(None),
        ~EntranceRecord.status.in_(["Flagged", "Denied"])
    ).order_by(EntranceRecord.entrance_time.desc()).all()

    all_sessions = db.query(ParkingSession).all()

    category_counts = {"Car": 0, "Tuk Tuk": 0, "Bike": 0, "Van": 0, "Bus": 0, "Truck": 0}
    active_list = []
    seen_plates = set()

    now = datetime.now()

    def map_category_key(raw_cat: str) -> str:
        ck = (raw_cat or "Car").strip().lower()
        if ck in ("tuktuk", "tuk tuk", "three wheeler", "three-wheeler", "auto"):
            return "Tuk Tuk"
        elif ck in ("bike", "motorbike", "motorcycle"):
            return "Bike"
        elif ck == "van":
            return "Van"
        elif ck == "bus":
            return "Bus"
        elif ck in ("truck", "lorry"):
            return "Truck"
        return "Car"

    for rec in active_entrances:
        plate = rec.plate_number or "UNKNOWN"
        if plate in seen_plates:
            continue
        seen_plates.add(plate)

        vehicle = None
        if rec.vehicle_id:
            vehicle = db.query(Vehicle).filter(Vehicle.id == rec.vehicle_id).first()
        if not vehicle and rec.plate_number:
            vehicle = db.query(Vehicle).filter(Vehicle.plate_number == rec.plate_number).first()

        cat = getattr(vehicle, "category", "Car") if vehicle else "Car"
        if not cat:
            cat = "Car"
        
        target_cat = map_category_key(cat)
        category_counts[target_cat] += 1

        owner_name = "Visitor / Guest"
        if vehicle:
            if getattr(vehicle, "is_guest", False) or getattr(vehicle, "visitor_name", None):
                owner_name = getattr(vehicle, "visitor_name", None) or getattr(vehicle, "owner_name", None) or "Visitor / Guest"
            else:
                owner_name = getattr(vehicle, "owner_name", None) or "Registered Owner"
        elif rec.status == "Approved":
            owner_name = "Registered Owner"

        slot_name = rec.parking_slot or "Unassigned"

        dwell_seconds = int((now - rec.entrance_time).total_seconds()) if rec.entrance_time else 0

        active_list.append({
            "session_id": rec.id,
            "plate_number": plate,
            "owner_name": owner_name,
            "category": cat,
            "slot_name": slot_name,
            "entry_time": rec.entrance_time.isoformat() if rec.entrance_time else None,
            "dwell_seconds": dwell_seconds
        })

    active_sessions = db.query(ParkingSession).filter(ParkingSession.status == "Active").all()
    for s in active_sessions:
        v = db.query(Vehicle).filter(Vehicle.id == s.vehicle_id).first()
        plate = v.plate_number if v else "UNKNOWN"
        if plate not in seen_plates:
            seen_plates.add(plate)
            slot = db.query(ParkingSlot).filter(ParkingSlot.id == s.slot_id).first()
            cat = getattr(v, "category", "Car") if v else "Car"
            target_cat = map_category_key(cat)
            category_counts[target_cat] += 1
            
            dwell_seconds = int((now - s.entry_time).total_seconds()) if s.entry_time else 0

            active_list.append({
                "session_id": s.id,
                "plate_number": plate,
                "owner_name": (v.owner_name if v else "Registered Owner"),
                "category": cat,
                "slot_name": (slot.slot_name if slot else "Assigned"),
                "entry_time": s.entry_time.isoformat() if s.entry_time else None,
                "dwell_seconds": dwell_seconds
            })

    hourly_arrivals = [0] * 24
    hourly_departures = [0] * 24

    for s in all_sessions:
        if s.entry_time:
            hourly_arrivals[s.entry_time.hour] += 1
        if s.exit_time:
            hourly_departures[s.exit_time.hour] += 1

    return {
        "active_total": len(active_list),
        "category_counts": category_counts,
        "active_vehicles": active_list,
        "hourly_arrivals": hourly_arrivals,
        "hourly_departures": hourly_departures
    }