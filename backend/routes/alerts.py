from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import Scan, Vehicle, User
from ..auth import get_current_user

router = APIRouter(prefix="/api/logs", tags=["Logs & Alerts"])

# Define response schema matching relations
class VehicleCompactSchema(BaseModel):
    model: str
    owner_id: str
    snap_path: str

    class Config:
        from_attributes = True

class ScanLogSchema(BaseModel):
    id: int
    plate_number: str
    is_registered: bool
    snap_path: str
    scanned_at: datetime
    vehicle: Optional[VehicleCompactSchema] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ScanLogSchema])
def list_scan_logs(
    limit: int = 50,
    is_registered: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the recent scan history. 
    Can optionally filter by registered/unregistered status.
    """
    query = db.query(Scan).options(joinedload(Scan.vehicle))
    
    if is_registered is not None:
        query = query.filter(Scan.is_registered == is_registered)
        
    logs = query.order_by(Scan.scanned_at.desc()).limit(limit).all()
    return logs
