from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from schemas import VehicleCreate, VehicleUpdate
from models import Vehicle, User
from database import get_db
from dependencies import get_current_user, get_current_admin_user
from ai.modules.validator import normalize_plate, PlateValidator

router = APIRouter()



import re

OCR_PLATE_REGEX = re.compile(r'^[A-Z0-9]{1,4}-\d{4,5}$')


# Register vehicle (ADMIN ONLY)
@router.post(
    "/vehicles",
    status_code=status.HTTP_201_CREATED
)
def register_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    norm_info = normalize_plate(vehicle.plate_number)
    plate = norm_info["normalized_plate"] if norm_info.get("normalized_plate") else vehicle.plate_number.strip().upper()

    # Ensure hyphen exists if valid letters/digits
    if '-' not in plate and len(plate) >= 5:
        m3 = re.match(r'^([A-Z0-9]{1,4})(\d{4,5})$', plate)
        if m3:
            plate = f"{m3.group(1)}-{m3.group(2)}"

    if not OCR_PLATE_REGEX.match(plate) and not norm_info.get("valid"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid License Plate Format! Plate number must match valid Sri Lankan format (e.g., CA-1234, CDD-3435, 1-1234, 15-3201, 301-5678, AIR-1234, NAVY-5678, ARMY-4321)."
        )

    # Check for existing plate
    existing = db.query(Vehicle).filter(func.upper(Vehicle.plate_number) == plate).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vehicle with plate number '{plate}' is already registered."
        )

    new_vehicle = Vehicle(
        plate_number=plate,
        owner_name=vehicle.owner_name,
        owner_id=vehicle.owner_id,
        vehicle_model=vehicle.vehicle_model,
        category=vehicle.category or "Car",
        vehicle_image=vehicle.vehicle_image
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return {
        "message": "Vehicle registered successfully",
        "vehicle_id": new_vehicle.id,
        "registered_by": current_user.username
    }



# Get all vehicles (No login required)
@router.get("/vehicles")
def get_vehicles(
    db: Session = Depends(get_db)
):

    vehicles = db.query(Vehicle).all()

    return vehicles



# Search vehicle by plate number (No login required)
@router.get("/vehicles/plate/{plate_number}")
def get_vehicle_by_plate(
    plate_number: str,
    db: Session = Depends(get_db)
):
    norm_info = normalize_plate(plate_number)
    target = norm_info["normalized_plate"] if norm_info.get("normalized_plate") else plate_number.strip().upper()

    vehicle = db.query(Vehicle).filter(
        func.upper(Vehicle.plate_number) == target
    ).first()

    if not vehicle:
        # Fallback stripped comparison
        clean_target = re.sub(r'[\s\-_]', '', target)
        for v in db.query(Vehicle).all():
            if v.plate_number and re.sub(r'[\s\-_]', '', v.plate_number.strip().upper()) == clean_target:
                vehicle = v
                break

    if not vehicle:
        return {
            "message": "Vehicle not found"
        }

    return vehicle



# Update vehicle (ADMIN ONLY)
@router.put("/vehicles/{vehicle_id}")
def update_vehicle(
    vehicle_id: int,
    vehicle: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):

    existing_vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()


    if not existing_vehicle:
        raise HTTPException(
            status_code=444,
            detail="Vehicle not found"
        )

    if vehicle.plate_number is not None and vehicle.plate_number.strip():
        new_plate = vehicle.plate_number.strip().upper()
        new_plate = re.sub(r'[\s\-]+', '-', new_plate)
        if '-' not in new_plate and len(new_plate) >= 6:
            m3 = re.match(r'^([A-Z0-9]{3})(\d{4,5})$', new_plate)
            m2 = re.match(r'^([A-Z0-9]{2})(\d{4,5})$', new_plate)
            if m3:
                new_plate = f"{m3.group(1)}-{m3.group(2)}"
            elif m2:
                new_plate = f"{m2.group(1)}-{m2.group(2)}"

        if not OCR_PLATE_REGEX.match(new_plate):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid License Plate Format! Plate number must match valid OCR format (e.g., KK-7066, GS-4650, 20-2218, BJE-7406, AIR-86097)."
            )

        dup = db.query(Vehicle).filter(
            func.upper(Vehicle.plate_number) == new_plate,
            Vehicle.id != vehicle_id
        ).first()

        if dup:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vehicle with plate number '{new_plate}' is already registered."
            )

        # Update plate references in EntranceRecord if plate changed
        if existing_vehicle.plate_number != new_plate:
            from models import EntranceRecord
            db.query(EntranceRecord).filter(
                func.upper(EntranceRecord.plate_number) == func.upper(existing_vehicle.plate_number)
            ).update({"plate_number": new_plate}, synchronize_session=False)

        existing_vehicle.plate_number = new_plate

    if vehicle.owner_name is not None:
        existing_vehicle.owner_name = vehicle.owner_name

    if vehicle.owner_id is not None:
        existing_vehicle.owner_id = vehicle.owner_id

    if vehicle.vehicle_model is not None:
        existing_vehicle.vehicle_model = vehicle.vehicle_model

    if vehicle.category is not None:
        existing_vehicle.category = vehicle.category

    if vehicle.vehicle_image is not None:
        existing_vehicle.vehicle_image = vehicle.vehicle_image



    db.commit()
    db.refresh(existing_vehicle)


    return {
        "message": "Vehicle updated successfully",
        "vehicle_id": existing_vehicle.id,
        "updated_by": current_user.username
    }




# Delete vehicle (ADMIN ONLY)
@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    from models import ParkingSession, EntranceRecord

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    # Prevent deleting a vehicle that is currently parked inside premises
    active_session = db.query(ParkingSession).filter(
        ParkingSession.vehicle_id == vehicle_id,
        ParkingSession.status == "Active"
    ).first()

    active_entrance = db.query(EntranceRecord).filter(
        (EntranceRecord.vehicle_id == vehicle_id) | (func.upper(EntranceRecord.plate_number) == func.upper(vehicle.plate_number)),
        EntranceRecord.exit_time.is_(None)
    ).first()

    if active_session or active_entrance:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete vehicle '{vehicle.plate_number}' while it is inside premises. Please release the vehicle first."
        )

    try:
        # Delete/nullify historical references to prevent Foreign Key constraint failures
        db.query(ParkingSession).filter(ParkingSession.vehicle_id == vehicle_id).delete(synchronize_session=False)
        db.query(EntranceRecord).filter(EntranceRecord.vehicle_id == vehicle_id).update({"vehicle_id": None}, synchronize_session=False)
        db.flush()

        db.delete(vehicle)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete vehicle: {str(e)}"
        )

    return {
        "message": "Vehicle deleted successfully",
        "vehicle_id": vehicle_id,
        "deleted_by": current_user.username
    }
@router.get("/vehicles/{vehicle_id:int}")
def get_vehicle(vehicle_id:int, db:Session=Depends(get_db)):

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()

    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )

    return vehicle