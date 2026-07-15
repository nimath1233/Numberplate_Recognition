from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from schemas import VehicleCreate, VehicleUpdate
from models import Vehicle, User
from database import SessionLocal
from dependencies import get_current_user


router = APIRouter()


# Database connection
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



# Register vehicle (JWT required)
@router.post(
    "/vehicles",
    status_code=status.HTTP_201_CREATED
)
def register_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_vehicle = Vehicle(
        plate_number=vehicle.plate_number,
        owner_name=vehicle.owner_name,
        owner_id=vehicle.owner_id,
        vehicle_model=vehicle.vehicle_model,
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
@router.get("/vehicles/{plate_number}")
def get_vehicle_by_plate(
    plate_number: str,
    db: Session = Depends(get_db)
):

    vehicle = db.query(Vehicle).filter(
        Vehicle.plate_number == plate_number
    ).first()


    if not vehicle:

        return {
            "message": "Vehicle not found"
        }


    return vehicle



# Update vehicle (JWT required)
@router.put("/vehicles/{vehicle_id}")
def update_vehicle(
    vehicle_id: int,
    vehicle: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()


    if not existing_vehicle:

        return {
            "message": "Vehicle not found"
        }


    if vehicle.owner_name is not None:
        existing_vehicle.owner_name = vehicle.owner_name


    if vehicle.owner_id is not None:
        existing_vehicle.owner_id = vehicle.owner_id


    if vehicle.vehicle_model is not None:
        existing_vehicle.vehicle_model = vehicle.vehicle_model


    if vehicle.vehicle_image is not None:
        existing_vehicle.vehicle_image = vehicle.vehicle_image



    db.commit()
    db.refresh(existing_vehicle)


    return {
        "message": "Vehicle updated successfully",
        "vehicle_id": existing_vehicle.id,
        "updated_by": current_user.username
    }




# Delete vehicle (JWT required)
@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()


    if not vehicle:

        return {
            "message": "Vehicle not found"
        }


    db.delete(vehicle)
    db.commit()


    return {
        "message": "Vehicle deleted successfully",
        "vehicle_id": vehicle_id,
        "deleted_by": current_user.username
    }
@router.get("/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id:int, db:Session=Depends(get_db)):

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()

    if not vehicle:
        return {
            "message":"Vehicle not found"
        }

    return vehicle