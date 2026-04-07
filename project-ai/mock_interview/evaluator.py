"""
evaluator.py — Mock Interview Answer Evaluator
"""

from shared.groq_client import get_groq_client, MODEL_CONFIGS
from shared.retry_handler import call_with_retry, parse_json_response
from job_roles.job_roles import get_role_by_id
from mock_interview.prompt_templates import EVALUATE_ANSWERS_PROMPT

def evaluate_interview_answers(role_id: str, interview_type: str, questions_and_answers: list) -> dict:
    """
    Evaluates 5 candidate answers to generated mock interview questions.
    
    Parameters:
        role_id: The ID of the role (e.g. "ml_engineer").
        interview_type: One of "behavioural", "technical", or "domain-specific".
        questions_and_answers: A list of dicts [{"question": "...", "answer": "..."}, ...]
        
    Returns:
        A dict containing:
        - "status": "success" or "error"
        - "evaluation": The structured evaluation dict from the LLM (if success)
        - "error": Description (if error)
    """
    if len(questions_and_answers) != 5:
        return {"status": "error", "error": "Expected exactly 5 questions and answers."}
        
    # 1. Fetch role details
    role = get_role_by_id(role_id)
    if not role or "error" in role:
        return {"status": "error", "error": f"Role '{role_id}' not found."}
        
    role_title = role.get("title", role_id)
    
    # 2. Format Q&A Text
    q_and_a_text = ""
    for i, qa in enumerate(questions_and_answers, start=1):
        q_text = qa.get("question", "No question text provided.")
        a_text = qa.get("answer", "No answer provided.")
        q_and_a_text += f"\n--- Question {i} ---\nQ: {q_text}\nA: {a_text}\n"
        
    # 3. Format Prompt
    prompt = EVALUATE_ANSWERS_PROMPT.format(
        role_title=role_title,
        interview_type=interview_type,
        q_and_a_text=q_and_a_text
    )
    
    # 4. Call LLM
    client = get_groq_client()
    config = MODEL_CONFIGS.get("answer_evaluator", {"model": "llama-3.3-70b-versatile", "temperature": 0.3, "max_tokens": 1024})
    
    response_text = call_with_retry(
        client=client,
        messages=[
            {"role": "system", "content": "You are a professional technical interviewer grading candidate answers."},
            {"role": "user", "content": prompt}
        ],
        model=config["model"],
        temperature=config["temperature"],
        max_tokens=config["max_tokens"],
        caller_label=f"InterviewEvaluator-{interview_type}"
    )
    
    # 5. Parse Response
    result = parse_json_response(response_text, caller_label=f"InterviewEvaluator-{interview_type}")
    
    if not result or "evaluations" not in result:
        return {"status": "error", "error": "Failed to evaluate answers. Received invalid format from LLM."}
        
    return {
        "status": "success",
        "evaluation": result
    }
