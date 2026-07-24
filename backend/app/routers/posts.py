from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import Post
from app.schemas import (
    MeResponse,
    Post as PostSchema,
    PostCreate,
    PostListItem,
    PostPage,
    PostUpdate,
    TagCount,
)
from app.slug import unique_slug

router = APIRouter(prefix="/api", tags=["posts"])


# ---------- Public ----------
@router.get("/posts", response_model=PostPage)
def list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    tag: str | None = None,
    db: Session = Depends(get_db),
) -> PostPage:
    stmt = select(Post).where(Post.published.is_(True))
    if tag:
        stmt = stmt.where(Post.tags.contains([tag]))

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(
        stmt.order_by(Post.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    ).all()
    return PostPage(
        items=[PostListItem.model_validate(p) for p in rows],
        total=total,
        page=page,
        size=size,
    )


@router.get("/tags", response_model=list[TagCount])
def list_tags(db: Session = Depends(get_db)) -> list[TagCount]:
    tag_col = func.unnest(Post.tags).label("name")
    stmt = (
        select(tag_col, func.count().label("count"))
        .where(Post.published.is_(True))
        .group_by(tag_col)
        .order_by(func.count().desc(), tag_col.asc())
    )
    return [TagCount(name=name, count=count) for name, count in db.execute(stmt).all()]


@router.get("/posts/{slug}", response_model=PostSchema)
def get_post(slug: str, db: Session = Depends(get_db)) -> PostSchema:
    post = db.scalar(select(Post).where(Post.slug == slug, Post.published.is_(True)))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return PostSchema.model_validate(post)


# ---------- Admin ----------
@router.get("/admin/posts", response_model=PostPage)
def admin_list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: MeResponse = Depends(get_current_admin),
) -> PostPage:
    total = db.scalar(select(func.count()).select_from(Post)) or 0
    rows = db.scalars(
        select(Post)
        .order_by(Post.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    ).all()
    return PostPage(
        items=[PostListItem.model_validate(p) for p in rows],
        total=total,
        page=page,
        size=size,
    )


@router.post("/admin/posts", response_model=PostSchema, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    db: Session = Depends(get_db),
    _: MeResponse = Depends(get_current_admin),
) -> PostSchema:
    slug = unique_slug(db, payload.title, payload.slug)
    post = Post(
        slug=slug,
        title=payload.title,
        summary=payload.summary,
        content=payload.content,
        tags=payload.tags,
        published=payload.published,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return PostSchema.model_validate(post)


@router.put("/admin/posts/{post_id}", response_model=PostSchema)
def update_post(
    post_id: int,
    payload: PostUpdate,
    db: Session = Depends(get_db),
    _: MeResponse = Depends(get_current_admin),
) -> PostSchema:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    data = payload.model_dump(exclude_unset=True)
    # Handle slug carefully to preserve uniqueness.
    if "slug" in data and data["slug"] and data["slug"] != post.slug:
        post.slug = unique_slug(db, post.title, data.pop("slug"))
    else:
        data.pop("slug", None)

    for key, value in data.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)
    return PostSchema.model_validate(post)


@router.delete("/admin/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    _: MeResponse = Depends(get_current_admin),
) -> Response:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
