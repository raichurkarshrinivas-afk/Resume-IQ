"""
Test script for Phase 1 backend requirements:
1. Auth: User registration, password hashing with bcrypt, JWT token generation & validation
2. File parser validation:
   - Reject files over 5 MB (HTTP 413)
   - Reject non-PDF/DOCX files (HTTP 415)
   - Reject files with < 100 characters extracted text (HTTP 422 with scanned PDF message)
   - Accept valid PDF/DOCX with >= 100 characters
"""

import asyncio
import io
from fastapi import HTTPException, UploadFile
from services.parser import parse_file
from core.security import hash_password, verify_password, create_access_token, decode_access_token
from docx import Document
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams
import pdfplumber

def test_auth():
    print("--- Testing Auth & Security ---")
    password = "SuperSecurePassword123!"
    hashed = hash_password(password)
    assert verify_password(password, hashed), "Password verification failed"
    assert not verify_password("WrongPassword!", hashed), "Password verification false positive"

    token = create_access_token({"sub": "99"})
    payload = decode_access_token(token)
    assert payload is not None, "Failed to decode valid JWT token"
    assert payload.get("sub") == "99", f"Expected sub '99', got {payload.get('sub')}"
    print("[OK] Auth & Security passed successfully!")

async def test_parser_over_5mb():
    print("--- Testing File > 5MB Rejection ---")
    large_content = b"x" * (5 * 1024 * 1024 + 1024)
    file = UploadFile(
        filename="large.pdf",
        file=io.BytesIO(large_content),
        headers={"content-type": "application/pdf"}
    )
    try:
        await parse_file(file)
        assert False, "Should have raised 413 for file > 5 MB"
    except HTTPException as e:
        assert e.status_code == 413, f"Expected 413, got {e.status_code}"
        print(f"[OK] Rejection > 5MB passed: {e.detail}")

async def test_parser_non_pdf_docx():
    print("--- Testing Non-PDF/DOCX Rejection ---")
    file = UploadFile(
        filename="resume.txt",
        file=io.BytesIO(b"Hello world, this is a plain text file."),
        headers={"content-type": "text/plain"}
    )
    try:
        await parse_file(file)
        assert False, "Should have raised 415 for non-PDF/DOCX file"
    except HTTPException as e:
        assert e.status_code == 415, f"Expected 415, got {e.status_code}"
        print(f"[OK] Rejection non-PDF/DOCX passed: {e.detail}")

async def test_parser_under_100_chars_docx():
    print("--- Testing < 100 Characters Rejection (DOCX) ---")
    doc = Document()
    doc.add_paragraph("Short text") # only 10 chars
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)

    file = UploadFile(
        filename="short.docx",
        file=buf,
        headers={"content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    )
    try:
        await parse_file(file)
        assert False, "Should have raised 422 for < 100 characters"
    except HTTPException as e:
        assert e.status_code == 422, f"Expected 422, got {e.status_code}"
        assert "scanned" in e.detail.lower() or "100" in e.detail, f"Expected scanned PDF message, got: {e.detail}"
        print(f"[OK] Rejection < 100 chars passed with friendly message: {e.detail}")

async def test_parser_valid_docx():
    print("--- Testing Valid DOCX (>= 100 characters) ---")
    doc = Document()
    text = (
        "Senior Software Engineer with 8+ years of experience designing, building, and deploying "
        "scalable cloud-native microservices using Python, FastAPI, React, PostgreSQL, and Docker. "
        "Proven track record in leadership, performance optimization, and architectural excellence."
    )
    doc.add_paragraph(text)
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)

    file = UploadFile(
        filename="valid_resume.docx",
        file=buf,
        headers={"content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    )
    raw_text, ftype = await parse_file(file)
    assert ftype == "docx"
    assert len(raw_text.strip()) >= 100
    print(f"[OK] Valid DOCX parsed successfully ({len(raw_text)} chars extracted)!")

async def main():
    test_auth()
    await test_parser_over_5mb()
    await test_parser_non_pdf_docx()
    await test_parser_under_100_chars_docx()
    await test_parser_valid_docx()
    print("\nALL PHASE 1 BACKEND CHECKS PASSED!")

if __name__ == "__main__":
    asyncio.run(main())
