from fastapi import HTTPException, status

from content_service.db.models.like_model import LikeModel
from content_service.repository.author_repository import AuthorRepository
from content_service.repository.like_repository import LikeRepository


class LikeService:
    def __init__(
        self,
        like_repository: LikeRepository,
        author_repository: AuthorRepository,
    ):
        self.like_repository: LikeRepository = like_repository
        self.author_repository: AuthorRepository = author_repository

    async def like_author(
        self,
        from_user_id,
        to_user_id,
    ) -> bool:
        if from_user_id == to_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can not like yourself.",
            )

        user_target = await self.author_repository.find_by_id(to_user_id)

        if user_target is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )


        already_liked = await self.like_repository.find_by_users(
            from_user_id=from_user_id,
            to_user_id=to_user_id,
        )

        if already_liked:
            await self.like_repository.delete_by_id(already_liked.id)
            return False


        like = LikeModel(
            from_user_id=from_user_id,
            to_user_id=to_user_id,
        )

        await self.like_repository.save(like)
        return True
