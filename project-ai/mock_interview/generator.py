"""
generator.py — Mock Interview Question Generator
"""

import json
import uuid
from shared.groq_client import get_groq_client, MODEL_CONFIGS
from shared.retry_handler import call_with_retry, parse_json_response
from job_roles.job_roles import get_role_by_id
from mock_interview.prompt_templates import GENERATE_QUESTIONS_PROMPT

def generate_interview_questions(parsed_resume: dict, role_id: str, interview_type: str) -> dict:
    """
    Generates 5 interview questions based on the candidate's resume, the role, and the interview type.
    
    Parameters:
        parsed_resume: Dictionary containing at least "skills" and "summary" / "experience".
        role_id: The ID of the role (e.g. "ml_engineer").
        interview_type: One of "behavioural", "technical", or "domain-specific".
        
    Returns:
        A dict containing:
        - "status": "success" or "error"
        - "questions": A list of 5 string questions (if success)
        - "error": Description (if error)
    """
    # 1. Fetch role details
    role = get_role_by_id(role_id)
    if not role or "error" in role:
        return {"status": "error", "error": f"Role '{role_id}' not found."}
    
    role_title = role.get("title", role_id)
    
    # 2. Extract Candidate Info
    skills = ", ".join(parsed_resume.get("skills", []))
    if not skills:
        skills = "Not explicitly stated"
        
    experience = parsed_resume.get("experience", "")
    if not experience:
        experience = parsed_resume.get("summary", "Not provided")
        
    # 3. Format Prompt
    prompt = GENERATE_QUESTIONS_PROMPT.format(
        interview_type=interview_type,
        role_title=role_title,
        skills=skills,
        experience=experience[:1500]  # truncate to save context limit just in case
    )
    
    # 3.5 Inject Mathematics Randomness to break LLM Determinism
    # Even at high temperatures, LLMs repeat if inputs are identical. This forces uniqueness.
    random_hash = str(uuid.uuid4())
    prompt += f"\n\n[SYSTEM ENFORCEMENT - RANDOM SEED: {random_hash}]\n"
    prompt += "Do NOT give predictable or standard questions. Pick obscure, highly specific, or creative angles based on the candidate's exact experience to ensure this test is wildly different from average."
    
    # 4. Call LLM
    client = get_groq_client()
    config = MODEL_CONFIGS.get("question_generator", {"model": "llama-3.3-70b-versatile", "temperature": 0.7, "max_tokens": 1024})
    
    response_text = call_with_retry(
        client=client,
        messages=[
            {"role": "system", "content": "You are a professional technical interviewer."},
            {"role": "user", "content": prompt}
        ],
        model=config["model"],
        temperature=config["temperature"],
        max_tokens=config["max_tokens"],
        caller_label=f"InterviewGenerator-{interview_type}"
    )
    
    # 5. Parse Response
    result = parse_json_response(response_text, caller_label=f"InterviewGenerator-{interview_type}")
    
    if not result or "questions" not in result:
        return {"status": "error", "error": "Failed to generate questions. Received invalid format from LLM."}
        
    return {
        "status": "success",
        "questions": result["questions"][:5]  # Ensure exactly 5
    }
