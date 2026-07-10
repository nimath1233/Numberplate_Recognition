from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User


SECRET_KEY = "ANPR_SECRET_KEY_1999"
ALGORITHM = "HS256"


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )


        username = payload.get("sub")


        if username is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )


    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


    user = db.query(User).filter(
        User.username == username
    ).first()


    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    return user