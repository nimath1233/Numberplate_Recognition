from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password, create_access_token

from database import get_db
from models import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    status_code=status.HTTP_403_FORBIDDEN
)
def register_user():
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Self-registration is disabled. Account creation is restricted to system administrators via the Admin Panel."
    )
@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.username == user.username
    ).first()


    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not verify_password(
        user.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )


    token = create_access_token({
        "sub": existing_user.username,
        "role": existing_user.role
    })


    return {
        "access_token": token,
        "token_type": "bearer",
        "role": existing_user.role,
        "username": existing_user.username
    }