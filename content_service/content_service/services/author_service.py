import logging

from content_service.db.models.author_model import AuthorModel
from content_service.dto.author_response import AuthorsResponse, AuthorResponse
from content_service.dto.userDTO import UserDTO
from content_service.repository.author_repository import AuthorRepository


class AuthorService:
    def __init__(
        self,
        author_repository: AuthorRepository,
    ):
        self.author_repository = author_repository

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
