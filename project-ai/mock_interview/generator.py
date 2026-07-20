"""Generates mock interview questions using Groq LLM based on resume and role."""

import json
import uuid
from shared.groq_client import get_groq_client, MODEL_CONFIGS
from shared.retry_handler import call_with_retry, parse_json_response
from job_roles.job_roles import get_role_by_id
from mock_interview.prompt_templates import GENERATE_QUESTIONS_PROMPT

def generate_interview_questions(parsed_resume: dict, role_id: str, interview_type: str) -> dict:
    """Generates 5 interview questions based on resume, role, and interview type."""
    role = get_role_by_id(role_id)
    if not role or "error" in role:
        return {"status": "error", "error": f"Role '{role_id}' not found."}
    
    role_title = role.get("title", role_id)
    role_description = role.get("description", "Not provided")
    role_required_skills = ", ".join(role.get("required_skills", []))
    if not role_required_skills:
        role_required_skills = "Not specified"
    
    skills = ", ".join(parsed_resume.get("skills", []))
    if not skills:
        skills = "Not explicitly stated"
        
    experience = parsed_resume.get("experience", "")
    if not experience:
        experience = parsed_resume.get("summary", "Not provided")
        
    prompt = GENERATE_QUESTIONS_PROMPT.format(
        interview_type=interview_type,
        role_title=role_title,
        role_description=role_description[:1000],
        role_required_skills=role_required_skills,
        skills=skills,
        experience=experience[:1500]
    )
    
    random_hash = str(uuid.uuid4())
    prompt += f"\n\n[SYSTEM ENFORCEMENT - RANDOM SEED: {random_hash}]\n"
    prompt += "Do NOT give predictable or standard questions. Pick obscure, highly specific, or creative angles based on the ROLE REQUIREMENTS to ensure this test is wildly different from average."
    
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
    
    result = parse_json_response(response_text, caller_label=f"InterviewGenerator-{interview_type}")
    
    if not result or "questions" not in result:
        return {"status": "error", "error": "Failed to generate questions. Received invalid format from LLM."}
        
    return {
        "status": "success",
        "questions": result["questions"][:5]
    }
