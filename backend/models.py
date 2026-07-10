from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, TIMESTAMP, text

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
   