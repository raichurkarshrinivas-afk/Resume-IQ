"""
Centralised LLM prompt templates for ResumeIQ.
Covers analysis, cover letters, interview questions, roadmaps, linkedin, and bullets.
"""


def build_analysis_prompt(resume_text: str, job_description: str | None = None) -> str:
    """Build the resume analysis prompt for the LLM."""

    jd_section = ""
    if job_description:
        jd_section = f"""

## Target Job Description
{job_description}

Compare the resume against this job description. Identify matched and missing keywords.
"""

    return f"""You are an expert resume analyst and ATS (Applicant Tracking System) specialist.

Analyse the following resume and provide a detailed evaluation.

## Resume Text
{resume_text}
{jd_section}

## Instructions
Evaluate the resume on these criteria (score each 0-100):
1. **ats_score**: How well will this resume pass through Applicant Tracking Systems?
2. **keyword_score**: How well does the resume use relevant industry keywords and skills?
3. **impact_score**: How effectively does the resume quantify achievements with action verbs?
4. **format_score**: Layout, consistency, length, and professional presentation.
5. **section_scores**: experience, skills, projects, summary, education.
6. **overall_score**: Weighted composite score.

CRITICAL RULE FOR BULLETS:
Never invent fake metrics, statistics, or arbitrary percentages. Always keep placeholders like [X%], [N], or $[X].

Output strictly valid JSON conforming to the requested schema. No markdown fences.
"""


def build_generation_prompt(
    content_type: str,
    resume_text: str,
    analysis_data: dict,
    **kwargs,
) -> str:
    """Build a generation prompt for the requested content type."""

    context = f"""## Resume
{resume_text}

## Analysis Context
- Target Role: {analysis_data.get('job_title', 'Not specified')}
- Overall Score: {analysis_data.get('overall_score', 'N/A')}/100
- Key Strengths (matched keywords): {', '.join(analysis_data.get('matched_keywords', []))}
- Gaps (missing keywords): {', '.join(analysis_data.get('missing_keywords', []))}
"""

    if content_type == "cover_letter":
        tone = kwargs.get("tone", "Formal")  # Formal | Friendly | Confident
        company = kwargs.get("company_name", "the hiring team")
        return f"""You are an executive cover letter writer. Write a tailored, persuasive cover letter.

{context}

## Instructions:
- Tone: {tone} (Formal = dignified & polished; Friendly = warm, collaborative & authentic; Confident = high-impact, visionary & bold)
- Company: {company}
- Target length: STRICTLY 250 to 300 words.
- FACTUAL INTEGRITY RULE: Use ONLY verified facts, credentials, roles, and achievements present in the resume. DO NOT invent employers, degrees, awards, or fictional metrics.
- Structure:
  - Professional Salutation (e.g. Dear Hiring Team / Dear {company} Leadership)
  - Opening paragraph: Targeted enthusiasm & immediate value proposition
  - Body paragraph: 2-3 concrete achievements matching target requirements
  - Closing paragraph: Forward-looking call to action & professional sign-off

Output ONLY the clean text of the cover letter ready for copy/download."""

    elif content_type == "interview":
        missing_kw = analysis_data.get("missing_keywords", [])
        return f"""You are a Principal Technical Recruiter and Hiring Bar Raiser.
Prepare 10 structured interview questions based on the candidate's resume and target role.

{context}

## Instructions:
You must provide EXACTLY 10 questions distributed as:
- 5 Technical questions (deep architecture, core technologies, debugging, system trade-offs)
- 3 Behavioral questions (cross-functional leadership, ambiguity, ownership)
- 2 Weak-spot questions (directly targeting identified resume gaps / missing keywords: {', '.join(missing_kw[:4])})

Output valid JSON matching this schema:
[
  {{
    "id": 1,
    "category": "Technical",
    "question": "...",
    "why_asked": "...",
    "star_outline": {{
      "situation": "...",
      "task": "...",
      "action": "...",
      "result": "..."
    }}
  }},
  ...
]"""

    elif content_type == "roadmap":
        missing_kw = analysis_data.get("missing_keywords", ["Kubernetes", "System Architecture", "Redis"])
        return f"""You are a Staff Engineering Career Architect.
Create a structured 30/60/90-day learning roadmap addressing the candidate's missing keywords: {', '.join(missing_kw)}.

{context}

## Instructions:
Divide the timeline into 3 phases:
- Day 1 - 30: Foundational Gaps
- Day 31 - 60: System Architecture & Integration
- Day 61 - 90: Production Scale & Capstone

Output valid JSON matching this schema:
[
  {{
    "id": "item-1",
    "phase": "Day 1 - 30",
    "skill": "...",
    "why_it_matters": "...",
    "mini_project": "...",
    "completed": false
  }},
  ...
]"""

    elif content_type == "linkedin":
        return f"""You are a LinkedIn Talent Optimization Executive.
Generate complete LinkedIn branding assets for this candidate.

{context}

## Instructions:
Provide:
1. 3 tailored Headline options:
   - Option 1: Role & Core Stack
   - Option 2: Metrics & High Impact
   - Option 3: Industry Leadership & Value Proposition
2. An "About" Summary: Under 2,000 characters with hook, quantifiable accomplishments, and contact CTA.
3. 15 skills to add to LinkedIn profile for maximum recruiter search visibility.
4. Profile-strength checklist items.

Output valid JSON matching this schema:
{{
  "headlines": [
    "...",
    "...",
    "..."
  ],
  "about": "...",
  "skills": ["...", "... (15 total)"],
  "checklist": [
    "High-resolution professional headshot with friendly lighting",
    "Custom LinkedIn public URL (linkedin.com/in/yourname)",
    "Compelling headline matching target role",
    "Metric-driven About summary with strong opening hook",
    "Top 15 searchable technical and leadership skills added",
    "Featured section linking to notable projects or portfolio",
    "At least 2 recommendations from colleagues or managers"
  ]
}}"""

    elif content_type == "bullets":
        section = kwargs.get("section", "all experience sections")
        return f"""You are an elite resume writing expert. Improve the candidate's bullet points for maximum ATS and hiring manager impact.

{context}

## Instructions:
- Focus on: {section}
- Rewrite bullet points using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]"
- CRITICAL METRIC INTEGRITY RULE: NEVER invent fake metrics, arbitrary numbers, or fictional percentages. Always keep placeholders like [X%], [N], $[X], or [timeframe] so the user can insert their actual verified figures.
- Use strong, non-repetitive action verbs.
- Ensure each bullet demonstrates business impact, not merely job duties.
- Keep bullets concise (1-2 lines each).

Format each item clearly:
Original: <original bullet>
Improved: <improved bullet with [X%] placeholders>
Why: <brief 1-sentence explanation of changes made>"""

    else:
        return f"""You are a helpful career assistant.

{context}

Please provide helpful career advice and content based on the resume and analysis above."""
