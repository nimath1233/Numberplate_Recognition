from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import random

from models import DetectionLog, Alert, Vehicle, User
from database import SessionLocal
from dependencies import get_current_user

router = APIRouter(tags=["Alerts & Stats"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Seeding function removed (Clean environment)


@router.get("/detection/logs")
def get_logs(db: Session = Depends(get_db)):
    logs = db.query(DetectionLog).order_by(DetectionLog.detection_time.desc()).all()
    # We also want to attach owner names if they exist in the vehicles table
    result = []
    for log in logs:
        vehicle = db.query(Vehicle).filter(func.upper(Vehicle.plate_number) == func.upper(log.plate_number)).first()
        result.append({
            "id": log.id,
            "plate_number": log.plate_number,
            "snapshot": log.snapshot,
            "detection_time": log.detection_time.strftime("%H:%M:%S") if log.detection_time else "",
            "status": log.status,
            "owner_name": vehicle.owner_name if vehicle else "Unknown",
            "vehicle_model": vehicle.vehicle_model if vehicle else "",
            "confidence": 98.4 if log.status == "Allowed" else 85.2 # Simulated OCR confidence
        })
    return result


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.alert_time.desc()).all()
    return alerts


@router.get("/detection/stats")
def get_stats(db: Session = Depends(get_db)):
    
    total = db.query(DetectionLog).count()
    allowed = db.query(DetectionLog).filter(DetectionLog.status == "Allowed").count()
    flagged = db.query(Alert).count()
    
    pass_rate = round((allowed / total * 100), 1) if total > 0 else 100
    flagged_rate = round((flagged / total * 100), 1) if total > 0 else 0
    
    # Calculate mock hourly volume
    hourly_labels = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"]
    hourly_counts = [0] * len(hourly_labels)
    
    logs = db.query(DetectionLog).all()
    for log in logs:
        if log.detection_time:
            hour = log.detection_time.hour
            idx = hour - 8
            if 0 <= idx < len(hourly_counts):
                hourly_counts[idx] += 1
                
    cameras = ["Cam-01 North Gate", "Cam-02 South Gate", "Cam-03 East Parking", "Cam-04 West Entrance"]
    camera_counts = [0] * len(cameras)
    
    for i in range(total):
        idx = i % len(cameras)
        camera_counts[idx] += 1
        
    return {
        "total_detections": total,
        "allowed": allowed,
        "flagged": flagged,
        "pass_rate": pass_rate,
        "flagged_rate": flagged_rate,
        "avg_confidence": 94.8,
        "hourly_labels": hourly_labels,
        "hourly_counts": hourly_counts,
        "camera_labels": ["Cam-01", "Cam-02", "Cam-03", "Cam-04"],
        "camera_counts": camera_counts
    }


@router.delete("/detection/logs/{log_id}")
def delete_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = db.query(DetectionLog).filter(DetectionLog.id == log_id).first()
    if not log:
        return {"message": "Log not found"}

    if log.status == "Flagged":
        alert = db.query(Alert).filter(Alert.plate_number == log.plate_number).first()
        if alert:
            db.delete(alert)

    db.delete(log)
    db.commit()
    return {"message": "Log deleted successfully", "id": log_id}


@router.delete("/detection/logs")
def clear_all_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(DetectionLog).delete()
    db.query(Alert).delete()
    db.commit()
    return {"message": "All detection logs and alerts cleared successfully"}


@router.delete("/alerts/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return {"message": "Alert not found"}

    if alert.plate_number:
        db.query(DetectionLog).filter(DetectionLog.plate_number == alert.plate_number, DetectionLog.status == "Flagged").delete(synchronize_session=False)

    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted successfully", "id": alert_id}


@router.delete("/alerts")
def clear_all_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Alert).delete()
    db.query(DetectionLog).filter(DetectionLog.status == "Flagged").delete(synchronize_session=False)
    db.commit()
    return {"message": "All security alerts cleared successfully"}


