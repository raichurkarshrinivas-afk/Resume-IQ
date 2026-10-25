"""
Pydantic schemas for GeneratedContent, interview scoring, and docx export.
"""

from datetime import datetime
from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    analysis_id: int
    tone: str | None = None  # Formal | Friendly | Confident
    company_name: str | None = None
    target_role: str | None = None
    num_questions: int | None = 10
    section: str | None = None


class GeneratedContentOut(BaseModel):
    id: int
    analysis_id: int
    content_type: str
    content: str
    metadata_json: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DownloadDocxRequest(BaseModel):
    title: str = "Cover Letter"
    text: str


class InterviewScoreRequest(BaseModel):
    question: str
    answer: str
    job_title: str | None = None


class InterviewScoreResponse(BaseModel):
    score: float = Field(ge=0.0, le=10.0)
    feedback: str
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)


class RoadmapToggleRequest(BaseModel):
    item_id: str
    completed: bool
