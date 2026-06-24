from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.db.models.author_model import AuthorModel
from repository.abstract_repository import AbstractRepository


class AuthorRepository(AbstractRepository[AuthorModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(AuthorModel, session)
