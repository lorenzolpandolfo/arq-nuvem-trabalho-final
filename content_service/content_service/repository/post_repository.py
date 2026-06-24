from sqlalchemy import select
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
