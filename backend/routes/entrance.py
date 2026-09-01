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

from pathlib import Path
from config import UPLOAD_DIR
import time

UPLOAD_FOLDER = UPLOAD_DIR
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# In-memory post-exit cooldown cache: { clean_plate_string: exit_unix_timestamp }
recent_exits_cache: dict[str, float] = {}

def record_vehicle_exit_timestamp(plate_number: str):
    """Record an exit event timestamp for immediate post-exit re-entry cooldown checks."""
    if not plate_number:
        return
    clean = re.sub(r'[\s\-_]', '', str(plate_number).strip().upper())
    if clean and clean not in ("UNKNOWN", "NOPLATE"):
        recent_exits_cache[clean] = time.time()


def check_post_exit_cooldown(db: Session, plate_number: str, vehicle_id: int | None = None, cooldown_seconds: int = 60) -> tuple[bool, int]:
    """
    Check if the vehicle exited within the last `cooldown_seconds` (default 60s).
    Enforces post-exit re-entry protection to prevent immediate re-entry loop.
    Returns: (is_in_cooldown: bool, remaining_seconds: int)
    """
    if not plate_number:
        return False, 0
    clean_target = re.sub(r'[\s\-_]', '', str(plate_number).strip().upper())
    if not clean_target or clean_target in ("UNKNOWN", "NOPLATE"):
        return False, 0

    now_unix = time.time()

    # 1. Quick in-memory cache check
    mem_exit = recent_exits_cache.get(clean_target)
    if mem_exit and (now_unix - mem_exit < cooldown_seconds):
        rem = int(cooldown_seconds - (now_unix - mem_exit))
        return True, max(1, rem)

    now_dt = datetime.now()

    # 2. Database EntranceRecord check for most recent exit
    recent_closed = db.query(EntranceRecord).filter(
        EntranceRecord.exit_time.isnot(None)
    ).order_by(EntranceRecord.exit_time.desc()).limit(30).all()

    for rec in recent_closed:
        if rec.plate_number:
            rec_clean = re.sub(r'[\s\-_]', '', rec.plate_number.strip().upper())
            if rec_clean == clean_target:
                exit_ts = rec.exit_time
                if exit_ts:
                    if exit_ts.tzinfo is not None and now_dt.tzinfo is None:
                        from datetime import timezone
                        now_dt = datetime.now(timezone.utc)
                    elif exit_ts.tzinfo is None and now_dt.tzinfo is not None:
                        exit_ts = exit_ts.replace(tzinfo=now_dt.tzinfo)

                    secs_since_exit = (now_dt - exit_ts).total_seconds()
                    if 0 <= secs_since_exit < cooldown_seconds:
                        rem = int(cooldown_seconds - secs_since_exit)
                        recent_exits_cache[clean_target] = now_unix - secs_since_exit
                        return True, max(1, rem)
                break

    # 3. Database ParkingSession check if vehicle_id is provided
    if vehicle_id:
        sess = db.query(ParkingSession).filter(
            ParkingSession.vehicle_id == vehicle_id,
            ParkingSession.status == "Completed",
            ParkingSession.exit_time.isnot(None)
        ).order_by(ParkingSession.exit_time.desc()).first()
        if sess and sess.exit_time:
            exit_ts = sess.exit_time
            if exit_ts.tzinfo is not None and now_dt.tzinfo is None:
                from datetime import timezone
                now_dt = datetime.now(timezone.utc)
            elif exit_ts.tzinfo is None and now_dt.tzinfo is not None:
                exit_ts = exit_ts.replace(tzinfo=now_dt.tzinfo)

            secs_since_exit = (now_dt - exit_ts).total_seconds()
            if 0 <= secs_since_exit < cooldown_seconds:
                rem = int(cooldown_seconds - secs_since_exit)
                recent_exits_cache[clean_target] = now_unix - secs_since_exit
                return True, max(1, rem)

    return False, 0


