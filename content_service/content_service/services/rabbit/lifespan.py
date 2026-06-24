import asyncio
import logging

import aio_pika
from aio_pika import Channel, IncomingMessage
from aio_pika.abc import AbstractChannel, AbstractRobustConnection
from aio_pika.pool import Pool
from fastapi import FastAPI

from content_service.services.rabbit.consumer.on_user_created_consumer import \
    on_user_created_handler
from content_service.services.rabbit.consumer.test_consumer import test_message_handler
from content_service.settings import settings


def init_rabbit(app: FastAPI) -> None:
    async def get_connection() -> AbstractRobustConnection:
        return await aio_pika.connect_robust(str(settings.rabbit_url))

    connection_pool: Pool[AbstractRobustConnection] = Pool(
        get_connection,
        max_size=settings.rabbit_pool_size,
    )

    async def get_channel() -> AbstractChannel:
        async with connection_pool.acquire() as connection:
            return await connection.channel()

    channel_pool: Pool[AbstractChannel] = Pool(
        get_channel,
        max_size=settings.rabbit_channel_pool_size,
    )

    app.state.rmq_pool = connection_pool
    app.state.rmq_channel_pool = channel_pool
    app.state.rabbit_tasks = []


async def shutdown_rabbit(app: FastAPI) -> None:
    for task in getattr(app.state, "rabbit_tasks", []):
        task.cancel()

    await app.state.rmq_channel_pool.close()
    await app.state.rmq_pool.close()


async def default_handler(message: IncomingMessage) -> None:
    async with message.process():
        logging.warning(f"Message: {message.body}")
        print(message.body.decode())


async def _start_consumer(
    pool: Pool[AbstractChannel],
    queue_name: str,
    handler=default_handler,
) -> None:
    async with pool.acquire() as channel:
        queue = await channel.declare_queue(
            queue_name,
            durable=True,
        )

        await queue.consume(handler)

        try:
            await asyncio.Event().wait()
        except asyncio.CancelledError:
            return


def _register_consumer(
    app: FastAPI,
    queue_name: str,
    handler=default_handler,
):
    task = asyncio.create_task(
        _start_consumer(
            app.state.rmq_channel_pool,
            queue_name,
            handler,
        )
    )
    app.state.rabbit_tasks.append(task)


async def start_consumers(app: FastAPI) -> None:
    # Para registrar um consumidor para uma fila, é preciso mapear aqui

    _register_consumer(
        app,
        "fila_exemplo",
        test_message_handler,
    )

    _register_consumer(
        app,
        "customer.user.created",
        on_user_created_handler,
    )
