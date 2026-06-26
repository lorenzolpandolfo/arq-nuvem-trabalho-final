from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.db.dependencies import get_db_session
from content_service.dto.like_author_request import LikeAuthorRequest
from content_service.repository.author_repository import AuthorRepository
from content_service.repository.like_repository import LikeRepository
from content_service.services.like_service import LikeService
from content_service.web.lifespan import AuthenticatedUser, get_current_user


def get_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> LikeService:
    return LikeService(
        LikeRepository(session),
        AuthorRepository(session),
    )



router = APIRouter(prefix="/like")


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def like_author(
    request: LikeAuthorRequest,
    user: Annotated[
        AuthenticatedUser,
        Depends(get_current_user),
    ],
    service: Annotated[
        LikeService,
        Depends(get_service),
    ],
):
    liked = await service.like_author(from_user_id=user.id, to_user_id=request.user_id)
    return {"liked": liked}
