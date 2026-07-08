from database import engine
from sqlalchemy import text

try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    print("✅ Database Connected Successfully!")
except Exception as e:
    print("❌ Database Connection Failed")
    print(e)