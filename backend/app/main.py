from fastapi import FastAPI

from app.api.endpoints import router as requests_router
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Maintenance Request Tracker API")

app.include_router(requests_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Welcome to MRT API - Server is Running!"}