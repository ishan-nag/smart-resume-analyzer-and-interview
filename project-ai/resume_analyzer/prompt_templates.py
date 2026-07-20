"""Prompt templates for combined resume analysis and upgrade tip generation."""


def get_combined_analysis_prompt(
    parsed_resume: dict,
    job_description: str,
    role_title: str,
    required_skills: list,
    nice_to_have_skills: list
) -> str:
    """Returns a single combined prompt for ATS scoring, quality score, and section feedback."""
    raw_text   = parsed_resume.get("raw_text", "")
    experience = parsed_resume.get("experience", "")
    education  = parsed_resume.get("education", "")
    summary    = parsed_resume.get("summary", "")
    skills     = parsed_resume.get("skills", [])

    if not experience.strip():
        experience = raw_text
    if not education.strip():
        education = raw_text

    return f"""You are an expert resume evaluator and career coach.

Evaluate the candidate's resume for the role of "{role_title}".

---
FULL RESUME:
{raw_text}

WORK EXPERIENCE SECTION:
{experience}

EDUCATION SECTION:
{education}

SUMMARY SECTION:
{summary}

CANDIDATE SKILLS:
{", ".join(skills)}

JOB DESCRIPTION:
{job_description}

REQUIRED SKILLS FOR THIS ROLE:
{", ".join(required_skills)}

NICE TO HAVE SKILLS FOR THIS ROLE:
{", ".join(nice_to_have_skills)}
---

Evaluate the resume across the following three sections.
Respond ONLY with a valid JSON object. No explanation, no markdown, no extra text.

SECTION 1 — ATS SCORING:
Score how well this resume matches the job description.
Evaluate semantic match (overall fit), experience match (work history relevance),
and education match (degree and qualification fit). Do NOT include keyword_match here.

SECTION 2 — QUALITY SCORE:
Score the overall resume quality regardless of the role.
Evaluate: format (structure and layout), clarity (readability),
impact (strength of achievements), brevity (conciseness).
Each sub-score is 0-100. Overall is the average of the four.

SECTION 3 — SECTION FEEDBACK:
Give specific feedback for each of these four resume sections:
experience, education, summary, skills.
For each section provide: a score (0-100), one or two sentence feedback,
and a list of 0-3 concrete improvement suggestions.
If a section is strong, improvements can be an empty list.

The JSON must have exactly this structure:
{{
    "ats": {{
        "overall_score":  <0-100 float>,
        "recommendation": "<Excellent Match|Good Match|Moderate Match|Weak Match|Poor Match>",
        "breakdown": {{
            "semantic_match":   {{"score": <0-100>, "feedback": "<one or two sentences>"}},
            "experience_match": {{"score": <0-100>, "feedback": "<one or two sentences>"}},
            "education_match":  {{"score": <0-100>, "feedback": "<one or two sentences>"}}
        }}
    }},
    "quality_score": {{
        "overall": <0-100 int>,
        "breakdown": {{
            "format":  <0-100>,
            "clarity": <0-100>,
            "impact":  <0-100>,
            "brevity": <0-100>
        }}
    }},
    "section_feedback": {{
        "experience": {{
            "score":        <0-100>,
            "feedback":     "<one or two sentences>",
            "improvements": ["<suggestion 1>", "<suggestion 2>"]
        }},
        "education": {{
            "score":        <0-100>,
            "feedback":     "<one or two sentences>",
            "improvements": ["<suggestion 1>"]
        }},
        "summary": {{
            "score":        <0-100>,
            "feedback":     "<one or two sentences>",
            "improvements": ["<suggestion 1>", "<suggestion 2>"]
        }},
        "skills": {{
            "score":        <0-100>,
            "feedback":     "<one or two sentences>",
            "improvements": ["<suggestion 1>"]
        }}
    }}
}}
"""


def get_upgrade_tip_prompt(
    parsed_resume: dict,
    all_role_results: list
) -> str:
    """Returns a prompt for generating a consolidated resume upgrade tip from all role results."""
    candidate_name    = parsed_resume.get("name", "The candidate")
    candidate_skills  = parsed_resume.get("skills", [])
    candidate_summary = parsed_resume.get("summary", "")

    role_summaries = []
    for result in all_role_results:
        if "error" in result:
            continue

        role_title  = result.get("role", {}).get("title", "Unknown Role")
        ats_score   = result.get("ats", {}).get("overall_score", 0)
        missing     = result.get("skills_gap", {}).get("missing", [])
        nth_missing = result.get("skills_gap", {}).get("nice_to_have_missing", [])
        quality     = result.get("quality_score", {}).get("overall", 0)

        role_summaries.append(
            f"- {role_title}: ATS Score={ats_score}/100, Quality={quality}/100, "
            f"Missing Skills={missing}, Nice-to-Have Missing={ nth_missing}"
        )

    role_summary_text = "\n".join(role_summaries) if role_summaries else "No role results available."

    return f"""You are an expert career coach and resume consultant.

A candidate has analyzed their resume against multiple job roles.
Based on the results below, write a single concise upgrade tip paragraph
that will help them improve their resume the most across all roles.

CANDIDATE NAME: {candidate_name}
CANDIDATE SKILLS: {", ".join(candidate_skills)}
CANDIDATE SUMMARY: {candidate_summary}

ROLE ANALYSIS RESULTS:
{role_summary_text}

Write ONE paragraph (3-5 sentences) that:
    - Identifies the most common or impactful gap across all roles
    - Gives specific, actionable advice the candidate can act on immediately
    - Mentions specific skills, sections, or resume improvements by name
    - Is encouraging and professional in tone
    - Does NOT repeat generic advice like "tailor your resume"

Respond ONLY with a valid JSON object. No explanation, no markdown, no extra text.
The JSON must have exactly this structure:
{{
    "upgrade_tip": "<your 3-5 sentence upgrade tip paragraph here>"
}}
"""
