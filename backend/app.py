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
from routes.admin import router as admin_router
from routes.ws import router as ws_router

from database import engine
from models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ANPR System API",
    version="1.0.0"
)

from config import UPLOAD_DIR, ASSETS_DIR

# Mount uploads static folder
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Mount frontend assets static folder
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
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
app.include_router(admin_router)
app.include_router(ws_router)

@app.get("/")
def home():
    return {"message": "Welcome to ANPR System"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)