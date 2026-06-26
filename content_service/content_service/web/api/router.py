from fastapi.routing import APIRouter

from content_service.web.api import monitoring, posts, authors, likes

api_router = APIRouter(prefix="/content")
api_router.include_router(monitoring.router)
api_router.include_router(posts.router)
api_router.include_router(authors.router)
api_router.include_router(likes.router)
