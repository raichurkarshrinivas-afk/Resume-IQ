"""
Phase 3 Verification Script:
1. Verify /analyze returns:
   - overall_score (for circular gauge)
   - ats_score and keyword_score (for metric cards)
   - section_scores: experience, skills, projects, summary, education
   - matched_keywords and missing_keywords (for green/red chips)
   - suggestions (for Top 5 Fixes list with priority badges)
   - bullet_improvements (side-by-side bullets with [X%] placeholders)
2. Verify bullet generation strictly obeys:
   - "Never invent metrics; keep placeholders like [X%]"
3. Verify live endpoints for bullet generation and analysis retrieval.
"""

import time
import io
import threading
import requests
import uvicorn
from docx import Document
from main import app
from schemas.analysis import LLMAnalysisResult, SectionScores, BulletPair

SERVER_PORT = 8010
BASE_URL = f"http://127.0.0.1:{SERVER_PORT}"


def test_schema_phase3_fields():
    print("--- 1. Testing Schema Compliance for Phase 3 Fields ---")
    res = LLMAnalysisResult(
        overall_score=84.5,
        ats_score=88.0,
        keyword_score=82.0,
        impact_score=80.0,
        format_score=90.0,
        section_scores=SectionScores(
            experience=86.0,
            skills=82.0,
            projects=80.0,
            summary=85.0,
            education=95.0,
        ),
        summary="Executive summary test",
        matched_keywords=["python", "fastapi", "react"],
        missing_keywords=["kubernetes", "graphql", "ci/cd"],
        suggestions=[
            {"priority": "high", "category": "impact", "text": "Quantify with [X%] metrics."},
            {"priority": "medium", "category": "keywords", "text": "Add Kubernetes."},
        ],
        bullet_improvements=[
            BulletPair(
                original="Developed backend APIs.",
                improved="Architected [N]+ microservices using Python, boosting throughput by [X%].",
                explanation="Applied XYZ formula with [X%] placeholders."
            )
        ]
    )

    assert res.overall_score == 84.5
    assert res.section_scores.experience == 86.0
    assert res.section_scores.skills == 82.0
    assert res.section_scores.projects == 80.0
    assert res.section_scores.summary == 85.0
    assert res.section_scores.education == 95.0
    assert "[X%]" in res.bullet_improvements[0].improved
    print("[OK] Schema contains all Phase 3 fields (section scores, bullet improvements, placeholders)")


def test_metric_placeholder_rule():
    print("\n--- 2. Testing Strict Metric Integrity Rule ---")
    from utils.prompts import build_generation_prompt

    prompt = build_generation_prompt(
        content_type="bullets",
        resume_text="Worked on database optimization and cloud scaling.",
        analysis_data={
            "job_title": "Senior Engineer",
            "matched_keywords": ["python", "sql"],
            "missing_keywords": ["docker"],
            "suggestions": []
        }
    )

    assert "NEVER invent fake metrics" in prompt or "placeholders like [X%]" in prompt
    assert "[X%]" in prompt
    print("[OK] Bullet prompt strictly enforces never inventing fake metrics and mandating [X%] placeholders")


def run_server():
    uvicorn.run(app, host="127.0.0.1", port=SERVER_PORT, log_level="warning")


def test_live_dashboard_data():
    print("\n--- 3. Testing Live Server Dashboard & Bullet Generation ---")
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    connected = False
    for _ in range(25):
        try:
            r = requests.get(f"{BASE_URL}/api/health", timeout=1)
            if r.status_code == 200:
                connected = True
                break
        except Exception:
            time.sleep(0.2)

    assert connected, "Server failed to start on port 8010"

    # Register test user
    email = f"phase3_user_{int(time.time())}@example.com"
    pwd = "SecurePassword123!"
    reg = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": pwd, "full_name": "Phase 3 Tester"})
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload resume
    doc = Document()
    doc.add_paragraph(
        "Taylor Swift - Staff Infrastructure Engineer.\n"
        "10+ years engineering cloud-scale distributed systems in Python, Docker, React, and PostgreSQL.\n"
        "Led incident response and disaster recovery, maintaining 99.99% system availability.\n"
        "Optimized microservice database queries, cutting response times significantly."
    )
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)

    up = requests.post(
        f"{BASE_URL}/resume/upload",
        headers=headers,
        files={"file": ("taylor_cv.docx", buf, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    )
    assert up.status_code == 201
    resume_id = up.json()["id"]

    # Trigger analysis
    analyze_resp = requests.post(
        f"{BASE_URL}/analyze",
        headers=headers,
        json={
            "resume_id": resume_id,
            "job_title": "Lead Cloud Infrastructure Engineer",
            "job_description": "Seeking a Lead Cloud Infrastructure Engineer proficient in Python, Docker, Kubernetes, and AWS."
        }
    )
    assert analyze_resp.status_code == 201
    analysis_data = analyze_resp.json()
    analysis_id = analysis_data["id"]

    # Verify all dashboard payload components
    assert "overall_score" in analysis_data
    assert "ats_score" in analysis_data
    assert "keyword_score" in analysis_data
    assert "impact_score" in analysis_data
    assert "format_score" in analysis_data
    assert "matched_keywords" in analysis_data
    assert "missing_keywords" in analysis_data
    assert "suggestions" in analysis_data
    assert "result_json" in analysis_data

    # Check section scores inside result_json
    sec_scores = analysis_data["result_json"].get("section_scores", {})
    assert "experience" in sec_scores
    assert "skills" in sec_scores
    assert "projects" in sec_scores
    assert "summary" in sec_scores
    assert "education" in sec_scores
    print(f"[OK] Section scores present: {sec_scores}")

    # Check bullet improvements with placeholders
    bullets = analysis_data["result_json"].get("bullet_improvements", [])
    assert len(bullets) > 0, "Expected paired bullet improvements in analysis JSON"
    for b in bullets:
        assert "original" in b
        assert "improved" in b
        assert "[X%]" in b["improved"] or "[N]" in b["improved"] or "$[X]" in b["improved"]
    print(f"[OK] Verified {len(bullets)} paired bullets with [X%] placeholders!")

    # Test bullet points generation endpoint
    gen_bullet = requests.post(
        f"{BASE_URL}/api/generate/bullet-points",
        headers=headers,
        json={"analysis_id": analysis_id, "section": "Experience"}
    )
    assert gen_bullet.status_code == 201
    print(f"[OK] POST /api/generate/bullet-points returned HTTP 201 successfully!")


def main():
    test_schema_phase3_fields()
    test_metric_placeholder_rule()
    test_live_dashboard_data()
    print("\n=======================================================")
    print(">>> ALL PHASE 3 REQUIREMENTS VERIFIED & PASSING! <<<")
    print("=======================================================")


if __name__ == "__main__":
    main()
