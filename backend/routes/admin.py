from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from database import get_db
from models import User, Vehicle, DetectionLog, Alert, ParkingSlot, ParkingSession, EntranceRecord
from schemas import UserCreate, UserResponse, UserUpdateRole
from dependencies import get_current_admin_user
from auth import hash_password

router = APIRouter(
    prefix="/admin",
    tags=["Admin Management"],
    dependencies=[Depends(get_current_admin_user)]
)


@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """List all registered system users."""
    users = db.query(User).order_by(User.id.asc()).all()
    return users


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new operator or admin user."""
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    role = user_data.role if user_data.role in ["admin", "operator", "viewer"] else "operator"
    new_user = User(
        username=user_data.username,
        password=hash_password(user_data.password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, update_data: UserUpdateRole, db: Session = Depends(get_db)):
    """Update role or reset password for a user."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if update_data.role:
        if update_data.role in ["admin", "operator", "viewer"]:
            target_user.role = update_data.role

    if update_data.password:
        target_user.password = hash_password(update_data.password)

    db.commit()
    db.refresh(target_user)
    return target_user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Delete a user account."""
    if current_admin.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin account")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(target_user)
    db.commit()
    return {"message": f"User '{target_user.username}' deleted successfully"}


@router.get("/analytics")
def get_admin_analytics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get aggregated system analytics for the admin dashboard."""
    total_users = db.query(User).count()
    total_vehicles = db.query(Vehicle).count()
    total_registered_vehicles = db.query(Vehicle).filter(Vehicle.is_guest == False).count()
    total_guest_vehicles = db.query(Vehicle).filter(Vehicle.is_guest == True).count()
    total_detections = db.query(DetectionLog).count()
    total_alerts = db.query(Alert).count()
    total_parking_slots = db.query(ParkingSlot).count()
    occupied_parking_slots = db.query(ParkingSlot).filter(ParkingSlot.status == "Occupied").count()
    total_entrance_records = db.query(EntranceRecord).count()

    # Category Breakdown
    category_counts = db.query(Vehicle.category, func.count(Vehicle.id)).group_by(Vehicle.category).all()
    categories_dict = {cat: count for cat, count in category_counts}

    # Detection Status Breakdown
    detection_status_counts = db.query(DetectionLog.status, func.count(DetectionLog.id)).group_by(DetectionLog.status).all()
    status_dict = {stat: count for stat, count in detection_status_counts}

    return {
        "summary": {
            "total_users": total_users,
            "total_vehicles": total_vehicles,
            "registered_vehicles": total_registered_vehicles,
            "guest_vehicles": total_guest_vehicles,
            "total_detections": total_detections,
            "total_alerts": total_alerts,
            "total_parking_slots": total_parking_slots,
            "occupied_parking_slots": occupied_parking_slots,
            "available_parking_slots": max(0, total_parking_slots - occupied_parking_slots),
            "total_entrance_records": total_entrance_records
        },
        "vehicle_categories": categories_dict,
        "detection_statuses": status_dict
    }


@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    """Fetch recent system audit events."""
    recent_detections = db.query(DetectionLog).order_by(DetectionLog.detection_time.desc()).limit(15).all()
    recent_alerts = db.query(Alert).order_by(Alert.alert_time.desc()).limit(15).all()
    recent_entrances = db.query(EntranceRecord).order_by(EntranceRecord.entrance_time.desc()).limit(15).all()

    logs = []
    for d in recent_detections:
        logs.append({
            "type": "Detection",
            "time": d.detection_time.strftime("%Y-%m-%d %H:%M:%S") if d.detection_time else "",
            "details": f"License plate {d.plate_number} scanned (Status: {d.status})",
            "level": "INFO" if d.status in ["Allowed", "Approved"] else "WARNING"
        })

    for a in recent_alerts:
        logs.append({
            "type": "Security Alert",
            "time": a.alert_time.strftime("%Y-%m-%d %H:%M:%S") if a.alert_time else "",
            "details": f"Security alert for plate {a.plate_number}: {a.reason or 'Unregistered vehicle'}",
            "level": "CRITICAL"
        })

    for e in recent_entrances:
        logs.append({
            "type": "Entrance Gate",
            "time": e.entrance_time.strftime("%Y-%m-%d %H:%M:%S") if e.entrance_time else "",
            "details": f"Gate record for plate {e.plate_number} (Slot: {e.parking_slot or 'N/A'}, Status: {e.status})",
            "level": "INFO"
        })

    # Sort combined logs by time descending
    logs.sort(key=lambda x: x["time"], reverse=True)
    return logs[:30]


# Camera Management Data Store
SYSTEM_CAMERAS = [
    {"id": 1, "name": "Cam-01 North Gate", "rtsp_url": "rtsp://192.168.1.100:554/stream1", "fps": 30, "status": "Online", "location": "Main Entrance"},
    {"id": 2, "name": "Cam-02 South Gate", "rtsp_url": "rtsp://192.168.1.101:554/stream1", "fps": 30, "status": "Online", "location": "Secondary Gate"}
]


