from fastapi import FastAPI

from routes.vehicles import router as vehicle_router
from routes.auth import router as auth_router
from database import engine
from models import Base
from routes.detection import router as detection_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="ANPR System API",
    version="1.0.0"
)


app.include_router(vehicle_router)
app.include_router(auth_router)
app.include_router(detection_router)


@app.get("/")
def home():

    return {
        "message": "Welcome to ANPR System"
    }