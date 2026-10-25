"""
Content generator service — produces cover letters, interview prep,
career roadmaps, linkedin assets, and interview answer scoring.
"""

import json
from sqlalchemy.orm import Session
from models.analysis import Analysis
from models.generated_content import GeneratedContent
from schemas.generated_content import InterviewScoreResponse
from services import llm


def _build_fallback_cover_letter(resume_text: str, analysis_data: dict, tone: str = "Formal", company_name: str | None = None) -> str:
    role = analysis_data.get("job_title") or "Software Engineer"
    company = company_name or "your team"
    skills = analysis_data.get("matched_keywords") or ["Python", "distributed systems", "cloud architecture"]
    top_skills_str = ", ".join(skills[:3]) if skills else "software engineering"

    if tone.lower() == "friendly":
        return f"""Dear Hiring Team at {company},

I was excited to come across the {role} opportunity at {company}. Having spent the last several years building scalable software systems and refining my background in {top_skills_str}, I would love to bring my collaborative energy, technical curiosity, and problem-solving skills to your team.

Throughout my career, I have focused on translating business needs into high-performing, resilient applications that users love. In my previous work, I spearheaded microservice implementations, optimized database performance, and streamlined deployment pipelines to support rapid, dependable release cycles. What excites me most about {company} is the opportunity to work alongside passionate colleagues tackling challenging engineering problems where continuous learning, mutual respect, and shared ownership drive outstanding results. I genuinely enjoy collaborating across engineering, product, and design teams to build thoughtful, user-centric solutions that stand the test of time.

Beyond writing clean, well-tested code, I take great pride in supporting teammates through constructive code reviews, empathetic pair programming, and transparent communication. My background in {top_skills_str} aligns directly with what you are looking for, and I am confident that my hands-on experience, proactive mindset, and passion for product excellence will allow me to hit the ground running and make meaningful contributions to your engineering culture from day one.

Thank you very much for taking the time to review my application. I would welcome the opportunity to discuss how my technical skills, collaborative spirit, and enthusiasm can help drive your engineering goals forward. I look forward to connecting with you soon!

Warm regards,
Candidate"""

    elif tone.lower() == "confident":
        return f"""Dear Hiring Leadership at {company},

I am writing to express my strong interest in the {role} role at {company}. With an established and proven track record of technical execution, systems leadership, and delivering high-performance solutions in {top_skills_str}, I am confident in my ability to immediately accelerate your engineering roadmap and drive measurable product impact.

In my recent professional roles, I have architected high-throughput services, dismantled critical architectural bottlenecks, and automated testing pipelines to ensure exceptional production reliability and scalability. My engineering approach couples deep technical rigor in {top_skills_str} with commercial acumen, ensuring that every engineering investment produces tangible gains in system latency, developer velocity, and platform stability. I have repeatedly led initiatives that modernized legacy workflows, established clear architectural standards, and empowered cross-functional partners to execute complex features with clarity and speed.

Joining {company} represents a compelling opportunity to deploy my expertise in mission-critical environments where engineering standards directly fuel business growth. I thrive when tackling ambiguous technical challenges, establishing resilient engineering practices, and delivering high-stakes milestones with precision, accountability, and speed. My background demonstrates that I do not merely write software; I take complete ownership of production outcomes and drive mission-critical technical initiatives to successful completion with measurable business results.

I look forward to discussing how my experience delivering high-impact systems will add immediate strategic value to your engineering team. Thank you for your consideration, and I welcome the opportunity to speak with your leadership team in detail soon.

Sincerely,
Candidate"""

    else:  # Formal / Default
        return f"""Dear Hiring Manager,

Please accept this letter and the enclosed resume as my formal application for the {role} position currently available with {company}. Having developed significant engineering expertise in {top_skills_str}, I offer a solid background in designing, deploying, and maintaining high-quality software solutions that align with rigorous technical standards.

Throughout my professional career, I have maintained a steadfast commitment to architectural integrity and resilient software design. My background includes architecting distributed backend services, implementing automated testing protocols, and collaborating cross-functionally to achieve strategic project deliverables on schedule. I have consistently demonstrated the capacity to analyze complex operational requirements and translate them into maintainable, well-documented production systems. Furthermore, my hands-on experience with modern engineering workflows and continuous delivery pipelines ensures that code quality, security, and reliability remain at the forefront of every release.

The reputation of {company} for engineering excellence makes this an exceptional opportunity for my background. I am eager to apply my technical foundation in {top_skills_str} to contribute effectively to your ongoing operational objectives, system reliability goals, and team initiatives. In prior engineering roles, I prioritized writing scalable code, fostering cross-team technical alignment, and delivering measurable milestones with precision and accountability.

Thank you for your time, consideration, and review of my application materials. I welcome the opportunity to discuss my qualifications in greater detail during an interview and explore how my engineering background can support your organizational vision. I look forward to hearing from you regarding next steps.

Respectfully submitted,
Candidate"""


