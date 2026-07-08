from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import re
from ..database import get_db
from ..models import Vehicle, Scan, User
from ..auth import get_current_user
from ..ai.camera import CameraHelper
from ..ai.detector import PlateDetector
from ..ai.ocr import ocr_engine
from ..config import settings

router = APIRouter(prefix="/api/detection", tags=["Detection"])

class ScanRequestSchema(BaseModel):
    snap_base64: str  # Base64 encoded video frame from dashboard webcam

class ScanResponseSchema(BaseModel):
    status: str       # "REGISTERED" or "UNREGISTERED" or "NO_PLATE"
    plate_number: str
    is_registered: bool
    model: str = ""
    owner_id: str = ""
    snap_path: str
    message: str

@router.post("/scan", response_model=ScanResponseSchema)
def scan_license_plate(
    data: ScanRequestSchema,
    db: Session = Depends(get_db)
    # We allow scan endpoint to be public or at least accessible without login
    # if the camera terminal runs stand-alone. Let's make it accessible.
):
    # Convert base64 snap to CV2 image
    cv_img = CameraHelper.base64_to_cv2(data.snap_base64)
    if cv_img is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format"
        )
    
    # 1. Detect & Crop License Plate
    cropped_plate, is_cropped = PlateDetector.preprocess_and_crop(cv_img)
    
    # 2. Run OCR on the cropped plate (or full image if crop failed)
    detected_text = ocr_engine.extract_text(cropped_plate)
    
    if not detected_text:
        # Save a log of failed scan to uploads/unknown
        save_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), settings.UPLOAD_DIR_UNKNOWN)
        snap_rel_path = CameraHelper.save_image(cv_img, save_dir, filename_prefix="failed_scan")
        return {
            "status": "NO_PLATE",
            "plate_number": "",
            "is_registered": False,
            "snap_path": snap_rel_path,
            "message": "No license plate or text could be detected. Please adjust lighting and try again."
        }
    
    # 3. Check plate registration
    vehicle = db.query(Vehicle).filter(Vehicle.plate_number == detected_text).first()
    
    if vehicle:
        # REGISTERED vehicle: Save snapshot to uploads/detections
        save_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), settings.UPLOAD_DIR_DETECTIONS)
        snap_rel_path = CameraHelper.save_image(cv_img, save_dir, filename_prefix=f"registered_{detected_text}")
        
        db_scan = Scan(
            plate_number=detected_text,
            is_registered=True,
            snap_path=snap_rel_path,
            vehicle_id=vehicle.id
        )
        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)
        
        return {
            "status": "REGISTERED",
            "plate_number": detected_text,
            "is_registered": True,
            "model": vehicle.model,
            "owner_id": vehicle.owner_id,
            "snap_path": snap_rel_path,
            "message": f"Success: Vehicle detected! Model: {vehicle.model}, Owner ID: {vehicle.owner_id}"
        }
    else:
        # UNREGISTERED / ALERT: Save snapshot to uploads/unknown
        save_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), settings.UPLOAD_DIR_UNKNOWN)
        snap_rel_path = CameraHelper.save_image(cv_img, save_dir, filename_prefix=f"unregistered_{detected_text}")
        
        db_scan = Scan(
            plate_number=detected_text,
            is_registered=False,
            snap_path=snap_rel_path,
            vehicle_id=None
        )
        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)
        
        return {
            "status": "UNREGISTERED",
            "plate_number": detected_text,
            "is_registered": False,
            "snap_path": snap_rel_path,
            "message": f"Alert: Unregistered Vehicle detected! Plate: {detected_text}"
        }
