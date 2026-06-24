import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from aio_pika import Channel, IncomingMessage

from content_service.dto.userDTO import UserDTO
from content_service.services.author_service import AuthorService
from repository.author_repository import AuthorRepository



def build_on_user_created_handler(session_factory):
    async def handler(message: IncomingMessage) -> None:
        logging.warning("[RabbitMQ] Mensagem recebida na fila [customer.user.created]: %s", message.body)

        async with message.process():
            user = UserDTO.model_validate_json(message.body)

            async with session_factory() as session:
                repo = AuthorRepository(session)
                service = AuthorService(repo)

                await service.on_user_created(user)
                await session.commit()


    return handler


def build_on_user_updated_handler(session_factory):
    async def handler(message: IncomingMessage) -> None:
        logging.warning("[RabbitMQ] Mensagem recebida na fila [customer.user.updated]: %s", message.body)

        async with message.process():
            user = UserDTO.model_validate_json(message.body)

            async with session_factory() as session:
                repo = AuthorRepository(session)
                service = AuthorService(repo)

                await service.on_user_updated(user)
                await session.commit()


    return handler



def build_on_user_deleted_handler(session_factory):
    async def handler(message: IncomingMessage) -> None:
        logging.warning("[RabbitMQ] Mensagem recebida na fila [customer.user.deleted]: %s", message.body)

        async with message.process():
            user = UserDTO.model_validate_json(message.body)

            async with session_factory() as session:
                repo = AuthorRepository(session)
                service = AuthorService(repo)

                # await service.on_user_created(user)
                await session.commit()


    return handler
