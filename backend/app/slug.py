import re
import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Post


def _base_slugify(title: str) -> str:
    """Create an ASCII slug. For non-ASCII (e.g. Chinese) titles that reduce
    to nothing, fall back to a short random token."""
    value = title.strip().lower()
    # keep ascii alphanumerics, replace everything else with hyphen
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    if not value:
        value = "post-" + secrets.token_hex(4)
    return value


def unique_slug(db: Session, title: str, provided: str | None = None) -> str:
    base = _base_slugify(provided) if provided else _base_slugify(title)
    candidate = base
    i = 2
    while db.scalar(select(Post).where(Post.slug == candidate)) is not None:
        candidate = f"{base}-{i}"
        i += 1
    return candidate
