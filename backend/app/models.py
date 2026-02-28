import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Priority(str, enum.Enum):
    """Maintenance request priority levels."""

    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class Status(str, enum.Enum):
    """Maintenance request lifecycle statuses."""

    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


class MaintenanceRequest(Base):
    """SQLAlchemy model representing a maintenance request."""

    __tablename__ = "maintenance_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(
        String(100), nullable=True, default=None
    )
    priority: Mapped[str] = mapped_column(
        Enum(Priority), nullable=False, default=Priority.LOW
    )
    status: Mapped[str] = mapped_column(
        Enum(Status), nullable=False, default=Status.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return (
            f"<MaintenanceRequest(id={self.id}, title='{self.title}', "
            f"status='{self.status}')>"
        )
