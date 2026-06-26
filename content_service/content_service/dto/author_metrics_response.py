from pydantic import BaseModel


class AuthorMetricsResponse(BaseModel):
    name: str
    bio: str
    image_url: str
    posts: int
    likes: int
    has_like: bool
