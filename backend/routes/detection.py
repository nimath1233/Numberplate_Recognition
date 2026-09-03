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

# 3-Second per-plate log deduplication cache: { clean_plate_string: last_processed_unix_timestamp }
COOLDOWN_SECONDS = int(os.environ.get("ANPR_COOLDOWN_SECONDS", "3"))
recent_scans_cache: dict[str, float] = {}

def is_plate_in_cooldown(plate: str, update_cache: bool = True) -> tuple[bool, int]:
    """
    Check if the same plate number was scanned and logged within the short deduplication period (3s).
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
    Handles Sri Lankan province prefixes (WP, CP, SP, etc.) and format variations.
    Returns: (vehicle: Optional[Vehicle], is_registered: bool, resolved_plate: str)
    """
    if not raw_or_norm_plate:
        return None, False, ""

    from routes.entrance import are_plates_matching
    all_vehicles = db.query(Vehicle).all()
    for v in all_vehicles:
        if v.plate_number and are_plates_matching(v.plate_number, raw_or_norm_plate):
            is_reg = not getattr(v, "is_guest", False)
            return v, is_reg, v.plate_number

    return None, False, raw_or_norm_plate


@router.post("/upload")
def upload_image(
    file: UploadFile = File(...),
    process_ai: bool = Query(True, description="Whether to run automatic ANPR detection on uploaded image"),
    verification_mode: str = Query("smart", description="Verification mode: smart, strict, or auto"),
    gate_line: str | None = Query(None, description="Trigger line: 'GREEN' (Driveway) or 'RED' (Outer Gate)"),
    force_ocr: bool = Query(False, description="Force OCR execution regardless of line touch"),
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

        # Load gate collider configuration for Virtual Tripwire spatial gating
        gate_config = None
        try:
            from routes.entrance import load_saved_gate_colliders
            gate_config = load_saved_gate_colliders()
        except Exception:
            pass

        # Force OCR if manually uploaded, manual check mode, or force_ocr=True
        should_force_ocr = force_ocr or (verification_mode in ("manual", "strict", "upload"))

        pipeline = get_pipeline()
        detections, proc_time = pipeline.process(image, gate_config=gate_config, force_ocr=should_force_ocr)

        if not detections:
            return base_response

        # Check if detections were made with OCR asleep (approaching in driveway)
        sleeping_dets = [d for d in detections if d.get("is_ocr_asleep")]
        valid_dets = [
            d for d in detections 
            if d.get("valid") 
            and d.get("bbox") 
            and float(d.get("ocr_confidence", 0.0)) >= 0.70
            and d.get("plate_category", "Unknown") != "Unknown"
            and len(re.sub(r"[\s\-_]", "", d.get("normalized_plate") or d.get("validated_text") or "")) >= 4
        ]

        if not valid_dets and sleeping_dets:
            # Vehicle tracked in standby before touching the line! OCR was asleep to save CPU!
            s_det = sleeping_dets[0]
            s_bbox = [int(b) for b in s_det.get("bbox", ())] if s_det.get("bbox") else None
            s_vbox = s_det.get("vehicle_bbox")
            return {
                "message": "Vehicle tracked in driveway. OCR dormant 💤 until Green or Red line contact.",
                "filename": filename,
                "path": str(file_path),
                "detected": True,
                "ocr_asleep": True,
                "recognized_plate": None,
                "raw_plate": None,
                "confidence": 0,
                "valid": False,
                "bbox": s_bbox,
                "vehicle_bbox": s_vbox,
                "vehicle_type": s_det.get("vehicle_category", "Car"),
                "track_id": int(s_det.get("track_id", 1)),
                "plate_category": "Standby",
                "status": "Approaching",
                "action_type": "approaching_green_line",
                "is_ignored": False,
                "is_departure": False,
                "is_parked": False,
                "gate_line": "INSIDE_DRIVEWAY",
                "parking_message": "Vehicle tracked. OCR asleep 💤 awaiting Green Line touch."
            }

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
        stay_seconds = 0

        # Check if vehicle is already inside (active ParkingSession OR open EntranceRecord)
        from routes.entrance import find_open_entrance_record_by_plate
        open_entrance = find_open_entrance_record_by_plate(db, effective_plate)

        active_session = None
        if vehicle:
            active_session = db.query(ParkingSession).filter(
                ParkingSession.vehicle_id == vehicle.id,
                ParkingSession.status == "Active"
            ).first()

        if not active_session:
            from routes.entrance import are_plates_matching
            all_active = db.query(ParkingSession).filter(ParkingSession.status == "Active").all()
            for s in all_active:
                if s.vehicle and s.vehicle.plate_number and are_plates_matching(s.vehicle.plate_number, effective_plate):
                    active_session = s
                    if not vehicle:
                        vehicle = s.vehicle
                    break

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
                parking_message = f"Vehicle is currently parked in slot {parking_slot_name} (Stay: {stay_seconds}s)."
            else:
                parking_message = f"Vehicle is currently parked in slot {parking_slot_name}."

        # Temporal Consensus Evaluation
        consensus_info = best_det.get("consensus") or {}
        consensus_state = consensus_info.get("status", "confirmed")
        
        # Decide if this reading is CONFIRMED or still in VOTING pool
        is_confirmed = (
            consensus_state == "confirmed" or 
            conf >= 0.90 or 
            verification_mode in ("manual", "strict", "upload")
        )

        # Auto-resolve gate line from vehicle_bbox and plate bbox coordinates if not explicitly passed
        if not gate_line and ((bbox and len(bbox) == 4) or (vehicle_bbox and len(vehicle_bbox) == 4)):
            try:
                from routes.entrance import load_saved_gate_colliders
                gate_config = load_saved_gate_colliders()
                image_h = image.shape[0] if image is not None else 380
                image_w = image.shape[1] if image is not None else 640
                scale_x = 640.0 / max(1, image_w)
                scale_y = 380.0 / max(1, image_h)

                # Target box: prioritize vehicle_bbox if available, fallback to plate bbox
                target_box = vehicle_bbox if (vehicle_bbox and len(vehicle_bbox) == 4) else bbox
                tx1, ty1, tx2, ty2 = target_box
                norm_x1 = tx1 * scale_x
                norm_x2 = tx2 * scale_x
                norm_y1 = ty1 * scale_y
                norm_y2 = ty2 * scale_y
                norm_cx = (norm_x1 + norm_x2) / 2.0
                norm_cy = (norm_y1 + norm_y2) / 2.0

                pin_a = gate_config.get("pin_a", {"x": 80.0, "y": 140.0})
                pin_b = gate_config.get("pin_b", {"x": 560.0, "y": 140.0})
                pin_c = gate_config.get("pin_c", {"x": 80.0, "y": 340.0})
                pin_d = gate_config.get("pin_d", {"x": 560.0, "y": 340.0})

                pin_a_x, pin_a_y = float(pin_a.get("x", 80.0)), float(pin_a.get("y", 140.0))
                pin_b_x, pin_b_y = float(pin_b.get("x", 560.0)), float(pin_b.get("y", 140.0))
                if pin_b_x != pin_a_x:
                    red_y = pin_a_y + ((pin_b_y - pin_a_y) / (pin_b_x - pin_a_x)) * (norm_cx - pin_a_x)
                else:
                    red_y = (pin_a_y + pin_b_y) / 2.0

                pin_c_x, pin_c_y = float(pin_c.get("x", 80.0)), float(pin_c.get("y", 340.0))
                pin_d_x, pin_d_y = float(pin_d.get("x", 560.0)), float(pin_d.get("y", 340.0))
                if pin_d_x != pin_c_x:
                    green_y = pin_c_y + ((pin_d_y - pin_c_y) / (pin_d_x - pin_c_x)) * (norm_cx - pin_c_x)
                else:
                    green_y = (pin_c_y + pin_d_y) / 2.0

                # 1. Red Line check (Outer Gate Exit)
                if norm_y1 <= red_y + 25.0:
                    gate_line = "RED"
                else:
                    # 2. Green Line Touch Check:
                    # Vehicle touches the green line when its bounding box crosses/intersects the green line segment
                    min_green_x = min(pin_c_x, pin_d_x) - 20.0
                    max_green_x = max(pin_c_x, pin_d_x) + 20.0
                    has_x_overlap = (norm_x2 >= min_green_x) and (norm_x1 <= max_green_x)

                    tolerance = 20.0
                    touches_green = has_x_overlap and ((norm_y1 - tolerance) <= green_y <= (norm_y2 + tolerance))

                    # Also check plate bbox touch if vehicle_bbox was used and distinct plate bbox exists
                    if not touches_green and bbox and len(bbox) == 4:
                        px1, py1, px2, py2 = bbox
                        p_ny1, p_ny2 = py1 * scale_y, py2 * scale_y
                        p_nx1, p_nx2 = px1 * scale_x, px2 * scale_x
                        p_has_x = (p_nx2 >= min_green_x) and (p_nx1 <= max_green_x)
                        if p_has_x and ((p_ny1 - 25.0) <= green_y <= (p_ny2 + 25.0)):
                            touches_green = True

                    if touches_green:
                        gate_line = "GREEN"
                    else:
                        gate_line = "INSIDE_DRIVEWAY"
            except Exception:
                gate_line = "INSIDE_DRIVEWAY"

        # =========================================================================
        # 1. GATE COLLIDER RULE: RED LINE TRIGGER (Outer Gate Boundary - EXIT ONLY)
        # =========================================================================
        if gate_line == "RED":
            if not is_already_parked:
                # Street Traffic Filter: Vehicle outside on public road (Red line NEVER admits vehicles)
                return {
                    "message": f"Public road traffic filtered: Vehicle '{effective_plate}' is passing outside on the street. Red line only exits vehicles.",
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
                    "parking_message": f"🛡️ Street traffic filtered: '{effective_plate}' is passing outside on public road. Red line only exits vehicles."
                }
            else:
                # Departing Vehicle: Exit Authorized & Free Parking Slot
                now_exit = datetime.now()
                if open_entrance:
                    open_entrance.exit_time = now_exit
                    open_entrance.status = "Approved"

                from routes.entrance import are_plates_matching
                all_active_sess = db.query(ParkingSession).filter(ParkingSession.status == "Active").all()
                for sess in all_active_sess:
                    matched = False
                    if vehicle and sess.vehicle_id == vehicle.id:
                        matched = True
                    elif sess.vehicle and sess.vehicle.plate_number and are_plates_matching(sess.vehicle.plate_number, effective_plate):
                        matched = True
                    if matched:
                        sess.exit_time = now_exit
                        sess.status = "Completed"
                        slot = db.query(ParkingSlot).filter(ParkingSlot.id == sess.slot_id).first()
                        if slot:
                            slot.status = "Available"

                if open_entrance and open_entrance.parking_slot:
                    slot = db.query(ParkingSlot).filter(ParkingSlot.slot_name == open_entrance.parking_slot).first()
                    if slot:
                        slot.status = "Available"

                db.commit()

                # Broadcast exit event
                try:
                    from websocket_manager import ws_manager
                    ws_manager.broadcast_sync({
                        "event": "DETECTION_EVENT",
                        "data": {
                            "plate_number": effective_plate,
                            "status": "Allowed",
                            "action_type": "exit",
                            "is_departure": True,
                            "is_parked": False,
                            "parking_slot": parking_slot_name,
                            "parking_message": f"🔴 Departing vehicle '{effective_plate}' verified. Exit Authorized & slot freed.",
                            "timestamp": datetime.now().isoformat()
                        }
                    })
                except Exception:
                    pass

                return {
                    "message": f"Departing vehicle '{effective_plate}' verified. Exit Authorized & Bay '{parking_slot_name or 'N/A'}' freed.",
                    "filename": filename,
                    "path": str(file_path),
                    "detected": True,
                    "recognized_plate": effective_plate,
                    "raw_plate": raw_plate,
                    "confidence": conf,
                    "valid": True,
                    "bbox": bbox,
                    "plate_category": cat,
                    "status": "Allowed",
                    "action_type": "exit",
                    "is_ignored": False,
                    "is_departure": True,
                    "is_parked": False,
                    "is_registered": is_registered,
                    "gate_line": "RED",
                    "parking_slot": parking_slot_name,
                    "parking_message": f"🔴 Exit Authorized. Slot {parking_slot_name or 'N/A'} is now available."
                }

        # =========================================================================
        # 2. VEHICLES ALREADY INSIDE PREMISES (PAST GREEN LINE & IN DRIVEWAY - SCAN PAUSED)
        # =========================================================================
        if gate_line != "RED" and is_already_parked:
            # Already Inside: Pause scanning while driving inside premises until Red Line is reached
            return {
                "message": f"Vehicle '{effective_plate}' is ALREADY inside premises. Scan paused until Red Line.",
                "filename": filename,
                "path": str(file_path),
                "detected": True,
                "recognized_plate": effective_plate,
                "raw_plate": raw_plate,
                "confidence": conf,
                "valid": True,
                "bbox": bbox,
                "plate_category": cat,
                "status": "Allowed" if is_registered else "Flagged",
                "action_type": "already_inside_ignored",
                "is_ignored": True,
                "is_departure": False,
                "is_parked": True,
                "is_registered": is_registered,
                "gate_line": gate_line,
                "parking_slot": parking_slot_name,
                "parking_message": f"🟢 Vehicle '{effective_plate}' is inside premises in slot {parking_slot_name or 'P1'}."
            }

        # Deduplication Check for database logging (only log when vehicle touches line or is already parked)
        is_duplicate, remaining_sec = is_plate_in_cooldown(effective_plate, update_cache=(is_confirmed and gate_line == "GREEN"))

        log_entry = None
        alert_entry = None

        if is_confirmed and not is_duplicate and (gate_line in ("GREEN", "RED") or is_already_parked):
            # Log new detection event to database
            log_entry = DetectionLog(
                plate_number=effective_plate,
                snapshot=filename,
                status=status
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)

        # Parking Assignment on Entrance (Triggered ONLY when vehicle touches the GREEN LINE)
        if is_confirmed and not is_already_parked:
            if gate_line != "GREEN":
                action_type = "approaching_green_line"
                parking_message = "Vehicle approaching gate. Scanning & entry will trigger when vehicle touches the Green Line."
            else:
                # In 'auto' mode, auto-admit ALL vehicles (registered AND unregistered guests)!
                # In 'smart' mode, auto-admit registered vehicles with confidence >= 0.75
                # In 'strict' mode, hold for officer confirmation
                can_auto_admit = (
                    verification_mode == "auto" or (
                        is_registered and vehicle and (
                            verification_mode != "strict" and
                            (verification_mode == "smart" and conf >= 0.75)
                        )
                    )
                )

                if can_auto_admit:
                    # If unregistered vehicle in auto mode, auto-register as Guest
                    if not vehicle:
                        vehicle = db.query(Vehicle).filter(Vehicle.plate_number == effective_plate).first()
                        if not vehicle:
                            vehicle = Vehicle(
                                plate_number=effective_plate,
                                owner_name="Auto Guest",
                                category=cat if cat != "Unknown" else "Car",
                                phone_number="N/A",
                                is_guest=True
                            )
                            db.add(vehicle)
                            db.commit()
                            db.refresh(vehicle)
                        is_registered = True
                        status = "Allowed"

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
                            status="Approved" if not getattr(vehicle, 'is_guest', False) else "Guest Approved",
                            entrance_time=datetime.now()
                        )
                        db.add(entrance_record)
                        db.commit()
                    is_already_parked = True
                    action_type = "entrance"
                    status = "Allowed"
                elif not is_registered:
                    parking_message = "Guest vehicle touched Green Line. Officer authorization required."
                    action_type = "entrance_unregistered"
                else:
                    parking_message = "Strict Verification: Officer confirmation required before entry."
                    action_type = "entrance_hold"
        else:
            action_type = "already_inside_ignored" if is_already_parked else ("entrance" if is_registered else "unregistered_hold")

        # Broadcast Real-time event via WebSocket
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
    stay_seconds = 0

    from routes.entrance import find_open_entrance_record_by_plate
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
            parking_message = f"Vehicle is currently parked in slot {parking_slot_name} (Stay: {stay_seconds}s)."
        else:
            parking_message = f"Vehicle is currently parked in slot {parking_slot_name}."
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
            is_already_parked = True
        else:
            parking_message = "Strict Mode: Guard confirmation required before admission."

    action_type = (
        "already_parked" if is_already_parked else ("entrance" if is_registered else "unregistered_hold")
    )

    response_payload = {
        "status": status,
        "found": is_registered,
        "is_registered": is_registered,
        "is_authorized": is_registered,
        "is_parked": is_already_parked,
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
