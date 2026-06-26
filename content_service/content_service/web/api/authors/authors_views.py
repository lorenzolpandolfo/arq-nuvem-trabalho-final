from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from content_service.db.dependencies import get_db_session
from content_service.dto.author_metrics_response import AuthorMetricsResponse
from content_service.dto.author_response import AuthorsResponse
from content_service.repository.author_repository import AuthorRepository
from content_service.repository.like_repository import LikeRepository
from content_service.repository.post_repository import PostRepository
from content_service.services.author_service import AuthorService
from content_service.web.lifespan import AuthenticatedUser, get_optional_current_user

router = APIRouter(prefix="/authors", tags=["Authors"])


def get_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> AuthorService:
    return AuthorService(
        AuthorRepository(session),
        PostRepository(session),
        LikeRepository(session),
    )


@router.get("", response_model=AuthorsResponse)
async def get_authors(
    service: Annotated[AuthorService, Depends(get_service)],
):
    return await service.get_authors()


@router.get(
    "/author/{author_id}",
    response_model=AuthorMetricsResponse,
)
async def get_author_metrics(
    author_id: UUID,
    user: Annotated[
        AuthenticatedUser | None,
        Depends(get_optional_current_user),
    ],
    service: Annotated[
        AuthorService,
        Depends(get_service),
    ],
):
    return await service.get_metrics(
        author_id=author_id,
        current_user_id=user.id if user else None,
    )
