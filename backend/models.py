from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, TIMESTAMP, text, ForeignKey, Boolean

Base = declarative_base()


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(20), unique=True, nullable=False)
    owner_name = Column(String(100), nullable=False)
    owner_id = Column(String(50), nullable=False)
    vehicle_model = Column(String(100))
    category = Column(String(20), default="Car")
    is_guest = Column(Boolean, default=False)
    vehicle_image = Column(String(255))
    registered_date = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    @property
    def category_info(self):
        return VehicleCategoryFactory.get(self.category).to_dict()


# Polymorphic Vehicle Category Domain Hierarchy (OOP)
class BaseVehicleCategory:
    name = "Base"
    glb_model = "car.glb"
    icon = "🚗"

    def to_dict(self):
        return {
            "name": self.name,
            "glb_model": self.glb_model,
            "icon": self.icon
        }

class CarCategory(BaseVehicleCategory):
    name = "Car"
    glb_model = "car.glb"
    icon = "🚗"

class BikeCategory(BaseVehicleCategory):
    name = "Bike"
    glb_model = "bike.glb"
    icon = "🏍️"

class VanCategory(BaseVehicleCategory):
    name = "Van"
    glb_model = "van.glb"
    icon = "🚐"

class BusCategory(BaseVehicleCategory):
    name = "Bus"
    glb_model = "bus.glb"
    icon = "🚌"

class TruckCategory(BaseVehicleCategory):
    name = "Truck"
    glb_model = "truck.glb"
    icon = "🚚"

class TukTukCategory(BaseVehicleCategory):
    name = "Tuk Tuk"
    glb_model = "tuktuk.glb"
    icon = "🛺"

class VehicleCategoryFactory:
    _registry = {
        "car": CarCategory,
        "bike": BikeCategory,
        "van": VanCategory,
        "bus": BusCategory,
        "truck": TruckCategory,
        "tuktuk": TukTukCategory,
        "tuk tuk": TukTukCategory,
        "three wheeler": TukTukCategory,
        "three-wheeler": TukTukCategory,
        "auto": TukTukCategory,
    }

    @classmethod
    def get(cls, category_name: str) -> BaseVehicleCategory:
        key = (category_name or "car").strip().lower()
        cat_cls = cls._registry.get(key, CarCategory)
        return cat_cls()
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False )
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)


class DetectionLog(Base):
    __tablename__ = "detection_logs"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(20), nullable=False)
    snapshot = Column(String(255))
    detection_time = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )
    status = Column(String(20), nullable=False)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(20))
    snapshot = Column(String(255))
    alert_time = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )
    reason = Column(String(255))

class ParkingSlot(Base):
    __tablename__ = "parking_slots"

    id = Column(Integer, primary_key=True, index=True)
    slot_name = Column(String(10), unique=True, nullable=False)
    status = Column(String(20), default="Available")


class ParkingSession(Base):
    __tablename__ = "parking_sessions"

    id = Column(Integer, primary_key=True, index=True)

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id"),
        nullable=False
    )

    slot_id = Column(
        Integer,
        ForeignKey("parking_slots.id"),
        nullable=False
    )

    entry_time = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    exit_time = Column(TIMESTAMP)

    status = Column(
        String(20),
        default="Active"
    )


class EntranceRecord(Base):
    __tablename__ = "entrance_records"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(20), nullable=False)
    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id", ondelete="SET NULL"),
        nullable=True
    )
    snapshot = Column(String(255))
    parking_slot = Column(String(50))
    status = Column(
        String(20),
        nullable=False,
        server_default=text("'Approved'")
    )
    entrance_time = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )
    exit_time = Column(TIMESTAMP, nullable=True)

    vehicle = relationship("Vehicle")