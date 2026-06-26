from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.db.models.author_model import AuthorModel
from content_service.db.models.post_model import PostModel
from content_service.repository.abstract_repository import AbstractRepository


class PostRepository(AbstractRepository[PostModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(PostModel, session)


    async def find_feed(self):
        result = await self._session.execute(
            select(
                PostModel.id,
                PostModel.author_id,
                PostModel.description,
                PostModel.created_date,
                AuthorModel.name.label("author_name"),
                AuthorModel.image_url.label("author_image_url"),
            )
            .join(
                AuthorModel,
                AuthorModel.id == PostModel.author_id,
            )
            .where(
                PostModel.is_active.is_(True),
                AuthorModel.is_active.is_(True),
            )
            .order_by(PostModel.created_date.desc())
        )

        return result.mappings().all()


    async def count_by_author(self, author_id):
        result = await self._session.execute(
            select(func.count())
            .select_from(PostModel)
            .where(
                PostModel.author_id == author_id,
                PostModel.is_active.is_(True),
            )
        )

        return result.scalar_one()



    async def find_by_author(
        self,
        author_id: UUID,
        limit: int = 20,
        offset: int = 0,
    ):
        result = await self._session.execute(
            select(
                AuthorModel.name.label("author"),
                AuthorModel.image_url,
                PostModel.description,
                PostModel.created_date.label("created_at"),
            )
            .join(
                AuthorModel,
                AuthorModel.id == PostModel.author_id,
            )
            .where(
                PostModel.author_id == author_id,
                PostModel.is_active.is_(True),
            )
            .order_by(PostModel.created_date.desc())
            .limit(limit)
            .offset(offset)
        )

        return result.mappings().all()
