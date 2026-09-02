from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import shutil
import os
import uuid
import re
import cv2
from datetime import datetime

from database import get_db
from dependencies import get_current_user
from models import User, Vehicle, DetectionLog, Alert, ParkingSlot, ParkingSession, EntranceRecord
from schemas import PlateCheckRequest
from ai.modules.validator import normalize_plate
from ai.anpr_pipeline import get_pipeline

router = APIRouter(
    prefix="/detection",
    tags=["AI Detection"]
)


from pathlib import Path
import time
from config import UPLOAD_DIR

UPLOAD_FOLDER = UPLOAD_DIR
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# 2-Minute (120-second) per-plate cooldown cache: { clean_plate_string: last_processed_unix_timestamp }
COOLDOWN_SECONDS = int(os.environ.get("ANPR_COOLDOWN_SECONDS", "120"))
recent_scans_cache: dict[str, float] = {}

def is_plate_in_cooldown(plate: str, update_cache: bool = True) -> tuple[bool, int]:
    """
    Check if the same plate number was scanned and logged within the cooldown period (120s).
    Args:
        plate: Raw or normalized plate string
        update_cache: If True, registers/updates the timestamp in cooldown cache.
                      If False, only inspects cooldown status without locking.
    Returns: (is_duplicate: bool, remaining_seconds: int)
    """
    if not plate:
        return False, 0
    clean = re.sub(r'[\s\-_]', '', str(plate).strip().upper())
    if not clean or clean == "UNKNOWN" or clean == "NOPLATE":
        return False, 0

    now = time.time()
    last_time = recent_scans_cache.get(clean)
    if last_time and (now - last_time < COOLDOWN_SECONDS):
        remaining = int(COOLDOWN_SECONDS - (now - last_time))
        return True, remaining

    if update_cache:
        # Register/Update this plate timestamp only when confirmed
        recent_scans_cache[clean] = now

    # Housekeeping: prune old entries
    if len(recent_scans_cache) > 300:
        cutoff = now - 600
        for k in list(recent_scans_cache.keys()):
            if recent_scans_cache[k] < cutoff:
                del recent_scans_cache[k]

    return False, 0


def match_registered_vehicle(db: Session, raw_or_norm_plate: str) -> tuple[Vehicle | None, bool, str]:
    """
    Intelligently match a detected plate against registered database vehicles.
    Handles:
    1. Exact normalized matches (e.g. 'LN-2660' -> 'LN-2660')
    2. Sri Lankan province badge clipping (e.g. 'GLN-2660' or 'SLN-2660' where 'SG' province was read as 'G'/'S')
    3. OCR letter reflection artifact (e.g. 'LNN-2660' or 'LLN-2660')
    Returns: (vehicle: Optional[Vehicle], is_registered: bool, resolved_plate: str)
    """
    if not raw_or_norm_plate:
        return None, False, ""

    clean_target = re.sub(r'[\s\-_]', '', str(raw_or_norm_plate)).upper()
    if not clean_target:
        return None, False, ""

    all_vehicles = db.query(Vehicle).all()

    # 1. Exact normalized match
    for v in all_vehicles:
        if v.plate_number and re.sub(r'[\s\-_]', '', v.plate_number).upper() == clean_target:
            is_reg = not getattr(v, "is_guest", False)
            return v, is_reg, v.plate_number

    # 2. Province artifact strip (e.g. GLN2660, SLN2660, WLN2660 -> LN2660)
    if len(clean_target) >= 6 and clean_target[0] in 'GSWCPNEU':
        sub_clean = clean_target[1:]
        for v in all_vehicles:
            if v.plate_number and re.sub(r'[\s\-_]', '', v.plate_number).upper() == sub_clean:
                is_reg = not getattr(v, "is_guest", False)
                return v, is_reg, v.plate_number

    # 3. Duplicate letter reflection (e.g. LNN2660, LLN2660 -> LN2660)
    if len(clean_target) == 7:
        if clean_target[1] == clean_target[2]:
            sub_clean = clean_target[0] + clean_target[2:]
            for v in all_vehicles:
                if v.plate_number and re.sub(r'[\s\-_]', '', v.plate_number).upper() == sub_clean:
                    is_reg = not getattr(v, "is_guest", False)
                    return v, is_reg, v.plate_number
        elif clean_target[0] == clean_target[1]:
            sub_clean = clean_target[1:]
            for v in all_vehicles:
                if v.plate_number and re.sub(r'[\s\-_]', '', v.plate_number).upper() == sub_clean:
                    is_reg = not getattr(v, "is_guest", False)
                    return v, is_reg, v.plate_number

    return None, False, raw_or_norm_plate


