from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from content_service.db.dependencies import get_db_session
from content_service.repository.post_repository import PostRepository
from content_service.services.post_service import PostService
from content_service.web.lifespan import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/posts", tags=["Posts"])


def get_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> PostService:
    return PostService(
        PostRepository(session),
    )


class CreatePostRequest(BaseModel):
    description: str

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_post(
    request: CreatePostRequest,
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
    service: Annotated[PostService, Depends(get_service)],
):
    await service.create_post(
        user.id,
        request.description,
    )
    return {"status": "success"}

@router.get("", status_code=status.HTTP_200_OK)
async def get_posts(
    service: Annotated[PostService, Depends(get_service)],
):
    return {
        "posts": await service.get_feed(),
    }
