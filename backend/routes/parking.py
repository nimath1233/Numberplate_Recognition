from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import get_db
from models import ParkingSlot, ParkingSession, Vehicle, EntranceRecord
from schemas import ParkingAssign, ParkingRelease

router = APIRouter(
    prefix="/parking",
    tags=["Parking"]
)


def get_utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


@router.post("/create-slots")
def create_slots(db: Session = Depends(get_db)):
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
        "message": "3 parking slots created (P1, P2, P3)"
    }


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

    db.commit()

    return {
        "message": "Vehicle released successfully"
    }


@router.post("/exit-process")
def process_vehicle_exit(data: ParkingRelease, db: Session = Depends(get_db)):
    import math

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
        raise HTTPException(
            status_code=404,
            detail="No active parking session found for this vehicle/plate"
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
        entrance_rec = db.query(EntranceRecord).filter(
            EntranceRecord.plate_number == vehicle.plate_number,
            EntranceRecord.exit_time.is_(None)
        ).order_by(EntranceRecord.entrance_time.desc()).first()

        if entrance_rec:
            entrance_rec.exit_time = exit_time

    db.commit()

    entry_time = session.entry_time or exit_time
    total_seconds = max(0, int((exit_time - entry_time).total_seconds()))
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
        "entry_time": entry_time.isoformat() + "Z",
        "exit_time": exit_time.isoformat() + "Z",
        "duration_seconds": total_seconds,
        "duration_text": duration_text,
        "status": "Exit Authorized"
    }


@router.get("/active")
def get_active_vehicles(db: Session = Depends(get_db)):
    sessions = db.query(ParkingSession).filter(
        ParkingSession.status == "Active"
    ).all()

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
            "entry_time": (session.entry_time.isoformat() + "Z") if session.entry_time else None
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
            "entry_time": (session.entry_time.isoformat() + "Z") if session.entry_time else None,
            "exit_time": (session.exit_time.isoformat() + "Z") if session.exit_time else None,
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
    active_sessions = db.query(ParkingSession).filter(ParkingSession.status == "Active").all()
    all_sessions = db.query(ParkingSession).all()

    category_counts = {"Car": 0, "Bike": 0, "Van": 0, "Bus": 0, "Truck": 0}
    active_list = []

    now = datetime.now()

    for s in active_sessions:
        v = db.query(Vehicle).filter(Vehicle.id == s.vehicle_id).first()
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == s.slot_id).first()
        cat = getattr(v, "category", "Car") if v else "Car"
        if cat in category_counts:
            category_counts[cat] += 1
        else:
            category_counts["Car"] += 1
        
        dwell_seconds = int((now - s.entry_time).total_seconds()) if s.entry_time else 0

        active_list.append({
            "session_id": s.id,
            "plate_number": v.plate_number if v else "UNKNOWN",
            "owner_name": v.owner_name if v else "N/A",
            "category": cat,
            "slot_name": slot.slot_name if slot else "N/A",
            "entry_time": (s.entry_time.isoformat() + "Z") if s.entry_time else None,
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
        "active_total": len(active_sessions),
        "category_counts": category_counts,
        "active_vehicles": active_list,
        "hourly_arrivals": hourly_arrivals,
        "hourly_departures": hourly_departures
    }