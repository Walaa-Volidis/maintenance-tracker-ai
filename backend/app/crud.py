from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import MaintenanceRequest
from app.schemas import RequestCreate


def create_request(db: Session, payload: RequestCreate) -> MaintenanceRequest:
    """Persist a new maintenance request and return the created row."""
    db_request = MaintenanceRequest(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        status=payload.status,
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


def get_all_requests(db: Session) -> list[MaintenanceRequest]:
    """Return every maintenance request, newest first."""
    stmt = select(MaintenanceRequest).order_by(MaintenanceRequest.created_at.desc())
    return list(db.scalars(stmt).all())
