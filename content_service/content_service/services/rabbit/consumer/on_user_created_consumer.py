import logging
from aio_pika import Channel, IncomingMessage


async def on_user_created_handler(message: IncomingMessage) -> None:
    async with message.process():
        logging.warning(f"Usuario criado: {message.body}")