def get_first_available_slot(db: Session):
    # Collect slot IDs occupied in active ParkingSessions
    active_sessions = db.query(ParkingSession.slot_id).filter(
        ParkingSession.status == "Active"
    ).all()
    occupied_slot_ids = {s[0] for s in active_sessions if s[0] is not None}

    # Collect slot names occupied in active EntranceRecords (vehicles currently inside without exit)
    active_entrances = db.query(EntranceRecord.parking_slot).filter(
        EntranceRecord.exit_time.is_(None),
        EntranceRecord.parking_slot.isnot(None)
    ).all()
    occupied_slot_names = {s[0] for s in active_entrances if s[0]}

    # Query all slots sorted by name
    slots = db.query(ParkingSlot).order_by(ParkingSlot.slot_name).all()
    if not slots:
        # Create standard slots P1, P2, P3 if none exist in DB
        p1 = ParkingSlot(slot_name="P1", status="Available")
        p2 = ParkingSlot(slot_name="P2", status="Available")
        p3 = ParkingSlot(slot_name="P3", status="Available")
        db.add_all([p1, p2, p3])
        db.commit()
        slots = db.query(ParkingSlot).order_by(ParkingSlot.slot_name).all()

    # If slot is referenced by an active session or active entrance record, ensure status is Occupied
    for slot in slots:
        if slot.id in occupied_slot_ids or slot.slot_name in occupied_slot_names:
            if slot.status != "Occupied":
                slot.status = "Occupied"
                db.commit()

    # Find slot not in occupied sets
    for slot in slots:
        if slot.id not in occupied_slot_ids and slot.slot_name not in occupied_slot_names:
            return slot

    return None


def cleanup_duplicate_open_entrance_records(db: Session):
    """
    Ensure each plate number only has AT MOST ONE active open EntranceRecord (exit_time is None).
    Any older open EntranceRecords for the same plate number will have their exit_time closed.
    """
    try:
        open_recs = db.query(EntranceRecord).filter(
            EntranceRecord.exit_time.is_(None)
        ).order_by(EntranceRecord.plate_number, EntranceRecord.entrance_time.desc()).all()

        seen_plates = set()
        cleaned = False

        for rec in open_recs:
            plate = (rec.plate_number or "").strip().upper()
            if not plate:
                continue
            if plate in seen_plates:
                # Older duplicate open record for the same plate! Auto-close it.
                rec.exit_time = rec.entrance_time or datetime.now()
                cleaned = True
            else:
                seen_plates.add(plate)

        if cleaned:
            db.commit()
    except Exception as err:
        db.rollback()
        print("Error cleaning up duplicate open entrance records:", err)


def find_open_entrance_record_by_plate(db: Session, plate_number: str):
    """
    Search for active open EntranceRecord (exit_time is None) with space and hyphen insensitivity.
    """
    clean_target = re.sub(r'[\s\-_]', '', str(plate_number or "").strip().upper())
    if not clean_target:
        return None

    open_recs = db.query(EntranceRecord).filter(
        EntranceRecord.exit_time.is_(None)
    ).order_by(EntranceRecord.entrance_time.desc()).all()

    for rec in open_recs:
        if rec.plate_number:
            rec_clean = re.sub(r'[\s\-_]', '', rec.plate_number.strip().upper())
            if rec_clean == clean_target:
                return rec
    return None


def prepare_new_entrance_record(db: Session, plate_number: str, now: datetime = None):
    if not now:
        now = datetime.now()
    clean_target = re.sub(r'[\s\-_]', '', str(plate_number or "").strip().upper())
    if not clean_target:
        return None

    open_recs = db.query(EntranceRecord).filter(
        EntranceRecord.exit_time.is_(None)
    ).order_by(EntranceRecord.entrance_time.desc()).all()

    plate_open_recs = [
        r for r in open_recs if r.plate_number and re.sub(r'[\s\-_]', '', r.plate_number.strip().upper()) == clean_target
    ]

    if plate_open_recs:
        latest_open = plate_open_recs[0]
        if latest_open.entrance_time:
            now_dt = now
            ent_ts = latest_open.entrance_time
            if ent_ts.tzinfo is not None and now_dt.tzinfo is None:
                from datetime import timezone
                now_dt = datetime.now(timezone.utc)
            elif ent_ts.tzinfo is None and now_dt.tzinfo is not None:
                ent_ts = ent_ts.replace(tzinfo=now_dt.tzinfo)

            secs_since = (now_dt - ent_ts).total_seconds()
            if secs_since < 60:
                return latest_open

        for rec in plate_open_recs:
            rec.exit_time = now
        db.commit()

    return None


