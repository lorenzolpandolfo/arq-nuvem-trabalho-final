from datetime import datetime

from pydantic import BaseModel


class PostByUserIdDTO(BaseModel):
    author: str
    image_url: str
    description: str
    created_at: datetime


class PostsByUserIdResponse(BaseModel):
    posts: list[PostByUserIdDTO]

