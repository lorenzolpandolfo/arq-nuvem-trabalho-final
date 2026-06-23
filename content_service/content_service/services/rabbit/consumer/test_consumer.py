import asyncio
import logging
from aio_pika import Channel, IncomingMessage


async def message_handler(message: IncomingMessage) -> None:
    async with message.process():
        logging.warning(f"Message custom: {message.body}")
        print(message.body.decode())

