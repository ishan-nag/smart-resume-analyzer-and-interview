"""
evaluator.py — Mock Interview Answer Evaluator
"""

import re
from shared.groq_client import get_groq_client, MODEL_CONFIGS
from shared.retry_handler import call_with_retry, parse_json_response
from job_roles.job_roles import get_role_by_id
from mock_interview.prompt_templates import EVALUATE_ANSWERS_PROMPT

# ---------------------------------------------------------------------------
# Junk Answer Detection — Runs BEFORE the LLM is called
# ---------------------------------------------------------------------------
_VAGUE_PHRASES = {
    "i don't know", "idk", "i dont know", "no idea", "don't know",
    "not sure", "i'm not sure", "i am not sure", "pass", "skip",
    "n/a", "na", "none", "nothing", "no answer", "no", "yes", "ok",
    "okay", "hmm", "uh", "um", "lol", "haha", "idc", "whatever",
    "[time expired - no answer provided]", ".", "-", "?",
}

def _is_junk_answer(answer: str) -> bool:
    """Returns True if the answer is empty, gibberish, or a known vague phrase."""
    stripped = answer.strip().lower()
    
    # Empty or whitespace only
    if not stripped:
        return True
    
    # Known vague phrases (exact match after lowercasing)
    if stripped in _VAGUE_PHRASES:
        return True
    
    # Very short (under 8 chars) — catches "asdf", "abc", "1234", etc.
    if len(stripped) < 8:
        return True
    
    # Gibberish: mostly non-alphabetic characters
    alpha_chars = re.sub(r'[^a-zA-Z]', '', stripped)
    if len(stripped) > 0 and len(alpha_chars) / len(stripped) < 0.5:
        return True
    
    # Almost no real words: split and check ≥ 2 real words (3+ chars each)
    real_words = [w for w in re.split(r'\W+', stripped) if len(w) >= 3]
    if len(real_words) < 2:
        return True

    return False

_JUNK_FEEDBACK = "No meaningful answer was provided. The candidate left this blank, typed gibberish, or gave a non-answer (e.g. 'I don't know'). A complete, relevant response is required."
_JUNK_IDEAL   = "Answer the question directly and concisely in 2-4 sentences using specific knowledge relevant to the role."


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
    
    # 2. Pre-screen every answer for junk BEFORE hitting the LLM
    junk_overrides = {}  # index -> pre-built evaluation dict
    for i, qa in enumerate(questions_and_answers):
        if _is_junk_answer(qa.get("answer", "")):
            junk_overrides[i] = {
                "question_number": i + 1,
                "question": qa.get("question", ""),
                "score_out_of_10": 0,
                "feedback": _JUNK_FEEDBACK,
                "ideal_answer": _JUNK_IDEAL,
            }

    # 3. Format Q&A Text — flag junk answers clearly so LLM also sees them
    q_and_a_text = ""
    for i, qa in enumerate(questions_and_answers, start=1):
        q_text = qa.get("question", "No question text provided.")
        a_text = qa.get("answer", "No answer provided.")
        if (i - 1) in junk_overrides:
            a_text = "[INVALID ANSWER — NO MEANINGFUL RESPONSE PROVIDED]"
        q_and_a_text += f"\n--- Question {i} ---\nQ: {q_text}\nA: {a_text}\n"
        
    # 4. Format Prompt
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
        
    # 6. Merge junk overrides back into LLM result
    if result and "evaluations" in result:
        for idx, override in junk_overrides.items():
            result["evaluations"][idx] = override
        # Recalculate overall score honestly
        total = sum(e.get("score_out_of_10", 0) for e in result["evaluations"])
        result["overall_score"] = total * 2

    return {
        "status": "success",
        "evaluation": result
    }
