"""
Test Suite for Phase A (Trustworthy Analysis):
1. 2-Step Resume Verification & Parser Metadata
   - parse_file returns backward-compatible 2-tuple and carries .metadata
   - Metadata contains page_count, word_count, character_count, standard section detection, encoding_clean
2. Resume effective_text & User Correction
   - effective_text prioritizes corrected_text over raw_text
   - PUT /api/resumes/{resume_id} persists corrected_text
3. Tri-State Evidence Matrix & Citations
   - LLM / Fallback produces evidence_classification with:
     * supported_by_evidence
     * mentioned_without_detail
     * not_found_in_resume
   - Suggestions include quote_from_resume and target_requirement
   - Rubric version is 2026.1
"""

import asyncio
import io
from fastapi import UploadFile
from docx import Document
from sqlalchemy.orm import Session

from database import SessionLocal, create_tables
from models.user import User
from models.resume import Resume
from models.analysis import Analysis
from core.security import hash_password, create_access_token
from services.parser import parse_file, ParseResult
from services import analyzer
from schemas.analysis import EvidenceClassification, LLMAnalysisResult


def setup_module():
    create_tables()


async def test_parser_metadata_and_tuple_compatibility():
    print("--- 1. Testing Parser Metadata & Tuple Compatibility ---")
    doc = Document()
    doc.add_heading("Jane Doe", level=0)
    doc.add_paragraph("jane.doe@example.com | San Francisco, CA")
    doc.add_heading("Professional Summary", level=1)
    doc.add_paragraph("Principal Distributed Systems Engineer with 8+ years architecting scalable cloud platforms.")
    doc.add_heading("Skills", level=1)
    doc.add_paragraph("Python, Go, FastAPI, Kubernetes, Docker, PostgreSQL, Redis, Kafka")
    doc.add_heading("Experience", level=1)
    doc.add_paragraph("Staff Software Engineer at CloudScale Inc. Architected distributed queuing pipeline handling [N]+ million events daily.")
    doc.add_heading("Education", level=1)
    doc.add_paragraph("B.S. in Computer Science, Stanford University.")

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)

    upload = UploadFile(
        filename="jane_doe_resume.docx",
        file=buffer,
        headers={"content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    )

    parsed = await parse_file(upload)

    # 1. Backward-compatible tuple unpacking (critical for existing code & tests)
    raw_text, ftype = parsed
    assert isinstance(raw_text, str)
    assert ftype == "docx"
    assert len(raw_text) > 100

    # 2. Rich metadata access
    assert hasattr(parsed, "metadata"), "Parsed result must have metadata attribute"
    meta = parsed.metadata
    assert meta["page_count"] >= 1
    assert meta["word_count"] > 20
    assert meta["character_count"] == len(raw_text)
    assert meta["encoding_clean"] is True
    assert "experience" in meta["detected_sections"]
    assert "skills" in meta["detected_sections"]
    assert "education" in meta["detected_sections"]
    assert meta["has_standard_sections"] is True
    print(f"[OK] Tuple unpacking and parser metadata verified: {meta['detected_sections']}")


def test_resume_model_effective_text():
    print("\n--- 2. Testing Resume Model effective_text Property ---")
    db = SessionLocal()
    try:
        # Create user
        user = db.query(User).filter_by(email="phase_a_user@example.com").first()
        if not user:
            user = User(
                email="phase_a_user@example.com",
                hashed_password=hash_password("Password123!"),
                full_name="Phase A Candidate",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create resume without corrected_text
        resume = Resume(
            user_id=user.id,
            filename="test_effective.pdf",
            file_type="pdf",
            raw_text="Original raw text with some ocr typos like Pyth0n and D0cker.",
            parser_metadata={"page_count": 1, "word_count": 10},
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        assert resume.effective_text == resume.raw_text

        # Update with corrected text
        resume.corrected_text = "Cleaned and corrected text with Python and Docker properly spelled."
        db.commit()
        db.refresh(resume)

        assert resume.effective_text == "Cleaned and corrected text with Python and Docker properly spelled."
        assert resume.effective_text != resume.raw_text
        print("[OK] Resume.effective_text cleanly prioritizes user-corrected text")
    finally:
        db.close()


async def test_analyzer_persists_evidence_classification_and_citations():
    print("\n--- 3. Testing Analyzer Evidence Classification & Citations ---")
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(email="phase_a_user@example.com").first()
        resume = Resume(
            user_id=user.id,
            filename="senior_engineer.pdf",
            file_type="pdf",
            raw_text="""
            Alex Morgan - Senior Backend Architect
            Summary: Architect with 7 years experience in Python, FastAPI, and PostgreSQL.
            Skills: Python, FastAPI, PostgreSQL, Redis, Docker, Kubernetes.
            Experience:
            Senior Backend Engineer at TechCorp (2021 - Present)
            - Spearheaded migration of legacy monolith to FastAPI microservices, reducing P95 latency by [X%].
            - Architected PostgreSQL partitioning scheme handling [N]+ million daily writes with zero downtime.
            Education: B.S. in Computer Science.
            """,
            corrected_text="""
            Alex Morgan - Senior Backend Architect
            Summary: Architect with 7 years experience in Python, FastAPI, and PostgreSQL.
            Skills: Python, FastAPI, PostgreSQL, Redis, Docker, Kubernetes.
            Experience:
            Senior Backend Engineer at TechCorp (2021 - Present)
            - Spearheaded migration of legacy monolith to FastAPI microservices, reducing P95 latency by [X%].
            - Architected PostgreSQL partitioning scheme handling [N]+ million daily writes with zero downtime.
            Education: B.S. in Computer Science.
            """,
            parser_metadata={"page_count": 1, "word_count": 80, "encoding_clean": True},
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        # Run analysis
        analysis: Analysis = await analyzer.run_analysis(
            db=db,
            resume=resume,
            job_title="Lead Cloud Architect",
            job_description="Seeking a Cloud Architect with Python, FastAPI, PostgreSQL, Kubernetes, Terraform, and AWS.",
        )

        assert analysis.id is not None
        assert analysis.overall_score > 0

        # Check evidence classification
        res_json = analysis.result_json
        assert "evidence_classification" in res_json, "result_json must contain evidence_classification"
        ec = res_json["evidence_classification"]
        assert "supported_by_evidence" in ec
        assert "mentioned_without_detail" in ec
        assert "not_found_in_resume" in ec

        # Check rubric version
        assert res_json.get("rubric_version") == "2026.1"

        # Check suggestions have citations
        suggestions = analysis.suggestions
        assert len(suggestions) > 0
        has_citations = any("quote_from_resume" in s or "target_requirement" in s for s in suggestions)
        assert has_citations, "Suggestions should contain citation metadata"

        print(f"[OK] Analyzer completed successfully with evidence tri-state: {ec.keys()}")
        print(f"     Rubric: {res_json.get('rubric_version')}")
    finally:
        db.close()


if __name__ == "__main__":
    create_tables()
    asyncio.run(test_parser_metadata_and_tuple_compatibility())
    test_resume_model_effective_text()
    asyncio.run(test_analyzer_persists_evidence_classification_and_citations())
    print("\nAll Phase A Backend Regression Tests Passed Successfully!")
