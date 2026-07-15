from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routes.vehicles import router as vehicle_router
from routes.auth import router as auth_router
from routes.detection import router as detection_router
from routes.alerts import router as alerts_router

from database import engine
from models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ANPR System API",
    version="1.0.0"
)

# Mount uploads static folder
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehicle_router)
app.include_router(auth_router)
app.include_router(detection_router)
app.include_router(alerts_router)

@app.get("/")
def home():
    return {"message": "Welcome to ANPR System"}