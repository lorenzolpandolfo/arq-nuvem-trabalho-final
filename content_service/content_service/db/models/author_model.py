import uuid
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from content_service.db.base import Base


class AuthorModel(Base):
    __tablename__ = "authors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
    )
    name: Mapped[str]
    bio: Mapped[str | None]
    image_url: Mapped[str | None] = mapped_column(nullable=True)

    is_active: Mapped[bool] = mapped_column(default=False)

    created_date: Mapped[datetime] = mapped_column(default=datetime.utcnow)
