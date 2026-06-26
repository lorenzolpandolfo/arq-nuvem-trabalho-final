import logging
from fastapi import HTTPException


from content_service.db.models.author_model import AuthorModel
from content_service.dto.author_metrics_response import AuthorMetricsResponse
from content_service.dto.author_response import AuthorsResponse, AuthorResponse
from content_service.dto.userDTO import UserDTO
from content_service.repository.author_repository import AuthorRepository
from content_service.repository.like_repository import LikeRepository
from content_service.repository.post_repository import PostRepository


class AuthorService:
    def __init__(
        self,
        author_repository: AuthorRepository,
        post_repository: PostRepository,
        like_repository: LikeRepository,
    ):
        self.author_repository = author_repository
        self.post_repository = post_repository
        self.like_repository = like_repository

    async def on_user_created(self, user: UserDTO):
        author = AuthorModel(id=user.id, name=user.name, bio=user.bio, image_url=user.image_url, is_active=user.is_active)
        await self.author_repository.save(author)

        logging.warning("[author-service] Autor criado: %s", user)


    async def on_user_updated(self, user: UserDTO):
        data = user.model_dump(exclude_unset=True)

        update_data = {
            k: v
            for k, v in data.items()
            if v is not None
        }

        user_before_update = await self.author_repository.find_by_id(user.id)
        await self.author_repository.update(
            user_before_update,
            update_data,
        )
        logging.warning("[author-service] Usuario atualizado: %s", user)


    async def get_authors(self) -> AuthorsResponse:
        authors = await self.author_repository.find_all_ordered_by_likes()

        return AuthorsResponse(
            authors=[
                AuthorResponse(
                    id=author.id,
                    image_url=author.image_url,
                    name=author.name,
                    bio=author.bio,
                    likes=author.likes,
                )
                for author in authors
            ]
        )



    async def get_metrics(
        self,
        author_id,
        current_user_id=None,
    ):
        author = await self.author_repository.find_by_id(author_id)

        if author is None:
            raise HTTPException(
                status_code=404,
                detail="Author not found.",
            )

        posts = await self.post_repository.count_by_author(author_id)

        likes = await self.like_repository.count_received(author_id)

        has_like = False


        if current_user_id is not None:
            has_like = await self.like_repository.has_like(
                from_user_id=current_user_id,
                to_user_id=author_id,
            )

        logging.warning("[author-service] Usuario id %s contem like no usuario id %s ? %s", current_user_id, author_id, has_like)

        return AuthorMetricsResponse(
            name=author.name,
            bio=author.bio,
            image_url=author.image_url,
            posts=posts,
            likes=likes,
            has_like=has_like,
        )
