from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.crud import create_request, get_all_requests, get_analytics_stats
from app.database import get_db
from app.schemas import AnalyticsStats, PaginatedResponse, RequestCreate, RequestResponse

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
    response_model=PaginatedResponse,
    summary="List maintenance requests (paginated)",
)
def list_maintenance_requests(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(5, ge=1, le=100, description="Max records per page"),
    db: Session = Depends(get_db),
) -> PaginatedResponse:
    """Return a paginated list of maintenance requests, newest first."""
    return get_all_requests(db, skip=skip, limit=limit)


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
