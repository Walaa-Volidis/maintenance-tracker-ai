from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.ai_logic import generate_summary, suggest_category
from app.models import MaintenanceRequest, Priority
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


def get_all_requests(
    db: Session, *, skip: int = 0, limit: int = 5
) -> dict:
    """Return a paginated list of maintenance requests, newest first."""
    total = db.scalar(select(func.count(MaintenanceRequest.id))) or 0

    stmt = (
        select(MaintenanceRequest)
        .order_by(MaintenanceRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = list(db.scalars(stmt).all())

    page = (skip // limit) + 1 if limit > 0 else 1
    pages = max(1, -(-total // limit)) if limit > 0 else 1 

    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": pages,
    }


def get_analytics_stats(db: Session) -> dict:
    """Return aggregated analytics for the dashboard."""
    total = db.scalar(select(func.count(MaintenanceRequest.id))) or 0

    high_priority = (
        db.scalar(
            select(func.count(MaintenanceRequest.id)).where(
                MaintenanceRequest.priority == Priority.HIGH
            )
        )
        or 0
    )

    # Most common non-null category
    most_common_category = None
    if total > 0:
        row = db.execute(
            select(
                MaintenanceRequest.category,
                func.count(MaintenanceRequest.id).label("cnt"),
            )
            .where(MaintenanceRequest.category.is_not(None))
            .group_by(MaintenanceRequest.category)
            .order_by(func.count(MaintenanceRequest.id).desc())
            .limit(1)
        ).first()
        if row:
            most_common_category = row[0]

    return {
        "total_requests": total,
        "most_common_category": most_common_category,
        "high_priority_count": high_priority,
    }
