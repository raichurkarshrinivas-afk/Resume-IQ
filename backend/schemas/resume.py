"""
Pydantic schemas for Resume endpoints.
"""

from datetime import datetime
from pydantic import BaseModel, Field


class ResumeOut(BaseModel):
    id: int
    filename: str
    file_type: str
    raw_text: str | None = None
    corrected_text: str | None = None
    parser_metadata: dict | None = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class ResumeUpdate(BaseModel):
    corrected_text: str = Field(min_length=50, description="User-verified/corrected resume text")


class ResumeDetail(ResumeOut):
    raw_text: str
    corrected_text: str | None = None
    parser_metadata: dict | None = None
