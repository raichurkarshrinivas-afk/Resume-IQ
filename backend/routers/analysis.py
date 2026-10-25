"""
Analysis routes: trigger, get, list, delete.
Supports /api/analysis and /analyze endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.dependencies import get_db, get_current_user
from models.user import User
from models.resume import Resume
from models.analysis import Analysis
from schemas.analysis import AnalysisCreate, AnalysisOut, AnalysisSummary
from services.analyzer import run_analysis

router = APIRouter(prefix="/api/analysis", tags=["analysis"])
alias_router = APIRouter(tags=["analysis"])


@router.post("/", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
@alias_router.post("/analyze", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
@alias_router.post("/api/analyze", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
async def create_analysis(
    body: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger an AI analysis on a resume.
    Accepts either an existing resume_id or direct resume_text.
    Treats all resume text strictly as passive data.
    """
    resume: Resume | None = None

    if body.resume_id is not None:
        # Verify the resume belongs to the current user
        resume = (
            db.query(Resume)
            .filter(Resume.id == body.resume_id, Resume.user_id == current_user.id)
            .first()
        )
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    elif body.resume_text:
        # Create a resume record on the fly for direct text analysis
        resume = Resume(
            user_id=current_user.id,
            filename=body.job_title or "Pasted Resume Text",
            file_type="text",
            raw_text=body.resume_text.strip(),
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either resume_id or resume_text must be provided",
        )

    analysis = await run_analysis(
        db=db,
        resume=resume,
        job_title=body.job_title,
        job_description=body.job_description,
    )

    return AnalysisOut.model_validate(analysis)


@router.get("/", response_model=list[AnalysisSummary])
@router.get("", response_model=list[AnalysisSummary])
@alias_router.get("/analyses", response_model=list[AnalysisSummary])
def list_analyses(
    resume_id: int | None = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List analyses for the current user (optionally filtered by resume)."""
    query = (
        db.query(Analysis)
        .join(Resume)
        .filter(Resume.user_id == current_user.id)
    )
    if resume_id is not None:
        query = query.filter(Analysis.resume_id == resume_id)

    offset = (page - 1) * limit
    analyses = query.order_by(Analysis.created_at.desc()).offset(offset).limit(limit).all()
    return [AnalysisSummary.model_validate(a) for a in analyses]


@router.get("/{analysis_id}", response_model=AnalysisOut)
@alias_router.get("/analyze/{analysis_id}", response_model=AnalysisOut)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single analysis with all scores and details."""
    analysis = (
        db.query(Analysis)
        .join(Resume)
        .filter(Analysis.id == analysis_id, Resume.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return AnalysisOut.model_validate(analysis)


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
@alias_router.delete("/analyze/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an analysis and all generated content."""
    analysis = (
        db.query(Analysis)
        .join(Resume)
        .filter(Analysis.id == analysis_id, Resume.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    db.delete(analysis)
    db.commit()