def resolve_real_snapshot(db: Session, plate_number: str, explicit_snap: str | None = None, vehicle_obj: Vehicle | None = None) -> str | None:
    """Helper to ensure actual camera/uploaded vehicle snapshot is saved instead of dummy URLs."""
    if explicit_snap and explicit_snap.strip() and "unsplash" not in explicit_snap.lower():
        return explicit_snap.strip()
        
    clean_no_spaces = re.sub(r'[\s\-_]', '', (plate_number or '').strip().upper())
    
    # 1. Search recent detection logs for this plate
    if clean_no_spaces:
        recent_logs = db.query(DetectionLog).filter(DetectionLog.snapshot.isnot(None)).order_by(DetectionLog.detection_time.desc()).limit(30).all()
        for log in recent_logs:
            if log.plate_number and re.sub(r'[\s\-_]', '', log.plate_number.strip().upper()) == clean_no_spaces:
                if log.snapshot and "unsplash" not in log.snapshot.lower():
                    return log.snapshot

    # 2. Check registered vehicle image
    if vehicle_obj and vehicle_obj.vehicle_image and "unsplash" not in vehicle_obj.vehicle_image.lower():
        return vehicle_obj.vehicle_image
        
    # 3. Search vehicles table if vehicle_obj was not passed
    if clean_no_spaces:
        for v in db.query(Vehicle).all():
            if v.plate_number and re.sub(r'[\s\-_]', '', v.plate_number.strip().upper()) == clean_no_spaces:
                if v.vehicle_image and "unsplash" not in v.vehicle_image.lower():
                    return v.vehicle_image
    
    # 4. Fallback to latest overall detection log snapshot
    latest_log = db.query(DetectionLog).filter(DetectionLog.snapshot.isnot(None)).order_by(DetectionLog.detection_time.desc()).first()
    if latest_log and latest_log.snapshot and "unsplash" not in latest_log.snapshot.lower():
        return latest_log.snapshot
        
    return None


