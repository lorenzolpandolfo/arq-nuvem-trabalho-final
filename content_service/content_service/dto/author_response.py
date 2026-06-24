from uuid import UUID

from pydantic import BaseModel


class AuthorResponse(BaseModel):
    id: UUID
    image_url: str | None
    name: str
    bio: str | None
    likes: int


class AuthorsResponse(BaseModel):
    authors: list[AuthorResponse]
