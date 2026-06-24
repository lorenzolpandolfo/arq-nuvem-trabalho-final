from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.db.models.author_model import AuthorModel
from content_service.db.models.like_model import LikeModel
from content_service.repository.abstract_repository import AbstractRepository


class AuthorRepository(AbstractRepository[AuthorModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(AuthorModel, session)

    async def find_all_ordered_by_likes(self):
        result = await self._session.execute(
            select(
                AuthorModel.id,
                AuthorModel.name,
                AuthorModel.bio,
                AuthorModel.image_url,
                func.count(LikeModel.id).label("likes"),
            )
            .outerjoin(
                LikeModel,
                LikeModel.to_user_id == AuthorModel.id,
            )
            .where(
                AuthorModel.is_active.is_(True),
            )
            .group_by(
                AuthorModel.id,
                AuthorModel.name,
                AuthorModel.bio,
                AuthorModel.image_url,
            )
            .order_by(
                desc(func.count(LikeModel.id)),
            )
        )

        return result.mappings().all()
