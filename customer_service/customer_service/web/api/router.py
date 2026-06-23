from fastapi.routing import APIRouter

from customer_service.web.api import monitoring, users
from customer_service.services.rabbit.producer import test_producer

api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(users.router)
api_router.include_router(test_producer.router)
