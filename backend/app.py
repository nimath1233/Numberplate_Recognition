from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routes.vehicles import router as vehicle_router
from routes.auth import router as auth_router
from routes.detection import router as detection_router
from routes.alerts import router as alerts_router
from routes import parking
from routes.entrance import router as entrance_router

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

# Mount frontend assets static folder
frontend_assets = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/assets"))
if os.path.exists(frontend_assets):
    app.mount("/assets", StaticFiles(directory=frontend_assets), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "null",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehicle_router)
app.include_router(auth_router)
app.include_router(detection_router)
app.include_router(alerts_router)
app.include_router(parking.router)
app.include_router(entrance_router)

@app.get("/")
def home():
    return {"message": "Welcome to ANPR System"}