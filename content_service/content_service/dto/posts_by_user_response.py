from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PostByUserIdDTO(BaseModel):
    id: UUID
    author: str
    image_url: str
    description: str
    created_at: datetime


class PostsByUserIdResponse(BaseModel):
    posts: list[PostByUserIdDTO]