def process_vehicle_entrance(
    db: Session,
    plate_number: str,
    snapshot_path: str | None = None,
    parking_slot_name: str | None = None,
    status: str = "Approved"
):
    clean_plate = plate_number.strip().upper()
    clean_no_spaces = re.sub(r'[\s\-_]', '', clean_plate)

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

    # 2. Check if vehicle is ALREADY inside premises (exit_time is None) using normalized plate matching
    open_rec = find_open_entrance_record_by_plate(db, clean_plate)

    if open_rec:
        now = datetime.now()
        entry_time = open_rec.entrance_time or now
        total_seconds = max(0, int((now - entry_time).total_seconds()))

        # 60-SECOND GATE TRANSIT BUFFER:
        # If vehicle entered less than 60 seconds ago, DO NOT trigger exit!
        if total_seconds < 60:
            remaining_sec = max(0, 60 - total_seconds)
            return {
                "success": True,
                "is_departure": False,
                "in_transit_buffer": True,
                "transit_remaining_sec": remaining_sec,
                "message": f"Vehicle '{clean_plate}' entered {total_seconds}s ago (Gate transit in progress). Exit locked for {remaining_sec}s.",
                "plate_number": clean_plate,
                "slot_name": open_rec.parking_slot or "Assigned",
                "category": getattr(vehicle, "category", "Car") or "Car",
                "owner_name": vehicle.owner_name,
                "status": "In Transit"
            }

        open_rec.exit_time = now

        active_sess = db.query(ParkingSession).filter(
            ParkingSession.vehicle_id == vehicle.id,
            ParkingSession.status == "Active"
        ).first()
        if active_sess:
            active_sess.exit_time = now
            active_sess.status = "Completed"
            slot = db.query(ParkingSlot).filter(ParkingSlot.id == active_sess.slot_id).first()
            if slot:
                slot.status = "Available"

        db.commit()
        record_vehicle_exit_timestamp(clean_plate)

        hours = total_seconds // 3600
        mins = (total_seconds % 3600) // 60
        secs = total_seconds % 60
        duration_text = f"{hours}h {mins}m" if hours > 0 else (f"{mins}m {secs}s" if mins > 0 else f"{secs}s")

        return {
            "success": True,
            "is_departure": True,
            "message": f"Vehicle '{clean_plate}' was ALREADY inside premises. Processed DEPARTURE (EXIT AUTHORIZED).",
            "plate_number": clean_plate,
            "slot_name": open_rec.parking_slot or "Unassigned",
            "category": getattr(vehicle, "category", "Car") or "Car",
            "owner_name": vehicle.owner_name,
            "duration_text": duration_text,
            "status": "Exit Authorized"
        }

    # 2.5. Check 60-SECOND POST-EXIT RE-ENTRY COOLDOWN:
    # If vehicle exited within the last 60 seconds, DO NOT create another EntranceRecord or assign a slot!
    in_exit_cd, exit_cd_rem = check_post_exit_cooldown(db, clean_plate, vehicle.id if vehicle else None, 60)
    if in_exit_cd:
        return {
            "success": True,
            "is_departure": False,
            "in_post_exit_cooldown": True,
            "exit_cooldown_remaining_sec": exit_cd_rem,
            "message": f"Vehicle recently exited — transit cooldown active ({exit_cd_rem}s remaining). Re-entry locked.",
            "plate_number": clean_plate,
            "slot_name": "Re-entry Cooldown",
            "category": getattr(vehicle, "category", "Car") or "Car",
            "owner_name": vehicle.owner_name,
            "status": "Transit Cooldown"
        }

    # 3. Accept and resolve real snapshot
    final_snapshot = resolve_real_snapshot(db, vehicle.plate_number, snapshot_path, vehicle)

    # 3. Resolve assigned parking slot (if available)
    assigned_slot = parking_slot_name
    if not assigned_slot:
        # Check active session for this vehicle
        active_session = db.query(ParkingSession).filter(
            ParkingSession.vehicle_id == vehicle.id,
            ParkingSession.status == "Active"
        ).first()

        if active_session:
            slot = db.query(ParkingSlot).filter(ParkingSlot.id == active_session.slot_id).first()
            if slot:
                assigned_slot = slot.slot_name

        if not assigned_slot:
            available_slot = get_first_available_slot(db)

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
            else:
                assigned_slot = "No Slot Available (FULL)"

    # 4. Save entrance record & Allowed DetectionLog (auto-closing previous open entrance record)
    prepare_new_entrance_record(db, vehicle.plate_number)
    record = EntranceRecord(
        plate_number=vehicle.plate_number,
        vehicle_id=vehicle.id,
        snapshot=final_snapshot,
        parking_slot=assigned_slot,
        status=status or "Approved",
        entrance_time=datetime.now()
    )
    db.add(record)

    allowed_detection = DetectionLog(
        plate_number=vehicle.plate_number,
        snapshot=final_snapshot,
        status="Allowed",
        detection_time=datetime.now()
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
            "entrance_time": record.entrance_time.isoformat() if record.entrance_time else None
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
            "registered_date": vehicle.registered_date.isoformat() if vehicle.registered_date else None
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

    # 2. Check if vehicle is ALREADY inside premises (exit_time is None)
    open_rec = find_open_entrance_record_by_plate(db, clean_plate)

    if open_rec:
        now = datetime.now()
        entry_time = open_rec.entrance_time or now
        total_seconds = max(0, int((now - entry_time).total_seconds()))

        # 60-SECOND GATE TRANSIT BUFFER:
        # If guest vehicle entered less than 60 seconds ago, DO NOT trigger exit!
        if total_seconds < 60:
            remaining_sec = max(0, 60 - total_seconds)
            return {
                "success": True,
                "is_departure": False,
                "in_transit_buffer": True,
                "transit_remaining_sec": remaining_sec,
                "message": f"Guest Vehicle '{clean_plate}' entered {total_seconds}s ago (Gate transit in progress). Exit locked for {remaining_sec}s.",
                "plate_number": open_rec.plate_number,
                "slot_name": open_rec.parking_slot or "Unassigned",
                "category": getattr(vehicle, "category", "Car") or "Car",
                "owner_name": getattr(vehicle, "owner_name", None) or "Guest",
                "status": "In Transit"
            }

        open_rec.exit_time = now

        active_sess = db.query(ParkingSession).filter(
            ParkingSession.vehicle_id == vehicle.id,
            ParkingSession.status == "Active"
        ).first()
        if active_sess:
            active_sess.exit_time = now
            active_sess.status = "Completed"
            slot = db.query(ParkingSlot).filter(ParkingSlot.id == active_sess.slot_id).first()
            if slot:
                slot.status = "Available"

        db.commit()
        record_vehicle_exit_timestamp(clean_plate)

        hours = total_seconds // 3600
        mins = (total_seconds % 3600) // 60
        secs = total_seconds % 60
        duration_text = f"{hours}h {mins}m" if hours > 0 else (f"{mins}m {secs}s" if mins > 0 else f"{secs}s")

        return {
            "success": True,
            "is_departure": True,
            "message": f"Guest Vehicle '{clean_plate}' was ALREADY inside premises. Processed DEPARTURE (EXIT AUTHORIZED).",
            "plate_number": open_rec.plate_number,
            "slot_name": open_rec.parking_slot or "Unassigned",
            "category": getattr(vehicle, "category", "Car") or "Car",
            "owner_name": getattr(vehicle, "owner_name", None) or "Guest",
            "duration_text": duration_text,
            "status": "Exit Authorized"
        }

    # 2.5. Check 60-SECOND POST-EXIT RE-ENTRY COOLDOWN:
    # If guest vehicle exited within the last 60 seconds, DO NOT create another EntranceRecord or assign a slot!
    in_exit_cd, exit_cd_rem = check_post_exit_cooldown(db, clean_plate, vehicle.id if vehicle else None, 60)
    if in_exit_cd:
        return {
            "success": True,
            "is_departure": False,
            "in_post_exit_cooldown": True,
            "exit_cooldown_remaining_sec": exit_cd_rem,
            "message": f"Guest Vehicle recently exited — transit cooldown active ({exit_cd_rem}s remaining). Re-entry locked.",
            "plate_number": clean_plate,
            "slot_name": "Re-entry Cooldown",
            "category": getattr(vehicle, "category", "Car") or "Car",
            "owner_name": getattr(vehicle, "owner_name", None) or "Guest",
            "status": "Transit Cooldown"
        }

    assigned_slot = None
    active_session = db.query(ParkingSession).filter(
        ParkingSession.vehicle_id == vehicle.id,
        ParkingSession.status == "Active"
    ).first()

    if active_session:
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == active_session.slot_id).first()
        if slot:
            assigned_slot = slot.slot_name

    if not assigned_slot:
        available_slot = get_first_available_slot(db)
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
        else:
            assigned_slot = "No Slot Available (FULL)"

    # 3. Create Entrance Record (Status: Guest Approved - auto-closing previous open entrance record)
    prepare_new_entrance_record(db, vehicle.plate_number)
    real_snap = resolve_real_snapshot(db, vehicle.plate_number, getattr(data, "snapshot", None), vehicle)
    record = EntranceRecord(
        plate_number=vehicle.plate_number,
        vehicle_id=vehicle.id,
        snapshot=real_snap,
        parking_slot=assigned_slot,
        status="Guest Approved",
        entrance_time=datetime.now()
    )
    db.add(record)

    allowed_detection = DetectionLog(
        plate_number=vehicle.plate_number,
        snapshot=real_snap,
        status="Allowed",
        detection_time=datetime.now()
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
    real_snap = resolve_real_snapshot(db, clean_plate, getattr(data, "snapshot", None))

    # 1. Create Flagged DetectionLog entry
    flag_detection = DetectionLog(
        plate_number=clean_plate,
        snapshot=real_snap,
        status="Flagged",
        detection_time=datetime.now()
    )
    db.add(flag_detection)

    # 2. Create Security Alert record
    security_alert = Alert(
        plate_number=clean_plate,
        snapshot=real_snap,
        reason=f"Guest/Unregistered vehicle '{clean_plate}' entry REJECTED by officer. Barrier kept closed.",
        alert_time=datetime.now()
    )
    db.add(security_alert)
    db.commit()
    db.refresh(security_alert)

    # 3. Broadcast real-time WebSocket alert event
    try:
        from websocket_manager import ws_manager
        ws_manager.broadcast_sync({
            "event": "DETECTION_ALERT",
            "data": {
                "id": security_alert.id,
                "plate_number": clean_plate,
                "reason": security_alert.reason,
                "snapshot": real_snap,
                "status": "Flagged",
                "alert_time": security_alert.alert_time.isoformat() if security_alert.alert_time else datetime.now().isoformat()
            }
        })
    except Exception as e:
        print("WebSocket guest deny alert warning:", e)

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
        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        extension = Path(file.filename).suffix.lower()
        if extension not in allowed_extensions:
            extension = ".jpg"
        filename = f"entrance_{uuid.uuid4()}{extension}"
        file_path = UPLOAD_FOLDER / filename
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
    cleanup_duplicate_open_entrance_records(db)

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
            "entrance_time": rec.entrance_time.isoformat() if rec.entrance_time else None,
            "exit_time": rec.exit_time.isoformat() if rec.exit_time else None,
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
            "entrance_time": rec.entrance_time.isoformat() if rec.entrance_time else None,
            "vehicle": vehicle_info
        }
    }


@router.get("/records/{record_id}")
def get_single_entrance_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    rec = db.query(EntranceRecord).filter(EntranceRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Entrance record not found")

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

    return {
        "id": rec.id,
        "plate_number": rec.plate_number,
        "vehicle_id": rec.vehicle_id,
        "snapshot": rec.snapshot,
        "parking_slot": rec.parking_slot,
        "status": rec.status,
        "entrance_time": rec.entrance_time.isoformat() if rec.entrance_time else None,
        "exit_time": rec.exit_time.isoformat() if rec.exit_time else None,
        "duration_text": duration_text,
        "vehicle": vehicle_info
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