def _build_fallback_interview_questions(analysis_data: dict) -> list[dict]:
    missing = analysis_data.get("missing_keywords") or ["Kubernetes", "Redis"]
    missing_skill_1 = missing[0] if len(missing) > 0 else "System Architecture"
    missing_skill_2 = missing[1] if len(missing) > 1 else "Performance Tuning"

    return [
        {
            "id": 1,
            "category": "Technical",
            "question": "How do you design and structure a high-throughput microservices architecture to prevent cascading failures?",
            "why_asked": "Assesses foundational distributed systems knowledge, circuit breaker patterns, and failure domain isolation.",
            "star_outline": {
                "situation": "Describe a production service that experienced traffic spikes or inter-service latency bottlenecks.",
                "task": "Explain your responsibility in defining fault tolerance, timeouts, and fallback mechanisms.",
                "action": "Highlight your implementation of retry policies with exponential backoff and circuit breakers.",
                "result": "Quantify improved system availability and reduced incident escalation frequency."
            }
        },
        {
            "id": 2,
            "category": "Technical",
            "question": "Can you walk through your approach to database query optimization and caching strategies under heavy read loads?",
            "why_asked": "Tests indexing knowledge, query execution plan inspection (EXPLAIN ANALYZE), and cache invalidation strategies.",
            "star_outline": {
                "situation": "Discuss a slow endpoint or relational query that degraded application performance.",
                "task": "Identify the primary query bottleneck (e.g. table scans, missing composite indexes, N+1 queries).",
                "action": "Describe how you optimized the schema, introduced indexes, or placed a Redis caching layer in front.",
                "result": "Detail the drop in P95 query execution time from seconds to milliseconds."
            }
        },
        {
            "id": 3,
            "category": "Technical",
            "question": "How do you ensure data consistency across multiple independent services without distributed transactions?",
            "why_asked": "Evaluates understanding of eventual consistency, Saga patterns, and idempotent consumer design.",
            "star_outline": {
                "situation": "Recall a workflow where an operation crossed two or more distinct microservice data stores.",
                "task": "Explain the necessity of avoiding brittle two-phase commits while maintaining auditability.",
                "action": "Explain your use of transactional outbox, asynchronous event streams, or compensating transactions.",
                "result": "Emphasize zero data loss and resilient reconciliation under transient network partitions."
            }
        },
        {
            "id": 4,
            "category": "Technical",
            "question": "Describe your strategy for automated testing and CI/CD validation before promoting code to production.",
            "why_asked": "Checks adherence to automated test pyramids (unit, integration, e2e) and continuous deployment hygiene.",
            "star_outline": {
                "situation": "A legacy deployment process caused frequent regressions or slow release turnaround.",
                "task": "Establish a reliable automated pipeline that verifies code quality and safety quickly.",
                "action": "Detail how you configured GitHub Actions or GitLab pipelines with parallel test runners and linting.",
                "result": "Highlight faster build times, zero deployment rollback rates, and developer velocity improvements."
            }
        },
        {
            "id": 5,
            "category": "Technical",
            "question": "How do you handle API versioning and backward compatibility when introducing breaking schema changes?",
            "why_asked": "Checks long-term maintenance mindset and consideration for public or multi-team consumers.",
            "star_outline": {
                "situation": "A core entity needed significant restructuring while supporting active clients.",
                "task": "Upgrade the schema and API contract without interrupting existing integrated consumers.",
                "action": "Describe your deprecation strategy, URI/header versioning, or dual-writing patterns.",
                "result": "Smooth transition with zero client downtime or unexpected contract breakage."
            }
        },
        {
            "id": 6,
            "category": "Behavioral",
            "question": "Tell me about a time you had a strong technical disagreement with a senior teammate. How did you resolve it?",
            "why_asked": "Probes professional maturity, empathy, reliance on objective data, and disagree-and-commit capability.",
            "star_outline": {
                "situation": "Set the context of the technical debate (e.g. database choice, framework selection, or design approach).",
                "task": "Reach an alignment that serves the product best without stalling development progress.",
                "action": "Describe how you prototyped benchmarks, evaluated trade-offs collaboratively, and listened to concerns.",
                "result": "The team aligned around the evidence-backed solution, strengthening inter-team trust."
            }
        },
        {
            "id": 7,
            "category": "Behavioral",
            "question": "Describe a situation where a project scope expanded drastically close to a deadline. How did you handle it?",
            "why_asked": "Assesses prioritization, stakeholder management, pragmatic trade-offs, and composure under pressure.",
            "star_outline": {
                "situation": "A critical deadline was approaching when unexpected edge cases or requirements arose.",
                "task": "Protect core product quality and team stability while communicating realistic deliverables.",
                "action": "Detail how you triaged features into MVP vs post-launch phases with product managers.",
                "result": "On-time delivery of core functionality with high customer satisfaction and minimal technical debt."
            }
        },
        {
            "id": 8,
            "category": "Behavioral",
            "question": "Give an example of a mistake you made in production code. How did you diagnose it and what did you learn?",
            "why_asked": "Tests psychological safety, transparency, root-cause blameless post-mortem analysis, and systemic correction.",
            "star_outline": {
                "situation": "A deployment or configuration change triggered an unexpected alert or service degradation.",
                "task": "Quickly stabilize the production environment and inform affected stakeholders transparently.",
                "action": "Walk through immediate rollback/mitigation, root cause analysis, and post-mortem safeguards.",
                "result": "Implemented an automated test or lint check that permanently eliminated that failure class."
            }
        },
        {
            "id": 9,
            "category": "Weak spot",
            "question": f"Your resume highlights strong engineering experience, but shows limited background in {missing_skill_1}. How would you ramp up quickly?",
            "why_asked": f"Directly tests intellectual agility and self-directed learning in missing competency: {missing_skill_1}.",
            "star_outline": {
                "situation": "Acknowledge the gap honestly and relate it to a prior time you had to learn an unfamiliar technology rapidly.",
                "task": "Demonstrate a structured learning methodology (docs, proof of concepts, architecture patterns).",
                "action": "Explain your approach to studying reference implementations and building hands-on sandbox labs.",
                "result": "Show that within a few weeks you became proficient and contributed production-grade code."
            }
        },
        {
            "id": 10,
            "category": "Weak spot",
            "question": f"How would you apply {missing_skill_2} principles to scale an existing production application?",
            "why_asked": f"Probes candidate's ability to reason about and apply missing skill ({missing_skill_2}) in a practical scenario.",
            "star_outline": {
                "situation": "Frame an architecture scenario where {missing_skill_2} solves a clear operational bottleneck.",
                "task": "Define key architectural criteria (e.g. latency, availability, observability).",
                "action": "Propose an incremental migration plan rather than an unmanageable big-bang rewrite.",
                "result": "Illustrate clear performance and maintainability metrics you would track to measure success."
            }
        }
    ]


