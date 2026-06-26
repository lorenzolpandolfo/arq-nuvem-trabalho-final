import logging
from typing import Annotated

import jwt

from uuid import UUID
from pydantic import BaseModel

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from prometheus_fastapi_instrumentator.instrumentation import (
    PrometheusFastApiInstrumentator,
)
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from content_service.db.meta import meta
from content_service.db.models import load_all_models
from content_service.services.rabbit.lifespan import (init_rabbit, shutdown_rabbit,
                                                      start_consumers)
from content_service.settings import settings


def _setup_db(app: FastAPI) -> None:  # pragma: no cover
    """
    Creates connection to the database.

    This function creates SQLAlchemy engine instance,
    session_factory for creating sessions
    and stores them in the application's state property.

    :param app: fastAPI application.
    """
    engine = create_async_engine(str(settings.db_url), echo=settings.db_echo)
    session_factory = async_sessionmaker(
        engine,
        expire_on_commit=False,
    )
    app.state.db_engine = engine
    app.state.db_session_factory = session_factory


async def _create_tables() -> None:  # pragma: no cover
    """Populates tables in the database."""
    load_all_models()
    engine = create_async_engine(str(settings.db_url))
    async with engine.begin() as connection:
        await connection.run_sync(meta.create_all)
    await engine.dispose()


def setup_prometheus(app: FastAPI) -> None:  # pragma: no cover
    """
    Enables prometheus integration.

    :param app: current application.
    """
    PrometheusFastApiInstrumentator(should_group_status_codes=False).instrument(
        app,
    ).expose(app, should_gzip=True, name="prometheus_metrics")


@asynccontextmanager
async def lifespan_setup(
    app: FastAPI,
) -> AsyncGenerator[None, None]:  # pragma: no cover
    """
    Actions to run on application startup.

    This function uses fastAPI app to store data
    in the state, such as db_engine.

    :param app: the fastAPI application.
    :return: function that actually performs actions.
    """

    app.middleware_stack = None
    _setup_db(app)
    await _create_tables()
    init_rabbit(app)
    await start_consumers(app)
    setup_prometheus(app)
    app.middleware_stack = app.build_middleware_stack()

    yield
    await app.state.db_engine.dispose()

    await shutdown_rabbit(app)


class AuthenticatedUser(BaseModel):
    id: UUID


security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> AuthenticatedUser:

    logging.warning(f"Bearer {credentials.credentials}")

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.users_secret,
            algorithms=["HS256"],
            audience="fastapi-users:auth",
        )

        return AuthenticatedUser(
            id=payload["sub"],
        )

    except Exception as err:
        logging.warning(f"Erro: %s", err)

        raise HTTPException(status_code=401)


async def get_optional_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(optional_security),
    ],
) -> AuthenticatedUser | None:

    if credentials is None:
        return None

    payload = jwt.decode(
        credentials.credentials,
        settings.users_secret,
        algorithms=["HS256"],
        audience="fastapi-users:auth",
    )

    return AuthenticatedUser(
        id=payload["sub"],
    )
