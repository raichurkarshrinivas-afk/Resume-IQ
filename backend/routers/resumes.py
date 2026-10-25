"""
Resume routes: upload, list, get, delete.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from core.dependencies import get_db, get_current_user
from models.user import User
from models.resume import Resume
from schemas.resume import ResumeOut, ResumeDetail, ResumeUpdate
from services.parser import parse_file

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


@router.post("/upload", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a PDF or DOCX resume, extract its text and layout metadata."""
    parsed = await parse_file(file)
    raw_text = parsed.raw_text if hasattr(parsed, "raw_text") else parsed[0]
    file_type = parsed.file_type if hasattr(parsed, "file_type") else parsed[1]
    parser_metadata = getattr(parsed, "metadata", {})

    resume = Resume(
        user_id=current_user.id,
        filename=file.filename or "untitled",
        file_type=file_type,
        raw_text=raw_text,
        parser_metadata=parser_metadata,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeOut.model_validate(resume)


alias_router = APIRouter(tags=["resumes"])


@alias_router.post("/resume/upload", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
@alias_router.post("/resumes/upload", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
@alias_router.post("/api/resume/upload", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def upload_resume_alias(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await upload_resume(file=file, db=db, current_user=current_user)


@router.put("/{resume_id}", response_model=ResumeOut)
@alias_router.put("/resumes/{resume_id}", response_model=ResumeOut)
@alias_router.put("/api/resume/{resume_id}", response_model=ResumeOut)
@alias_router.put("/resume/{resume_id}", response_model=ResumeOut)
def update_resume_text(
    resume_id: int,
    body: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save user corrections to extracted resume text before analysis."""
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    resume.corrected_text = body.corrected_text.strip()
    db.commit()
    db.refresh(resume)
    return ResumeOut.model_validate(resume)


@router.get("/", response_model=list[ResumeOut])
def list_resumes(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all resumes for the current user (paginated)."""
    offset = (page - 1) * limit
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [ResumeOut.model_validate(r) for r in resumes]


@router.get("/{resume_id}", response_model=ResumeDetail)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single resume with full text."""
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return ResumeDetail.model_validate(resume)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a resume and all related analyses."""
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    db.delete(resume)
    db.commit()
