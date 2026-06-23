from fastapi import Request, APIRouter
from pydantic import BaseModel

from customer_service.services.rabbit.lifespan import publish_rabbit_message

router = APIRouter()

class EchoRequest(BaseModel):
    message: str


@router.post("/publish")
async def publish_message(request: Request, data: EchoRequest) -> dict:
    # Para publicar uma mensagem em uma fila do rabbit, usar conforme exemplo abaixo
    # o routing_key é o equivalente a fila publicada

    await publish_rabbit_message(request.app, "fila_exemplo", data.message.encode())

    return {"status": "Mensagem enviada com sucesso."}

