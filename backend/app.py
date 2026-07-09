from fastapi import FastAPI
from routes.vehicles import router as vehicle_router

app = FastAPI(
    title="ANPR System API",
    version="1.0.0"
)

app.include_router(vehicle_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to ANPR System"
    }