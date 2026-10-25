"""
Analyzer service — orchestrates resume analysis and database persistence.
"""

from sqlalchemy.orm import Session
from models.resume import Resume
from models.analysis import Analysis
from schemas.analysis import LLMAnalysisResult
from services import llm


async def run_analysis(
    db: Session,
    resume: Resume,
    job_title: str | None = None,
    job_description: str | None = None,
) -> Analysis:
    """
    Run full ATS and career intelligence analysis on a resume:
    1. Call LLM with system prompt + tagged user message
    2. Validate structured output via Pydantic (with 1 retry on invalid JSON)
    3. Save validated record into database
    """
    # Call the LLM with strict prompt injection defenses using verified effective text
    validated_result: LLMAnalysisResult = await llm.analyze_resume(
        resume_text=resume.effective_text,
        job_title=job_title,
        job_description=job_description,
    )

    # Convert suggestions to list of dicts for JSON storage
    suggestions_data = [s.model_dump() for s in validated_result.suggestions]
    full_result_dict = validated_result.model_dump()

    # Build the Analysis record
    analysis = Analysis(
        resume_id=resume.id,
        job_title=job_title,
        job_description=job_description,
        result_json=full_result_dict,
        overall_score=round(float(validated_result.overall_score), 1),
        ats_score=round(float(validated_result.ats_score), 1),
        keyword_score=round(float(validated_result.keyword_score), 1),
        impact_score=round(float(validated_result.impact_score), 1),
        format_score=round(float(validated_result.format_score), 1),
        matched_keywords=validated_result.matched_keywords,
        missing_keywords=validated_result.missing_keywords,
        suggestions=suggestions_data,
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis
