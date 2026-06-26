import uuid

from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from content_service.db.base import Base


class LikeModel(Base):
    __tablename__ = "likes"

    __table_args__ = (
        UniqueConstraint(
            "from_user_id",
            "to_user_id",
            name="uq_like_from_to",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    to_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    from_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
