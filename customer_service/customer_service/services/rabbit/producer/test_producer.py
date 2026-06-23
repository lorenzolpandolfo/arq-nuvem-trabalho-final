from fastapi import Request, APIRouter

from customer_service.services.rabbit.lifespan import publish

router = APIRouter()

@router.post("/publish")
async def publish_message(request: Request) -> dict:

    # Para publicar uma mensagem em uma fila do rabbit, usar conforme exemplo abaixo
    # o routing_key é o equivalente a fila publicada

    await publish(request.app, "fila_exemplo", b"Ola mundo")
    return {"status": "Sucesso"}

