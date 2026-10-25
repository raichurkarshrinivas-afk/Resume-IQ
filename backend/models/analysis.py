"""
Analysis ORM model.
"""

from datetime import datetime, timezone
from sqlalchemy import Integer, Float, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    resume_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False
    )
    job_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    job_description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Full raw LLM response (backup)
    result_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Extracted scores (0–100) for SQL filtering / sorting
    overall_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    ats_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    keyword_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    impact_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    format_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # Keyword analysis
    matched_keywords: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    missing_keywords: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    # Improvement suggestions: [{priority, category, text}]
    suggestions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    resume = relationship("Resume", back_populates="analyses")
    generated_contents = relationship(
        "GeneratedContent", back_populates="analysis", cascade="all, delete-orphan"
    )
