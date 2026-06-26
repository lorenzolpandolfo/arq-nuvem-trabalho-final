from uuid import UUID

from pydantic import BaseModel


class LikeAuthorRequest(BaseModel):
    user_id: UUID
