from uuid import UUID

from pydantic import BaseModel

from datetime import datetime

class PostResponse(BaseModel):
    author_id: UUID
    author_name: str
    author_image_url: str | None
    description: str
    created_date: datetime
