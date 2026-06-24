import uuid

from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from content_service.db.base import Base


class LikeModel(Base):
    __tablename__ = "likes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    to_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    from_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