def _build_fallback_roadmap(analysis_data: dict) -> list[dict]:
    missing = analysis_data.get("missing_keywords") or ["Kubernetes", "Redis", "GraphQL", "CI/CD", "AWS Lambda"]
    skills = missing + ["System Architecture", "Performance Profiling", "Security Auditing"]

    return [
        {
            "id": "item-1",
            "phase": "Day 1 - 30",
            "skill": skills[0],
            "why_it_matters": "Top requirement on 80%+ of target job descriptions for this seniority level.",
            "mini_project": f"Build a multi-container prototype integrating {skills[0]} with automated local health checks and integration tests.",
            "completed": False,
        },
        {
            "id": "item-2",
            "phase": "Day 1 - 30",
            "skill": skills[1] if len(skills) > 1 else "Modern API Protocols",
            "why_it_matters": "Critical for reducing round-trip latency and handling peak traffic gracefully.",
            "mini_project": f"Implement a benchmark comparison script testing throughput before and after adding {skills[1] if len(skills) > 1 else 'caching'}.",
            "completed": False,
        },
        {
            "id": "item-3",
            "phase": "Day 31 - 60",
            "skill": skills[2] if len(skills) > 2 else "Cloud Orchestration",
            "why_it_matters": "Enables zero-downtime rolling updates and automated horizontal pod autoscaling.",
            "mini_project": f"Configure infrastructure-as-code manifests with Helm or Terraform deploying a sample microservice.",
            "completed": False,
        },
        {
            "id": "item-4",
            "phase": "Day 31 - 60",
            "skill": skills[3] if len(skills) > 3 else "Observability & Tracing",
            "why_it_matters": "Required to debug distributed transaction latency across microservice boundaries.",
            "mini_project": "Instrument OpenTelemetry distributed tracing and export metrics to Prometheus and Grafana dashboards.",
            "completed": False,
        },
        {
            "id": "item-5",
            "phase": "Day 61 - 90",
            "skill": skills[4] if len(skills) > 4 else "Enterprise Production Capstone",
            "why_it_matters": "Demonstrates full-cycle architectural mastery to hiring managers during portfolio reviews.",
            "mini_project": "Publish an end-to-end open-source capstone repository featuring CI/CD pipelines, container orchestration, and benchmark metrics.",
            "completed": False,
        },
    ]


