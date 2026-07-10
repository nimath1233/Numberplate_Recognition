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


