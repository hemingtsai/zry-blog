from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ---- Auth ----
class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    username: str


# ---- Posts ----
class PostBase(BaseModel):
    title: str
    summary: str = ""
    content: str = ""
    tags: list[str] = Field(default_factory=list)
    published: bool = True


class PostCreate(PostBase):
    slug: str | None = None


class PostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    content: str | None = None
    tags: list[str] | None = None
    published: bool | None = None


class PostListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    summary: str
    tags: list[str]
    published: bool
    created_at: datetime
    updated_at: datetime


class Post(PostListItem):
    content: str


class PostPage(BaseModel):
    items: list[PostListItem]
    total: int
    page: int
    size: int


class TagCount(BaseModel):
    name: str
    count: int


# ---- Comments ----
class CommentCreate(BaseModel):
    author: str
    content: str


class CommentUpdate(BaseModel):
    approved: bool


class Comment(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    author: str
    content: str
    approved: bool
    created_at: datetime
