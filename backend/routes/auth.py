from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password, create_access_token

from database import SessionLocal
from models import User
from schemas import UserCreate
from auth import hash_password

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    new_user = User(
        username=user.username,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }
@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.username == user.username
    ).first()


    if not existing_user:
        return {
            "message": "Invalid username or password"
        }


    if not verify_password(
        user.password,
        existing_user.password
    ):
        return {
            "message": "Invalid username or password"
        }


    token = create_access_token({
        "sub": existing_user.username,
        "role": existing_user.role
    })


    return {
        "access_token": token,
        "token_type": "bearer"
    }