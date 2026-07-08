from fastapi import FastAPI

app = FastAPI(
    title="ANPR System API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to ANPR System"
    }