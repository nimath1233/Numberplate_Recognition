from pydantic import BaseModel



class VehicleCreate(BaseModel):

    plate_number: str
    owner_name: str
    owner_id: str
    vehicle_model: str | None = None
    category: str | None = "Car"
    vehicle_image: str | None = None



class VehicleUpdate(BaseModel):

    plate_number: str | None = None
    owner_name: str | None = None
    owner_id: str | None = None
    vehicle_model: str | None = None
    category: str | None = "Car"
    vehicle_image: str | None = None



class UserCreate(BaseModel):
    username: str
    password: str
    role: str


class UserUpdateRole(BaseModel):
    role: str | None = None
    password: str | None = None


class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str



class PlateCheckRequest(BaseModel):
    plate_number: str
    verification_mode: str | None = "smart"


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
    force_override: bool | None = False


class EntranceRecordCreate(BaseModel):
    plate_number: str
    snapshot: str | None = None
    parking_slot: str | None = None
    status: str | None = "Approved"

class GuestAuthorizeRequest(BaseModel):
    plate_number: str
    owner_name: str | None = "Visitor / Guest"
    category: str | None = "Car"
    purpose: str | None = "Visitor Access"
    snapshot: str | None = None


class GuestDenyRequest(BaseModel):
    plate_number: str
    snapshot: str | None = None


class AlertCreate(BaseModel):
    plate_number: str
    reason: str | None = "Security alert logged"
    snapshot: str | None = None


class GateColliderPin(BaseModel):
    x: float
    y: float


class GateCollidersConfig(BaseModel):
    pin_a: GateColliderPin
    pin_b: GateColliderPin
    pin_c: GateColliderPin
    pin_d: GateColliderPin
    gate_width_cm: float = 430.0
    driveway_depth_cm: float = 550.0


class GateTriggerRequest(BaseModel):
    plate_number: str
    line_trigger: str  # "GREEN" (Arriving / Inner Line) or "RED" (Departing / Outer Gate Line)
    snapshot: str | None = None
    vehicle_model: str | None = None
    category: str | None = "Car"