def _build_fallback_linkedin(analysis_data: dict) -> dict:
    role = analysis_data.get("job_title") or "Software Engineer"
    skills = analysis_data.get("matched_keywords") or ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "AWS", "REST APIs", "Microservices"]

    return {
        "headlines": [
            f"Senior {role} | Cloud-Native Systems, High-Throughput APIs & Distributed Architecture",
            f"{role} specializing in Scalable Microservices & Performance Optimization | Scaled Systems to [N]M Users",
            f"Lead {role} | Building Resilient Distributed Systems with Python, Docker & Modern Cloud Stacks"
        ],
        "about": f"""Passionate and results-driven {role} with a proven track record of designing, building, and deploying scalable distributed systems. 

Throughout my career, I have specialized in transforming complex business requirements into high-throughput, fault-tolerant microservices. My core expertise spans {', '.join(skills[:5])}, with a relentless focus on clean code, test-driven development, and measurable production impact.

Key Career Highlights:
• Architected and scaled distributed backend services handling [N]+ million requests with [99.9X%] uptime.
• Refactored legacy monolithic services into modern containerized architectures, slashing deployment cycles by [X%].
• Mentored cross-functional engineering teams, fostering strong engineering practices, thorough code reviews, and automated CI/CD pipelines.

I am always keen to connect with fellow engineers, tech leaders, and innovators who are passionate about building the next generation of cloud-native platforms. Let's connect!""",
        "skills": [
            "Software Architecture", "Python", "REST APIs", "Microservices",
            "Docker", "Cloud Computing", "PostgreSQL", "Distributed Systems",
            "CI/CD Pipelines", "System Design", "Database Optimization",
            "Git & Version Control", "Agile & Scrum", "Automated Testing", "Code Review"
        ],
        "checklist": [
            "High-resolution professional headshot with friendly lighting",
            "Custom LinkedIn public URL (linkedin.com/in/yourname)",
            "Compelling headline matching target role",
            "Metric-driven About summary with strong opening hook",
            "Top 15 searchable technical and leadership skills added",
            "Featured section linking to notable projects or portfolio",
            "At least 2 recommendations from colleagues or managers"
        ]
    }


