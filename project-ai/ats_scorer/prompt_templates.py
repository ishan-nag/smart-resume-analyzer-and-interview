"""Prompt templates for ATS scoring via Groq LLM."""


def get_combined_llm_scores_prompt(
    resume_text: str,
    experience_text: str,
    education_text: str,
    job_description: str
) -> str:
    """Returns a single combined prompt for semantic, experience, and education match scoring."""
    return f"""You are an expert ATS (Applicant Tracking System) evaluator and recruiter.

Evaluate the candidate's resume against the job description across three dimensions
and return all three scores in a single JSON response.

FULL RESUME:
{resume_text}

WORK EXPERIENCE:
{experience_text}

EDUCATION:
{education_text}

JOB DESCRIPTION:
{job_description}

Evaluate and score the following three dimensions:

1. semantic_match — How well does the overall resume match the job description?
   Consider: overall relevance, technical stack alignment, role suitability.

2. experience_match — How well does the work experience match the job requirements?
   Consider: years of experience, relevance of past roles, seniority level match.

3. education_match — How well does the education match the job requirements?
   Consider: degree level, field of study relevance, certifications.

Respond ONLY with a valid JSON object. No explanation, no markdown, no extra text.
The JSON must have exactly this structure:
{{
    "semantic_match":   {{"score": <0-100>, "reason": "<one or two sentences>"}},
    "experience_match": {{"score": <0-100>, "reason": "<one or two sentences>"}},
    "education_match":  {{"score": <0-100>, "reason": "<one or two sentences>"}}
}}
"""
