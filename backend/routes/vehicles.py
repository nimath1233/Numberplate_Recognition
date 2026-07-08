from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import os
import re
from ..database import get_db
from ..models import Vehicle, User
from ..auth import get_current_user
from ..ai.camera import CameraHelper
from ..config import settings

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

class VehicleRegisterSchema(BaseModel):
    model: str
    owner_id: str
    plate_number: str
    snap_base64: str  # Base64 encoded snap image from webcam/file

class VehicleResponseSchema(BaseModel):
    id: int
    model: str
    plate_number: str
    owner_id: str
    snap_path: str
    
    class Config:
        from_attributes = True

@router.post("/register", response_model=VehicleResponseSchema, status_code=status.HTTP_201_CREATED)
def register_vehicle(
    data: VehicleRegisterSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Clean plate number (uppercase, alphanumeric only)
    cleaned_plate = re.sub(r'[^a-zA-Z0-9]', '', data.plate_number).upper()
    if not cleaned_plate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid license plate format"
        )
    
    # Check if plate already registered
    existing = db.query(Vehicle).filter(Vehicle.plate_number == cleaned_plate).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle with this plate number is already registered"
        )
    
    # Convert base64 snap to CV2 image and save it
    cv_img = CameraHelper.base64_to_cv2(data.snap_base64)
    if cv_img is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image snap format"
        )
    
    # Save the snap to uploads/vehicles
    save_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), settings.UPLOAD_DIR_VEHICLES)
    snap_rel_path = CameraHelper.save_image(cv_img, save_dir, filename_prefix=cleaned_plate)
    
    if not snap_rel_path:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save vehicle snapshot"
        )
    
    # Create database entry
    db_vehicle = Vehicle(
        model=data.model,
        owner_id=data.owner_id,
        plate_number=cleaned_plate,
        snap_path=snap_rel_path
    )
    
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    
    return db_vehicle

@router.get("/", response_model=List[VehicleResponseSchema])
def list_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Vehicle).order_by(Vehicle.registered_at.desc()).all()
