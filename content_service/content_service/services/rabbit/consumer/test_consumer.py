import asyncio
from fastapi import FastAPI

from content_service.services.rabbit.lifespan import _start_consumer


async def start_consumers(app: FastAPI) -> None:
    task = asyncio.create_task(
        _start_consumer(app.state.rmq_channel_pool, "minha_fila")
    )
    app.state.rabbit_tasks.append(task)
