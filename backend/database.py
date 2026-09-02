from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD


import urllib.parse
import os

_ENV_DATABASE_URL = os.getenv("DATABASE_URL")

if _ENV_DATABASE_URL:
    DATABASE_URL = _ENV_DATABASE_URL
else:
    _SAFE_PASSWORD = urllib.parse.quote_plus(DB_PASSWORD)
    DATABASE_URL = (
        f"postgresql://{DB_USER}:{_SAFE_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )




engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=10,
    pool_timeout=20,
    pool_recycle=300,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

try:
    Base.metadata.create_all(bind=engine)
except Exception as _init_err:
    print(f"Warning: Database metadata create_all deferred: {_init_err}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()