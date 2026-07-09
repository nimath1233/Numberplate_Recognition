from fastapi import APIRouter

router = APIRouter()

@router.post("/vehicles")
def register_vehicle():
    return {
        "message": "Vehicle registered successfully"
    }