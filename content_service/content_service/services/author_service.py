import logging

from content_service.db.models.author_model import AuthorModel
from content_service.dto.userDTO import UserDTO
from repository.author_repository import AuthorRepository


class AuthorService:
    def __init__(
        self,
        author_repository: AuthorRepository,
    ):
        self.author_repository = author_repository

    async def on_user_created(self, user: UserDTO):
        logging.warning("[SERVICE] Usuario criado: %s", user)

        author = AuthorModel(id=user.id, name=user.name, image_url=user.image_url, is_active=user.is_active)

        await self.author_repository.save(author)

        all_authors = await self.author_repository.find_all()
        logging.warning("Todos autores: %s", all_authors)



    async def on_user_updated(self, user: UserDTO):
        logging.warning("[SERVICE] Usuario atualizado: %s", user)

        data = user.model_dump(exclude_unset=True)

        update_data = {
            k: v
            for k, v in data.items()
            if v is not None
        }

        # all_authors = await self.author_repository.find_all()
        # logging.warning("Todos autores: %s", all_authors)

        user_before_update = await self.author_repository.find_by_id(user.id)

        # logging.warning("user before: %s e campos novos: %s", user_before_update, update_data)

        await self.author_repository.update(
            user_before_update,
            update_data,
        )
