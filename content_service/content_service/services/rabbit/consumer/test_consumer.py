import logging
from aio_pika import Channel, IncomingMessage


async def test_message_handler(message: IncomingMessage) -> None:
    async with message.process():
        logging.warning(f"Mensagem recebida na fila de teste: {message.body}")