@router.get("/cameras")
def get_cameras():
    """Get system camera configurations."""
    return SYSTEM_CAMERAS


@router.post("/cameras")
def add_camera(cam_data: Dict[str, Any]):
    """Add a new camera feed source."""
    new_id = len(SYSTEM_CAMERAS) + 1
    new_cam = {
        "id": new_id,
        "name": cam_data.get("name", f"Cam-{new_id:02d}"),
        "rtsp_url": cam_data.get("rtsp_url", "Webcam Default"),
        "fps": int(cam_data.get("fps", 30)),
        "status": cam_data.get("status", "Online"),
        "location": cam_data.get("location", "Gate Stream")
    }
    SYSTEM_CAMERAS.append(new_cam)
    return {"message": "Camera added successfully", "camera": new_cam}


@router.put("/cameras/{cam_id}")
def update_camera(cam_id: int, cam_data: Dict[str, Any]):
    """Update camera configuration or toggle status."""
    for c in SYSTEM_CAMERAS:
        if c["id"] == cam_id:
            if "name" in cam_data: c["name"] = cam_data["name"]
            if "rtsp_url" in cam_data: c["rtsp_url"] = cam_data["rtsp_url"]
            if "fps" in cam_data: c["fps"] = int(cam_data["fps"])
            if "status" in cam_data: c["status"] = cam_data["status"]
            if "location" in cam_data: c["location"] = cam_data["location"]
            return {"message": "Camera updated", "camera": c}

    raise HTTPException(status_code=404, detail="Camera not found")


@router.post("/search")
def admin_multi_search(search_payload: Dict[str, Any], db: Session = Depends(get_db)):
    """Advanced search engine for license plates, owners, categories, and detection status."""
    q_str = (search_payload.get("query") or "").strip().lower()
    category = (search_payload.get("category") or "").strip()
    status_filter = (search_payload.get("status") or "").strip()

    # Search Vehicles
    v_query = db.query(Vehicle)
    if q_str:
        v_query = v_query.filter(
            (func.lower(Vehicle.plate_number).contains(q_str)) |
            (func.lower(Vehicle.owner_name).contains(q_str)) |
            (func.lower(Vehicle.owner_id).contains(q_str))
        )
    if category:
        v_query = v_query.filter(Vehicle.category == category)

    matching_vehicles = v_query.limit(30).all()

    # Search Detections
    d_query = db.query(DetectionLog)
    if q_str:
        d_query = d_query.filter(func.lower(DetectionLog.plate_number).contains(q_str))
    if status_filter:
        d_query = d_query.filter(DetectionLog.status == status_filter)

    matching_detections = d_query.order_by(DetectionLog.detection_time.desc()).limit(30).all()

    return {
        "vehicles": [
            {
                "id": v.id,
                "plate_number": v.plate_number,
                "owner_name": v.owner_name,
                "owner_id": v.owner_id,
                "vehicle_model": v.vehicle_model,
                "category": v.category,
                "is_guest": v.is_guest,
                "registered_date": v.registered_date.strftime("%Y-%m-%d %H:%M:%S") if v.registered_date else ""
            } for v in matching_vehicles
        ],
        "detections": [
            {
                "id": d.id,
                "plate_number": d.plate_number,
                "status": d.status,
                "detection_time": d.detection_time.strftime("%Y-%m-%d %H:%M:%S") if d.detection_time else ""
            } for d in matching_detections
        ]
    }


# =========================================================
# AI ENGINE HARDWARE ACCELERATION CONTROLS (CPU <-> GPU)
# =========================================================

@router.get("/ai-engine/status")
def get_ai_engine_status():
    """Get real-time hardware execution status for YOLO and OCR models."""
    try:
        from ai.anpr_pipeline import get_pipeline
        pipeline = get_pipeline()
        return pipeline.get_hardware_status()
    except Exception as e:
        return {
            "error": str(e),
            "yolo": {"device": "unknown", "engine": "unknown"},
            "ocr": {"device": "unknown", "engine": "unknown"},
            "system": {"cuda_available": False}
        }


@router.post("/ai-engine/config")
def update_ai_engine_config(config_payload: Dict[str, Any]):
    """
    Hot-switch execution hardware (CPU <-> GPU) for YOLO and/or OCR models.
    Payload:
    {
        "yolo_device": "cuda:0" | "cpu",
        "yolo_engine": "PYTORCH" | "OPENVINO",
        "ocr_device": "gpu" | "cpu"
    }
    """
    yolo_dev = config_payload.get("yolo_device")
    ocr_dev = config_payload.get("ocr_device")
    yolo_eng = config_payload.get("yolo_engine")

    try:
        from ai.anpr_pipeline import get_pipeline
        pipeline = get_pipeline()
        result = pipeline.configure_devices(
            yolo_device=yolo_dev,
            ocr_device=ocr_dev,
            yolo_engine=yolo_eng
        )
        return {
            "message": "AI Engine hardware configuration updated successfully",
            "result": result,
            "status": pipeline.get_hardware_status()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to configure AI engine devices: {e}")


