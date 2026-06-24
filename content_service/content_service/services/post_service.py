import logging
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

from content_service.db.models.post_model import PostModel
from content_service.repository.post_repository import PostRepository


class PostResponse(BaseModel):
    author_id: UUID
    author_name: str
    author_image_url: str | None
    description: str
    created_date: datetime


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

