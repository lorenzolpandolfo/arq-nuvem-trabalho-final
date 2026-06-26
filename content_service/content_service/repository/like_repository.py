from uuid import UUID

from sqlalchemy import select, func

from content_service.db.models.like_model import LikeModel
from content_service.repository.abstract_repository import AbstractRepository


class LikeRepository(AbstractRepository[LikeModel]):
    def __init__(self, session):
        super().__init__(LikeModel, session)

    async def find_by_users(
        self,
        from_user_id: UUID,
        to_user_id: UUID,
    ) -> LikeModel | None:
        result = await self._session.execute(
            select(LikeModel).where(
                LikeModel.from_user_id == from_user_id,
                LikeModel.to_user_id == to_user_id,
            )
        )

        return result.scalar_one_or_none()


    async def count_received(self, author_id):
        result = await self._session.execute(
            select(func.count())
            .select_from(LikeModel)
            .where(
                LikeModel.to_user_id == author_id,
            )
        )

        return result.scalar_one()

    async def has_like(
        self,
        from_user_id,
        to_user_id,
    ):
        return await self.exists(
            from_user_id=from_user_id,
            to_user_id=to_user_id,
        )
