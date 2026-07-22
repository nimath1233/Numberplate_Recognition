from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, TIMESTAMP, text, ForeignKey

Base = declarative_base()


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(20), unique=True, nullable=False)
    owner_name = Column(String(100), nullable=False)
    owner_id = Column(String(50), nullable=False)
    vehicle_model = Column(String(100))
    vehicle_image = Column(String(255))
    registered_date = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )
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