@router.post("/upload")
def upload_image(
    file: UploadFile = File(...),
    process_ai: bool = Query(True, description="Whether to run automatic ANPR detection on uploaded image"),
    verification_mode: str = Query("smart", description="Verification mode: smart, strict, or auto"),
    gate_line: str | None = Query(None, description="Trigger line: 'GREEN' (Driveway) or 'RED' (Outer Gate)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    """
    Upload an image frame/photo and optionally run end-to-end ANPR detection,
    plate normalization, verification, and parking assignment.
    """
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only image files (.jpg, .jpeg, .png, .webp, .bmp) are allowed"
        )

    filename = f"{uuid.uuid4()}{extension}"
    file_path = UPLOAD_FOLDER / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Base response
    base_response = {
        "message": "Image uploaded successfully",
        "filename": filename,
        "path": str(file_path),
        "uploaded_by": current_user.username,
        "detected": False,
        "recognized_plate": None
    }

    if not process_ai:
        return base_response

    # Read image and run ANPR Pipeline
    try:
        image = cv2.imread(str(file_path))
        if image is None:
            return base_response

        pipeline = get_pipeline()
        detections, proc_time = pipeline.process(image)

        if not detections:
            return base_response

        # Select best detection: STRICTLY require a validated Sri Lankan plate format with YOLO bbox
        valid_dets = [
            d for d in detections 
            if d.get("valid") 
            and d.get("bbox") 
            and float(d.get("ocr_confidence", 0.0)) >= 0.70
            and d.get("plate_category", "Unknown") != "Unknown"
            and len(re.sub(r"[\s\-_]", "", d.get("normalized_plate") or d.get("validated_text") or "")) >= 4
        ]
        if not valid_dets:
            return base_response

        best_det = max(valid_dets, key=lambda x: x.get("ocr_confidence", 0.0))

        norm_plate = best_det.get("normalized_plate") or best_det.get("validated_text") or ""
        raw_plate = best_det.get("raw_plate") or best_det.get("text", "")
        cat = best_det.get("plate_category") or best_det.get("plate_type", "Unknown")
        conf = float(best_det.get("ocr_confidence", 0.0))
        valid = bool(best_det.get("valid", False))
        bbox = [int(b) for b in best_det.get("bbox", ())] if best_det.get("bbox") else None
        track_id = int(best_det.get("track_id", 1))
        track_history = best_det.get("track_history", [])
        vehicle_bbox = best_det.get("vehicle_bbox")
        vehicle_type = best_det.get("vehicle_category", "Car")



        # Save rectified plate crop if available
        crop_filename = None
        rectified_crop = best_det.get("rectified")
        if rectified_crop is not None and rectified_crop.size > 0:
            crop_filename = f"crop_{filename}"
            crop_path = UPLOAD_FOLDER / crop_filename
            cv2.imwrite(str(crop_path), rectified_crop)

        # Database matching (Smart Sri Lankan province artifact & OCR resolution)
        vehicle, is_registered, resolved_plate = match_registered_vehicle(db, norm_plate or raw_plate)
        if resolved_plate:
            effective_plate = resolved_plate
        # Check if plate has an active Security Alert (Flagged / Denied / Blacklisted)
        active_alert = db.query(Alert).filter(
            func.upper(Alert.plate_number) == func.upper(effective_plate)
        ).order_by(Alert.alert_time.desc()).first()

        if active_alert:
            status = "Flagged"
            parking_message = f"SECURITY ALERT ACTIVE: Vehicle '{effective_plate}' is flagged. Barrier kept LOCKED."
        elif is_registered:
            status = "Allowed"
            parking_message = "Checking parking bay..."
        else:
            status = "Pending Verification"
            parking_message = "Barrier LOCKED. Officer guest authorization required."

        # 0. Check Parking Status & Presence First (Always computed for accurate UI/Gate state)
        parking_assigned = False
        parking_slot_name = None
        if not is_registered and not active_alert:
            parking_message = "Barrier LOCKED. Officer guest authorization required."

        is_already_parked = False
        in_transit_buffer = False
        transit_remaining_sec = 0
        stay_seconds = 0
        in_exit_cooldown = False
        exit_cooldown_remaining_sec = 0

        # Check if vehicle is already inside (active ParkingSession OR open EntranceRecord)
        from routes.entrance import find_open_entrance_record_by_plate, check_post_exit_cooldown
        open_entrance = find_open_entrance_record_by_plate(db, effective_plate)

        active_session = None
        if vehicle:
            active_session = db.query(ParkingSession).filter(
                ParkingSession.vehicle_id == vehicle.id,
                ParkingSession.status == "Active"
            ).first()

        if active_session or open_entrance:
            is_already_parked = True
            entry_ts = None
            if active_session:
                slot = db.query(ParkingSlot).filter(ParkingSlot.id == active_session.slot_id).first()
                parking_slot_name = slot.slot_name if slot else None
                entry_ts = getattr(active_session, "entry_time", None)

            if not parking_slot_name and open_entrance:
                parking_slot_name = open_entrance.parking_slot or "Assigned Bay"
            if not entry_ts and open_entrance:
                entry_ts = open_entrance.entrance_time

            if not entry_ts and vehicle:
                rec = db.query(EntranceRecord).filter(
                    EntranceRecord.vehicle_id == vehicle.id,
                    EntranceRecord.exit_time.is_(None)
                ).order_by(EntranceRecord.entrance_time.desc()).first()
                if rec:
                    entry_ts = rec.entrance_time

            if entry_ts:
                now_dt = datetime.now()
                if entry_ts.tzinfo is not None and now_dt.tzinfo is None:
                    from datetime import timezone
                    now_dt = datetime.now(timezone.utc)
                elif entry_ts.tzinfo is None and now_dt.tzinfo is not None:
                    entry_ts = entry_ts.replace(tzinfo=now_dt.tzinfo)

                stay_seconds = max(0, int((now_dt - entry_ts).total_seconds()))
                if stay_seconds < 60:
                    in_transit_buffer = True
                    transit_remaining_sec = max(0, 60 - stay_seconds)
                    parking_message = f"Vehicle entered {stay_seconds}s ago (in transit past gate). Exit locked for {transit_remaining_sec}s."
                else:
                    parking_message = f"Vehicle is currently parked in slot {parking_slot_name} (Stay: {stay_seconds}s)."
            else:
                parking_message = f"Vehicle is currently parked in slot {parking_slot_name}."
        else:
            # 60-Second Post-Exit Re-Entry Protection Check
            in_exit_cooldown, exit_cooldown_remaining_sec = check_post_exit_cooldown(
                db, effective_plate, vehicle.id if vehicle else None, 60
            )
            if in_exit_cooldown:
                parking_message = f"Vehicle recently exited — transit cooldown active ({exit_cooldown_remaining_sec}s remaining). Re-entry locked."

        # Temporal Consensus Evaluation
        consensus_info = best_det.get("consensus") or {}
        consensus_state = consensus_info.get("status", "confirmed")
        
        # Decide if this reading is CONFIRMED or still in VOTING pool
        # High confidence (>=0.90), explicit manual/strict checks, or multi-frame consensus confirms the result
        is_confirmed = (
            consensus_state == "confirmed" or 
            conf >= 0.90 or 
            verification_mode in ("manual", "strict", "upload")
        )

        # Gate Collider Rule: Red Line Trigger on Non-Parked Vehicle = Street Traffic Ignored!
        if gate_line == "RED" and not is_already_parked:
            return {
                "message": f"Public road traffic filtered: Vehicle '{effective_plate}' is passing on the street.",
                "filename": filename,
                "path": str(file_path),
                "detected": True,
                "recognized_plate": effective_plate,
                "raw_plate": raw_plate,
                "confidence": conf,
                "valid": True,
                "bbox": bbox,
                "plate_category": cat,
                "status": "Ignored",
                "action_type": "street_traffic_ignored",
                "is_ignored": True,
                "is_departure": False,
                "is_parked": False,
                "is_registered": is_registered,
                "gate_line": "RED",
                "parking_message": f"🛡️ Street traffic filtered: '{effective_plate}' is passing outside on public road."
            }

        # 1. Cooldown & Deduplication Check (Only updates cooldown cache if confirmed!)
        is_duplicate, remaining_sec = is_plate_in_cooldown(effective_plate, update_cache=is_confirmed)


        log_entry = None
        alert_entry = None

        if is_confirmed and not is_duplicate:
            # Log new detection event to database (Status: Allowed or Pending Verification)
            log_entry = DetectionLog(
                plate_number=effective_plate,
                snapshot=filename,
                status=status
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)

            # Parking Assignment on Entrance (ONLY for arriving registered vehicles NOT in exit cooldown)
            if not is_already_parked and not in_exit_cooldown and is_registered and vehicle:
                can_auto_admit = (
                    verification_mode != "strict" and
                    (verification_mode == "auto" or (verification_mode == "smart" and conf >= 0.75))
                )

                if can_auto_admit:
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
                        db.refresh(session)
                        parking_assigned = True
                        parking_slot_name = available_slot.slot_name
                        parking_message = f"Assigned to parking slot {available_slot.slot_name}."
                    else:
                        parking_message = "All parking slots are fully occupied."

                    from routes.entrance import prepare_new_entrance_record
                    existing_rec = prepare_new_entrance_record(db, vehicle.plate_number)
                    if not existing_rec:
                        entrance_record = EntranceRecord(
                            plate_number=vehicle.plate_number,
                            vehicle_id=vehicle.id,
                            snapshot=filename,
                            parking_slot=parking_slot_name,
                            status="Approved",
                            entrance_time=datetime.now()
                        )
                        db.add(entrance_record)
                        db.commit()
                else:
                    parking_message = "Strict Verification: Officer confirmation required before entry."

        action_type = "transit_buffer" if in_transit_buffer else (
            "exit_cooldown" if in_exit_cooldown else (
                "exit" if is_already_parked else ("entrance" if is_registered else "unregistered_hold")
            )
        )

        # 4. Broadcast Real-time event via WebSocket
        try:
            from websocket_manager import ws_manager
            event_type = "DETECTION_ALERT" if status == "Flagged" else "DETECTION_EVENT"
            ws_payload = {
                "plate_number": effective_plate,
                "raw_plate": raw_plate,
                "normalized_plate": norm_plate,
                "category": cat,
                "confidence": conf,
                "valid": valid,
                "status": status,
                "is_flagged": status == "Flagged",
                "alert_reason": active_alert.reason if active_alert else None,
                "consensus_state": consensus_state,
                "is_confirmed": is_confirmed,
                "is_registered": is_registered,
                "is_authorized": is_registered and status != "Flagged",
                "is_parked": is_already_parked,
                "in_transit_buffer": in_transit_buffer,
                "transit_remaining_sec": transit_remaining_sec,
                "in_exit_cooldown": in_exit_cooldown,
                "exit_cooldown_remaining_sec": exit_cooldown_remaining_sec,
                "stay_seconds": stay_seconds,
                "action_type": action_type,
                "parking_slot": parking_slot_name,
                "parking_message": parking_message,
                "vehicle_bbox": vehicle_bbox,
                "vehicle_type": vehicle_type,
                "track_id": track_id,
                "snapshot": filename,
                "crop_snapshot": crop_filename,
                "timestamp": datetime.now().isoformat()
            }
            ws_manager.broadcast_sync({
                "event": event_type,
                "data": ws_payload
            })
            if status == "Flagged":
                ws_manager.broadcast_sync({
                    "event": "DETECTION_EVENT",
                    "data": ws_payload
                })
        except Exception:
            pass

        return {
            "message": "Image processed successfully with ANPR",
            "filename": filename,
            "crop_filename": crop_filename,
            "path": str(file_path),
            "uploaded_by": current_user.username,
            "detected": True,
            "recognized_plate": norm_plate,
            "raw_plate": raw_plate,
            "plate_category": cat,
            "confidence": conf,
            "valid": valid,
            "bbox": bbox,
            "vehicle_bbox": vehicle_bbox,
            "vehicle_type": vehicle_type,
            "track_id": track_id,
            "track_history": track_history,
            "status": status,


            "consensus_state": consensus_state,
            "is_confirmed": is_confirmed,
            "voting_frames": consensus_info.get("total_frames", 1),
            "agreeing_frames": consensus_info.get("agreeing_frames", 1),
            "found": is_registered,
            "is_registered": is_registered,
            "is_authorized": is_registered,
            "requires_verification": not is_registered,
            "is_parked": is_already_parked,
            "in_transit_buffer": in_transit_buffer,
            "transit_remaining_sec": transit_remaining_sec,
            "in_exit_cooldown": in_exit_cooldown,
            "exit_cooldown_remaining_sec": exit_cooldown_remaining_sec,
            "stay_seconds": stay_seconds,
            "action_type": action_type,
            "is_duplicate": is_duplicate,
            "cooldown_remaining_sec": remaining_sec,
            "vehicle": {
                "id": vehicle.id,
                "plate_number": vehicle.plate_number,
                "owner_name": vehicle.owner_name,
                "owner_id": vehicle.owner_id,
                "vehicle_model": vehicle.vehicle_model,
                "category": getattr(vehicle, "category", "Car") or "Car",
                "is_guest": getattr(vehicle, "is_guest", False),
                "vehicle_image": vehicle.vehicle_image
            } if vehicle else None,
            "log_id": log_entry.id if log_entry else None,
            "alert_id": alert_entry.id if alert_entry else None,
            "parking_assigned": parking_assigned,
            "parking_slot": parking_slot_name,
            "parking_message": parking_message,
            "processing_time_ms": round(proc_time, 2)
        }

    except Exception as e:
        import traceback
        print(f"ANPR processing error during upload: {e}")
        traceback.print_exc()
        return base_response


@router.post("/manual-check")
def manual_check(
    request: PlateCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    norm_info = normalize_plate(request.plate_number)
    plate_number = norm_info["normalized_plate"] if norm_info.get("normalized_plate") else request.plate_number.strip().upper()

    # 1. Check if vehicle exists in DB (Smart Sri Lankan province & OCR match)
    vehicle, is_registered, resolved_plate = match_registered_vehicle(db, plate_number)
    if resolved_plate:
        plate_number = resolved_plate

    status = "Allowed" if is_registered else "Flagged"

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
            reason="Unregistered / Flagged vehicle manually checked. Barrier kept CLOSED.",
            snapshot=None
        )
        db.add(alert_entry)
        db.commit()
        db.refresh(alert_entry)

    # 4. Handle Parking Slot Auto-Assignment / Departure Check (Registered Only)
    parking_assigned = False
    parking_slot_name = None
    parking_message = "Barrier LOCKED. Guest Pass authorization required." if not is_registered else "Checking parking bay..."
    is_already_parked = False
    in_transit_buffer = False
    transit_remaining_sec = 0
    stay_seconds = 0
    in_exit_cooldown = False
    exit_cooldown_remaining_sec = 0

    from routes.entrance import find_open_entrance_record_by_plate, check_post_exit_cooldown
    open_entrance = find_open_entrance_record_by_plate(db, plate_number)

    active_session = None
    if vehicle:
        active_session = db.query(ParkingSession).filter(
            ParkingSession.vehicle_id == vehicle.id,
            ParkingSession.status == "Active"
        ).first()

    if active_session or open_entrance:
        is_already_parked = True
        entry_ts = None
        if active_session:
            slot = db.query(ParkingSlot).filter(ParkingSlot.id == active_session.slot_id).first()
            parking_slot_name = slot.slot_name if slot else 'unknown'
            entry_ts = getattr(active_session, "entry_time", None)

        if not parking_slot_name and open_entrance:
            parking_slot_name = open_entrance.parking_slot or "Assigned Bay"
        if not entry_ts and open_entrance:
            entry_ts = open_entrance.entrance_time

        if not entry_ts and vehicle:
            rec = db.query(EntranceRecord).filter(
                EntranceRecord.vehicle_id == vehicle.id,
                EntranceRecord.exit_time.is_(None)
            ).order_by(EntranceRecord.entrance_time.desc()).first()
            if rec:
                entry_ts = rec.entrance_time

        if entry_ts:
            now_dt = datetime.now()
            if entry_ts.tzinfo is not None and now_dt.tzinfo is None:
                from datetime import timezone
                now_dt = datetime.now(timezone.utc)
            elif entry_ts.tzinfo is None and now_dt.tzinfo is not None:
                entry_ts = entry_ts.replace(tzinfo=now_dt.tzinfo)

            stay_seconds = max(0, int((now_dt - entry_ts).total_seconds()))
            if stay_seconds < 60:
                in_transit_buffer = True
                transit_remaining_sec = max(0, 60 - stay_seconds)
                parking_message = f"Vehicle entered {stay_seconds}s ago (in transit past gate). Exit locked for {transit_remaining_sec}s."
            else:
                parking_message = f"Vehicle is currently parked in slot {parking_slot_name} (Stay: {stay_seconds}s)."
        else:
            parking_message = f"Vehicle is currently parked in slot {parking_slot_name}."
    else:
        # 60-Second Post-Exit Re-Entry Protection Check
        in_exit_cooldown, exit_cooldown_remaining_sec = check_post_exit_cooldown(
            db, plate_number, vehicle.id if vehicle else None, 60
        )
        if in_exit_cooldown:
            parking_message = f"Vehicle recently exited — transit cooldown active ({exit_cooldown_remaining_sec}s remaining). Re-entry locked."
        elif is_registered and vehicle:
            verif_mode = getattr(request, "verification_mode", "smart") or "smart"
            can_auto_admit = (verif_mode != "strict")

            if can_auto_admit:
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
                    db.refresh(session)
                    parking_assigned = True
                    parking_slot_name = available_slot.slot_name
                    parking_message = f"Assigned to parking slot {available_slot.slot_name}."
                else:
                    parking_message = "All parking slots are fully occupied."

                # Log Entrance Record only if NOT already parked
                from routes.entrance import prepare_new_entrance_record
                existing_rec = prepare_new_entrance_record(db, vehicle.plate_number)
                if not existing_rec:
                    entrance_record = EntranceRecord(
                        plate_number=vehicle.plate_number,
                        vehicle_id=vehicle.id,
                        snapshot=vehicle.vehicle_image,
                        parking_slot=parking_slot_name,
                        status="Approved",
                        entrance_time=datetime.now()
                    )
                    db.add(entrance_record)
                    db.commit()
            else:
                parking_message = "Strict Mode: Guard confirmation required before admission."

    action_type = "transit_buffer" if in_transit_buffer else (
        "exit_cooldown" if in_exit_cooldown else (
            "exit" if is_already_parked else ("entrance" if is_registered else "unregistered_hold")
        )
    )

    response_payload = {
        "status": status,
        "found": is_registered,
        "is_registered": is_registered,
        "is_authorized": is_registered,
        "is_parked": is_already_parked,
        "in_transit_buffer": in_transit_buffer,
        "transit_remaining_sec": transit_remaining_sec,
        "in_exit_cooldown": in_exit_cooldown,
        "exit_cooldown_remaining_sec": exit_cooldown_remaining_sec,
        "stay_seconds": stay_seconds,
        "action_type": action_type,
        "vehicle": {
            "id": vehicle.id,
            "plate_number": vehicle.plate_number,
            "owner_name": vehicle.owner_name,
            "owner_id": vehicle.owner_id,
            "vehicle_model": vehicle.vehicle_model,
            "category": getattr(vehicle, "category", "Car") or "Car",
            "is_guest": getattr(vehicle, "is_guest", False),
            "vehicle_image": vehicle.vehicle_image
        } if vehicle else None,
        "log_id": log_entry.id,
        "alert_id": alert_entry.id if alert_entry else None,
        "parking_assigned": parking_assigned,
        "parking_slot": parking_slot_name,
    }

    # Broadcast real-time detection event via WebSocket
    try:
        from websocket_manager import ws_manager
        event_type = "DETECTION_ALERT" if status == "Flagged" else "DETECTION_EVENT"
        ws_manager.broadcast_sync({
            "event": event_type,
            "data": {
                "plate_number": plate_number,
                "status": status,
                "is_flagged": status == "Flagged",
                "parking_slot": parking_slot_name,
                "parking_message": parking_message,
                "timestamp": datetime.now().isoformat()
            }
        })
        if status == "Flagged":
            ws_manager.broadcast_sync({
                "event": "DETECTION_EVENT",
                "data": {
                    "plate_number": plate_number,
                    "status": status,
                    "is_flagged": True,
                    "parking_slot": parking_slot_name,
                    "parking_message": parking_message,
                    "timestamp": datetime.now().isoformat()
                }
            })
    except Exception:
        pass

    return response_payload
