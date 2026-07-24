import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import auth, comments, posts
from app.seed import seed_posts

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("zry-blog")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import models so their tables are registered on the metadata.
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_posts(db)
    logger.info(
        "Startup complete. Admin user: %s (from ADMIN_USERNAME/ADMIN_PASSWORD)",
        settings.admin_username,
    )
    yield


app = FastAPI(title="zry-blog API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(comments.router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
