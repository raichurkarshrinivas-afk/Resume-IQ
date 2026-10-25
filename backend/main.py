"""
ResumeIQ — FastAPI Application Entry Point

Configures CORS, rate limiting, and mounts all routers.
Creates database tables on startup.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import get_settings
from database import create_tables
from core.rate_limit import limiter
from routers import auth, resumes, analysis, generate

# Import models so Base.metadata registers all tables
import models  # noqa: F401

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook."""
    create_tables()
    yield


app = FastAPI(
    title="ResumeIQ API",
    description="AI-powered resume analyser and career toolkit",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Rate Limiting ──
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──
app.include_router(auth.router)
app.include_router(auth.alias_router)
app.include_router(resumes.router)
app.include_router(resumes.alias_router)
app.include_router(analysis.router)
app.include_router(analysis.alias_router)
app.include_router(generate.router)
app.include_router(generate.alias_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ResumeIQ"}
