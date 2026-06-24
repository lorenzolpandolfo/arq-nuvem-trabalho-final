import logging
import uuid
from collections.abc import AsyncGenerator

from fastapi import Depends
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, schemas
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from customer_service.db.base import Base
from customer_service.db.dependencies import get_db_session
from customer_service.dto.userDTO import UserDTO
from customer_service.services.rabbit.lifespan import (publish_rabbit_message,
                                                       publish_rabbit_message_to_json)
from customer_service.settings import settings


DEFAULT_BIO = "Estou usando Lumio."

class User(SQLAlchemyBaseUserTableUUID, Base):
    """Represents a user entity."""
    image_url: Mapped[str | None] = mapped_column(nullable=True)
    name: Mapped[str] = mapped_column()
    bio: Mapped[str | None] = mapped_column(default=DEFAULT_BIO)


class UserRead(schemas.BaseUser[uuid.UUID]):
    """Represents a read command for a user."""
    image_url: str | None = None
    name: str | None = None
    bio: str | None = None

class UserCreate(schemas.BaseUserCreate):
    """Represents a create command for a user."""
    image_url: str | None = None
    bio: str | None = None
    name: str


class UserUpdate(schemas.BaseUserUpdate):
    """Represents an update command for a user."""
    image_url: str | None = None
    name: str | None = None
    bio: str | None = None

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    """Manages a user session and its tokens."""

    reset_password_token_secret = settings.users_secret
    verification_token_secret = settings.users_secret

    # Producer customer.user.created
    async def on_after_register(
        self,
        user: User,
        request=None,
    ):
        user_dto = UserDTO(
            id=user.id,
            name=user.name,
            bio=user.bio,
            image_url=user.image_url,
            is_active=user.is_active
        )
        user_dto_json = user_dto.model_dump(mode="json")

        logging.warning("Usuario criado com sucesso - Enviando na fila [customer.user.created] %s", user_dto_json)

        await publish_rabbit_message_to_json(request.app, "customer.user.created", user_dto_json)


    # Producer customer.user.updated
    async def update(
        self,
        user_update,
        user,
        safe: bool = False,
        request=None,
    ):
        updated_user = await super().update(
            user_update,
            user,
            safe=safe,
            request=request,
        )

        user_dto = UserDTO(
            id=user.id,
            name=user_update.name,
            bio=user.bio,
            image_url=user_update.image_url,
            is_active=user_update.is_active
        )
        user_dto_json = user_dto.model_dump(mode="json")

        logging.warning("Usuario atualizado com sucesso - Enviando na fila [customer.user.updated] %s",
                        user_dto_json)

        await publish_rabbit_message_to_json(
            request.app,
            "customer.user.updated",
            user_dto_json,
        )

        return updated_user

    # Producer customer.user.deleted
    async def delete(
        self,
        user,
        request=None,
    ):
        await super().delete(
            user,
            request=request,
        )

        user_dto = UserDTO(
            id=user.id,
            name=user.name,
            bio=user.bio,
            image_url=user.image_url,
            is_active=user.is_active
        )
        user_dto_json = user_dto.model_dump(mode="json")

        logging.warning("Usuario deletado com sucesso - Enviando na fila [customer.user.deleted]", user_dto_json)

        await publish_rabbit_message_to_json(
            request.app,
            "customer.user.deleted",
            user_dto_json,
        )





async def get_user_db(
    session: AsyncSession = Depends(get_db_session),
) -> AsyncGenerator[SQLAlchemyUserDatabase[User, uuid.UUID], None]:
    """
    Yield a SQLAlchemyUserDatabase instance.

    :param session: asynchronous SQLAlchemy session.
    :yields: instance of SQLAlchemyUserDatabase.
    """
    yield SQLAlchemyUserDatabase(session, User)


async def get_user_manager(
    user_db: SQLAlchemyUserDatabase[User, uuid.UUID] = Depends(get_user_db),
) -> AsyncGenerator[UserManager, None]:
    """
    Yield a UserManager instance.

    :param user_db: SQLAlchemy user db instance
    :yields: an instance of UserManager.
    """
    yield UserManager(user_db)


def get_jwt_strategy() -> JWTStrategy[User, uuid.UUID]:
    """
    Return a JWTStrategy in order to instantiate it dynamically.

    :returns: instance of JWTStrategy with provided settings.
    """
    return JWTStrategy(secret=settings.users_secret, lifetime_seconds=None)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")
auth_jwt = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

backends = [
    auth_jwt,
]

api_users = FastAPIUsers[User, uuid.UUID](get_user_manager, backends)

current_active_user = api_users.current_user(active=True)