def score_candidate_answer(question: str, answer: str, job_title: str | None = None) -> InterviewScoreResponse:
    """Evaluate candidate interview answer out of 10 with short feedback."""
    text = answer.strip()
    words = text.split()
    word_count = len(words)

    # Basic criteria evaluation
    has_situation = any(w in text.lower() for w in ["when", "at", "project", "while", "during", "time", "scenario"])
    has_action = any(w in text.lower() for w in ["i", "developed", "built", "implemented", "designed", "created", "led", "refactored"])
    has_metrics = any(char.isdigit() for char in text) or any(w in text.lower() for w in ["percent", "%", "reduced", "increased", "improved", "saved", "ms", "users"])
    has_technical_terms = any(w in text.lower() for w in ["api", "database", "service", "system", "architecture", "query", "docker", "pipeline", "code"])

    base_score = 5.0

    if word_count < 30:
        return InterviewScoreResponse(
            score=4.5,
            feedback="Answer is too brief. Elaborate using the STAR method (Situation, Task, Action, Result) with specific technical actions.",
            strengths=["Addresses the question directly."],
            improvements=["Add more context on what you specifically accomplished.", "Include measurable results or metric placeholders like [X%]."]
        )

    if has_situation:
        base_score += 1.2
    if has_action:
        base_score += 1.3
    if has_metrics:
        base_score += 1.2
    if has_technical_terms:
        base_score += 1.3

    score = min(9.6, max(5.0, round(base_score, 1)))

    if score >= 8.5:
        feedback = "Outstanding response! Strong STAR structure with clear ownership, technical depth, and quantified outcomes."
        strengths = ["Strong action verbs detailing your personal contribution.", "Clear, measurable result communicated."]
        improvements = ["Keep practicing smooth, concise delivery under 2 minutes."]
    elif score >= 7.0:
        feedback = "Solid answer! Good technical clarity. To reach a 10/10, emphasize quantifiable business metrics and business trade-offs."
        strengths = ["Clear explanation of technical actions taken."]
        improvements = ["Explicitly highlight the measurable outcome (e.g. latency reduction, cost savings, user impact)."]
    else:
        feedback = "Good foundation, but lacks concrete metrics and structured STAR progression. Detail your personal contribution."
        strengths = ["Good conversational tone."]
        improvements = ["Structure into Situation, Task, Action, and Result.", "Avoid 'we' where possible—focus on what 'I' specifically engineered."]

    return InterviewScoreResponse(
        score=score,
        feedback=feedback,
        strengths=strengths,
        improvements=improvements,
    )


async def generate(
    db: Session,
    analysis: Analysis,
    content_type: str,
    **kwargs,
) -> GeneratedContent:
    """Generate content based on an existing analysis and persist to database."""
    resume_text = analysis.resume.raw_text

    analysis_data = {
        "job_title": analysis.job_title,
        "job_description": analysis.job_description,
        "overall_score": analysis.overall_score,
        "matched_keywords": analysis.matched_keywords,
        "missing_keywords": analysis.missing_keywords,
        "suggestions": analysis.suggestions,
    }

    # Call LLM or generate structured fallback
    content = ""
    metadata_json = {
        "tone": kwargs.get("tone"),
        "company_name": kwargs.get("company_name"),
        "target_role": kwargs.get("target_role"),
        "num_questions": kwargs.get("num_questions"),
        "section": kwargs.get("section"),
    }

    try:
        content = await llm.generate_content(
            content_type=content_type,
            resume_text=resume_text,
            analysis_data=analysis_data,
            **kwargs,
        )
    except Exception:
        content = ""

    # If LLM didn't return content or returned generic placeholder, use rich templates
    if not content or content.startswith("Draft for") or len(content.strip()) < 50:
        if content_type == "cover_letter":
            content = _build_fallback_cover_letter(
                resume_text=resume_text,
                analysis_data=analysis_data,
                tone=kwargs.get("tone", "Formal"),
                company_name=kwargs.get("company_name"),
            )
        elif content_type == "interview":
            content = json.dumps(_build_fallback_interview_questions(analysis_data), indent=2)
        elif content_type == "roadmap":
            content = json.dumps(_build_fallback_roadmap(analysis_data), indent=2)
        elif content_type == "linkedin":
            content = json.dumps(_build_fallback_linkedin(analysis_data), indent=2)

    # Save to database
    generated = GeneratedContent(
        analysis_id=analysis.id,
        content_type=content_type,
        content=content,
        metadata_json=metadata_json,
    )

    db.add(generated)
    db.commit()
    db.refresh(generated)

    return generated
