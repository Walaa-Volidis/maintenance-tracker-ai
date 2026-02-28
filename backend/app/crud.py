from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.ai_logic import generate_summary, suggest_category
from app.models import MaintenanceRequest
from app.schemas import RequestCreate


def create_request(db: Session, payload: RequestCreate) -> MaintenanceRequest:
    """Persist a new maintenance request and return the created row.

    Calls the Groq-powered classifier and summarizer to auto-populate
    the category and ai_summary before saving.
    """
    category = suggest_category(payload.description)
    ai_summary = generate_summary(payload.description)

    db_request = MaintenanceRequest(
        title=payload.title,
        description=payload.description,
        category=category,
        ai_summary=ai_summary,
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
