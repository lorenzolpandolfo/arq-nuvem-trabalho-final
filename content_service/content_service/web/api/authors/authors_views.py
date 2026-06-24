from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from content_service.db.dependencies import get_db_session
from content_service.dto.author_response import AuthorsResponse
from content_service.repository.author_repository import AuthorRepository
from content_service.services.author_service import AuthorService

router = APIRouter(prefix="/authors", tags=["Authors"])


def get_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> AuthorService:
    return AuthorService(
        AuthorRepository(session),
    )


@router.get("", response_model=AuthorsResponse)
async def get_authors(
    service: Annotated[AuthorService, Depends(get_service)],
):
    return await service.get_authors()
