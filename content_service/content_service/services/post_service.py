import logging
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

from content_service.db.models.post_model import PostModel
from content_service.dto.post_response import PostResponse
from content_service.dto.posts_by_user_response import (PostsByUserIdResponse,
                                                        PostByUserIdDTO)
from content_service.repository.post_repository import PostRepository




class PostService:
    def __init__(
        self,
        post_repository: PostRepository,
    ):
        self.post_repository = post_repository


    async def create_post(self, author_id, description):
        logging.warning("[post-service] criando post para o userId %s com o conteudo %s", author_id, description)

        post = PostModel(author_id=author_id, description=description)
        await self.post_repository.save(post)

    async def get_feed(self) -> list[PostResponse]:
        rows = await self.post_repository.find_feed()

        return [
            PostResponse.model_validate(row)
            for row in rows
        ]


    async def get_posts_by_author(
        self,
        author_id: UUID,
        limit: int,
        offset: int,
    ) -> PostsByUserIdResponse:
        posts = await self.post_repository.find_by_author(
            author_id,
            limit,
            offset,
        )

        return PostsByUserIdResponse(
            posts=[
                PostByUserIdDTO.model_validate(post)
                for post in posts
            ]
        )
