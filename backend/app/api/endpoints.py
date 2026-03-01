from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.crud import create_request, get_all_requests, get_analytics_stats
from app.database import get_db
from app.schemas import AnalyticsStats, RequestCreate, RequestResponse

router = APIRouter(tags=["Maintenance Requests"])

analytics_router = APIRouter(tags=["Analytics"])


@router.post(
    "",
    response_model=RequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a maintenance request",
)
def create_maintenance_request(
    payload: RequestCreate,
    db: Session = Depends(get_db),
) -> RequestResponse:
    """Accept a new maintenance request and persist it to the database."""
    return create_request(db, payload)


@router.get(
    "",
    response_model=list[RequestResponse],
    summary="List all maintenance requests",
)
def list_maintenance_requests(
    db: Session = Depends(get_db),
) -> list[RequestResponse]:
    """Return all maintenance requests ordered by newest first."""
    return get_all_requests(db)


@analytics_router.get(
    "",
    response_model=AnalyticsStats,
    summary="Get dashboard analytics",
)
def get_stats(
    db: Session = Depends(get_db),
) -> AnalyticsStats:
    """Return aggregated statistics for the dashboard cards."""
    return get_analytics_stats(db)
