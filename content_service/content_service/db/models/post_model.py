import uuid
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from content_service.db.base import Base


class PostModel(Base):
    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))

    description: Mapped[str]

    is_active: Mapped[bool] = mapped_column(default=True)

    created_date: Mapped[datetime] = mapped_column(default=datetime.utcnow)
