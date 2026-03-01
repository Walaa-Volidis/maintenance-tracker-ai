from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import Priority, Status


class RequestCreate(BaseModel):
    """Schema for creating a new maintenance request.

    Only requires user-supplied fields; category, priority, and status
    are either AI-generated or default-assigned on the server side.
    """

    title: str = Field(
        ..., min_length=1, max_length=255, examples=["Leaking faucet in Room 301"]
    )
    description: str = Field(
        ..., min_length=1, examples=["The kitchen faucet has been dripping steadily."]
    )
    priority: Priority = Field(
        default=Priority.LOW, examples=[Priority.MEDIUM]
    )
    status: Status = Field(
        default=Status.PENDING, examples=[Status.PENDING]
    )


class RequestResponse(BaseModel):
    """Schema for returning a maintenance request to the client.

    Maps directly from the ORM model using ``model_config``.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: str | None = None
    ai_summary: str | None = None
    priority: Priority
    status: Status
    created_at: datetime


class AnalyticsStats(BaseModel):
    """Aggregated dashboard statistics."""

    total_requests: int = 0
    most_common_category: str | None = None
    high_priority_count: int = 0
