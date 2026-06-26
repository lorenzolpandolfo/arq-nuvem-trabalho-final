from pydantic import BaseModel


class AuthorMetricsResponse(BaseModel):
    posts: int
    likes: int
    has_like: bool
