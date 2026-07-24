from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import Comment, Post
from app.schemas import (
    Comment as CommentSchema,
    CommentCreate,
    CommentUpdate,
    MeResponse,
)

router = APIRouter(prefix="/api", tags=["comments"])


def _get_post_by_slug(db: Session, slug: str) -> Post:
    post = db.scalar(select(Post).where(Post.slug == slug))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


# ---------- Public ----------
@router.get("/posts/{slug}/comments", response_model=list[CommentSchema])
def list_comments(slug: str, db: Session = Depends(get_db)) -> list[CommentSchema]:
    post = _get_post_by_slug(db, slug)
    rows = db.scalars(
        select(Comment)
        .where(Comment.post_id == post.id, Comment.approved.is_(True))
        .order_by(Comment.created_at.asc())
    ).all()
    return [CommentSchema.model_validate(c) for c in rows]


@router.post(
    "/posts/{slug}/comments",
    response_model=CommentSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    slug: str, payload: CommentCreate, db: Session = Depends(get_db)
) -> CommentSchema:
    post = _get_post_by_slug(db, slug)
    comment = Comment(
        post_id=post.id,
        author=payload.author,
        content=payload.content,
        approved=False,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentSchema.model_validate(comment)


# ---------- Admin ----------
@router.get("/admin/comments", response_model=list[CommentSchema])
def admin_list_comments(
    approved: bool | None = None,
    db: Session = Depends(get_db),
    _: MeResponse = Depends(get_current_admin),
) -> list[CommentSchema]:
    stmt = select(Comment)
    if approved is not None:
        stmt = stmt.where(Comment.approved.is_(approved))
    rows = db.scalars(stmt.order_by(Comment.created_at.desc())).all()
    return [CommentSchema.model_validate(c) for c in rows]


@router.put("/admin/comments/{comment_id}", response_model=CommentSchema)
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    db: Session = Depends(get_db),
    _: MeResponse = Depends(get_current_admin),
) -> CommentSchema:
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment.approved = payload.approved
    db.commit()
    db.refresh(comment)
    return CommentSchema.model_validate(comment)


@router.delete(
    "/admin/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    _: MeResponse = Depends(get_current_admin),
) -> Response:
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
