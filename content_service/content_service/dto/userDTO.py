from pydantic import BaseModel
import uuid

class UserDTO(BaseModel):
    id: uuid.UUID
    name: str | None = None
    bio: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
