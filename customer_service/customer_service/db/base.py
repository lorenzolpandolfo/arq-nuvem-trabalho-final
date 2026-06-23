from sqlalchemy.orm import DeclarativeBase

from customer_service.db.meta import meta


class Base(DeclarativeBase):
    """Base for all models."""

    metadata = meta
