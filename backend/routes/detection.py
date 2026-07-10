from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil
import os
import uuid

from database import SessionLocal
from dependencies import get_current_user
from models import User


router = APIRouter(
    prefix="/detection",
    tags=["AI Detection"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)



@router.post("/upload")
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):

    # Allow only image files
    allowed_extensions = [
        ".jpg",
        ".jpeg",
        ".png"
    ]

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed"
        )


    # create unique filename
    filename = f"{uuid.uuid4()}{extension}"


    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )


    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    return {
        "message": "Image uploaded successfully",
        "filename": filename,
        "path": file_path,
        "uploaded_by": current_user.username
    }