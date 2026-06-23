from aio_pika import Message
from fastapi import FastAPI, Request, APIRouter

router = APIRouter()

async def publish(
    app: FastAPI,
    routing_key: str,
    body: bytes,
) -> None:
    async with app.state.rmq_channel_pool.acquire() as channel:
        await channel.default_exchange.publish(
            Message(body),
            routing_key=routing_key,
        )

@router.post("/publish")
async def publish_message(request: Request) -> dict:
    await publish(request.app, "fila_exemplo", b"Ola mundo")
    return {"status": "Sucesso"}

