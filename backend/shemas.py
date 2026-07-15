from pydantic import BaseModel


class VehicleCreate(BaseModel):

    plate_number: str
    owner_name: str
    owner_id: str
    vehicle_model: str | None = None
    vehicle_image: str | None = None