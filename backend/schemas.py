from pydantic import BaseModel



class VehicleCreate(BaseModel):

    plate_number: str
    owner_name: str
    owner_id: str
    vehicle_model: str | None = None
    vehicle_image: str | None = None



class VehicleUpdate(BaseModel):

    owner_name: str | None = None
    owner_id: str | None = None
    vehicle_model: str | None = None
    vehicle_image: str | None = None



class UserCreate(BaseModel):
    username: str
    password: str
    role: str



class UserLogin(BaseModel):
    username: str
    password: str


class PlateCheckRequest(BaseModel):
    plate_number: str


class ParkingSlotCreate(BaseModel):
    slot_number: str


class ParkingAssign(BaseModel):
    vehicle_id: int | None = None
    slot_id: int | None = None
    plate_number: str | None = None
    slot_name: str | None = None

class ParkingRelease(BaseModel):
    session_id: int | None = None
    plate_number: str | None = None
    slot_name: str | None = None



