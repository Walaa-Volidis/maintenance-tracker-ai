from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import router as requests_router
from app.core.config import settings
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Maintenance Request Tracker API",
    redirect_slashes=False,
)

# Support comma-separated origins so localhost + Vercel production both work.
_origins = [o.strip() for o in settings.frontend_url.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(requests_router, prefix="/api/requests")


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Welcome to MRT API - Server is Running!"}