from pydantic import BaseModel
import uuid

class UserDTO(BaseModel):
    id: uuid.UUID | None = None
    name: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
