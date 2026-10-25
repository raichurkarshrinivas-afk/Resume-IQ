# ResumeIQ — AI-Powered Resume Intelligence & Career Platform

ResumeIQ is an evidence-backed resume analysis, ATS verification, and career intelligence web platform. It pairs detailed algorithmic document parsing with AI-assisted recommendations and interactive 3D storytelling.

---

## Key Features

- **Interactive 3D WebGL Storytelling**: Built with Three.js featuring physical paper models, real-time laser scanning beams, and exploded 3D architecture views.
- **ATS Analysis & Verification**: Deep parsing of resumes (PDF/DOCX) with scoring across ATS compatibility, keyword matching, quantified impact, and formatting.
- **AI Content Studio**: Generates role-tailored cover letters, executive summaries, and interview preparation guides.
- **Multi-Role Authentication**:
  - **Candidate Accounts**: Private individual workspace for job seekers.
  - **Educator Accounts**: Academic profiling (institution, department, designation) with strict student privacy isolation.
  - **Password Reset Flow**: Secure, single-use expiring token recovery.
- **Comprehensive Account Portal** (`/account` / `/settings`): Profile editing, live saved resume & analysis counts, theme switcher, and permanent account deletion.

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Three.js, Framer Motion, Tailwind CSS, Lucide |
| **Backend** | Python, FastAPI, SQLAlchemy, Uvicorn |
| **Database** | SQLite (`resumeiq.db`) |
| **Auth** | JWT bearer tokens, Argon2/bcrypt hashing |

---

## Local Setup

### 1. Backend
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Interactive docs: `http://127.0.0.1:8000/docs`

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the application at: `http://localhost:5173`
