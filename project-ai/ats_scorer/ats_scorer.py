"""ATS scorer: keyword overlap and LLM-based semantic matching for resumes."""

import os
import json
import re
import glob

from shared.groq_client import get_groq_client, MODEL_CONFIGS
from shared.retry_handler import call_with_retry, parse_json_response

try:
    from .prompt_templates import get_combined_llm_scores_prompt
except ImportError:
    from prompt_templates import get_combined_llm_scores_prompt

from job_roles.job_roles import get_role_by_id, build_job_description

WEIGHTS = {
    "keyword_match":    0.35,
    "semantic_match":   0.35,
    "experience_match": 0.20,
    "education_match":  0.10,
}

def get_recommendation(score: float) -> str:
    """Returns a hiring recommendation label based on the overall ATS score."""
    if score >= 85:
        return "Excellent Match"
    elif score >= 70:
        return "Good Match"
    elif score >= 55:
        return "Moderate Match"
    elif score >= 40:
        return "Weak Match"
    else:
        return "Poor Match"

def score_keyword_match(resume_skills: list, job_description: str) -> dict:
    """Scores resume based on keyword/skill overlap with the job description."""
    jd_lower = job_description.lower()
    matched  = []
    missing  = []

    for skill in resume_skills:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, jd_lower):
            matched.append(skill)
        else:
            missing.append(skill)

    jd_words = re.findall(
        r'\b[a-zA-Z][a-zA-Z0-9+#.]*(?:\s[a-zA-Z][a-zA-Z0-9+#.]*){0,2}\b',
        jd_lower
    )
    jd_skills_detected  = [w for w in set(jd_words) if len(w) > 3]
    resume_skills_lower = [s.lower() for s in resume_skills]
    extra_missing = [
        w for w in jd_skills_detected
        if w not in resume_skills_lower and w not in missing
        and len(w.split()) <= 2
    ][:10]

    all_missing   = list(set(missing + extra_missing))
    total_checked = len(resume_skills) if resume_skills else 1
    score         = max(0, min(100, int((len(matched) / total_checked) * 100)))
    feedback      = (
        f"Candidate matches {len(matched)} out of {total_checked} resume skills "
        f"found in the job description."
    )

    return {
        "score":            score,
        "matched_keywords": matched,
        "missing_keywords": all_missing[:15],
        "feedback":         feedback,
    }

def _call_llm_for_all_scores(
    client,
    resume_text: str,
    experience_text: str,
    education_text: str,
    job_description: str
) -> dict:
    """Makes a single Groq API call for semantic, experience, and education scores."""
    config = MODEL_CONFIGS["ats_scorer"]
    prompt = get_combined_llm_scores_prompt(
        resume_text, experience_text, education_text, job_description
    )

    raw_text = call_with_retry(
        client=client,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert ATS evaluator and recruiter. "
                    "Always respond with ONLY a valid JSON object. "
                    "No explanation, no markdown, no extra text."
                )
            },
            {"role": "user", "content": prompt}
        ],
        model=config["model"],
        temperature=config["temperature"],
        max_tokens=512,
        caller_label="ATSScorer:combined",
    )

    data = parse_json_response(raw_text, "ATSScorer:combined")

    fallback = {
        "semantic_match":   {"score": 0, "feedback": "Could not evaluate semantic match."},
        "experience_match": {"score": 0, "feedback": "Could not evaluate experience match."},
        "education_match":  {"score": 0, "feedback": "Could not evaluate education match."},
    }

    if data is None or not isinstance(data, dict):
        return fallback

    result = {}
    for key in ["semantic_match", "experience_match", "education_match"]:
        raw = data.get(key, {})
        if isinstance(raw, dict):
            score    = max(0, min(100, int(raw.get("score", 0))))
            feedback = str(raw.get("reason", "No feedback provided."))
            result[key] = {"score": score, "feedback": feedback}
        else:
            result[key] = fallback[key]

    return result

def score_resume(
    parsed_resume: dict,
    job_description: str = None,
    role_id: str = None
) -> dict:
    """Scores a resume against a job description or role ID. Returns overall score, recommendation, and breakdown."""
    if not parsed_resume:
        return {"error": "parsed_resume is empty or None."}

    if job_description is None and role_id is None:
        return {"error": "Either job_description or role_id must be provided."}

    if role_id is not None:
        role = get_role_by_id(role_id)
        if "error" in role:
            return {"error": f"Invalid role_id: '{role_id}'. {role['error']}"}
        job_description = build_job_description(role)
        print(f"[ATSScorer] role_id='{role_id}' resolved to job description.")

    if not job_description or not job_description.strip():
        return {"error": "job_description is empty after resolving from role_id."}

    skills     = parsed_resume.get("skills", [])
    raw_text   = parsed_resume.get("raw_text", "")
    experience = parsed_resume.get("experience", "")
    education  = parsed_resume.get("education", "")

    if not raw_text:
        raw_text = f"Skills: {', '.join(skills)}\nExperience: {experience}\nEducation: {education}"
    if not experience.strip():
        experience = raw_text
    if not education.strip():
        education = raw_text

    try:
        client = get_groq_client()
    except ValueError as e:
        return {"error": str(e)}

    print("[ATSScorer] Starting ATS scoring...")
    breakdown = {}

    print("[ATSScorer] Scoring keyword match...")
    breakdown["keyword_match"] = score_keyword_match(skills, job_description)

    print("[ATSScorer] Scoring semantic, experience, and education match via single Groq call...")
    llm_scores = _call_llm_for_all_scores(
        client, raw_text, experience, education, job_description
    )
    breakdown["semantic_match"]   = llm_scores["semantic_match"]
    breakdown["experience_match"] = llm_scores["experience_match"]
    breakdown["education_match"]  = llm_scores["education_match"]

    overall_score = round(sum(
        breakdown[k]["score"] * WEIGHTS[k] for k in WEIGHTS
    ), 1)

    print(f"[ATSScorer] Scoring complete! Overall score: {overall_score}")

    return {
        "overall_score":  overall_score,
        "recommendation": get_recommendation(overall_score),
        "breakdown":      breakdown,
    }

def save_ats_result(result: dict, output_path: str = "output/ats_result.json") -> None:
    """Saves the ATS scoring result dictionary to a JSON file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=4, ensure_ascii=False)
    print(f"[ATSScorer] ATS result saved to: {output_path}")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    resume_files = sorted(glob.glob("output/parsed_resume*.json"))

    if not resume_files:
        print("[ATSScorer] ERROR: No parsed resume files found in output/.")
        print("[ATSScorer] Run resume_parser first: python -m resume_parser.resume_parser")
        exit(1)

    print(f"[ATSScorer] Found {len(resume_files)} parsed resume(s): {resume_files}")

    for resume_path in resume_files:
        basename    = os.path.basename(resume_path)
        suffix      = basename.replace("parsed_resume", "ats_result")
        output_path = os.path.join("output", suffix)

        print(f"\n{'='*60}")
        print(f"[ATSScorer] Scoring: {resume_path} against role_id='ml_engineer'")
        print(f"{'='*60}")

        with open(resume_path, "r", encoding="utf-8") as f:
            parsed_resume = json.load(f)

        result = score_resume(parsed_resume, role_id="ml_engineer")

        if "error" in result:
            print(f"[ATSScorer] FAILED: {result['error']}")
        else:
            print(f"\n[ATSScorer] SUCCESS!")
            print(f"  Overall Score  : {result['overall_score']} / 100")
            print(f"  Recommendation : {result['recommendation']}")
            print(f"\n  Breakdown:")
            for category, data in result["breakdown"].items():
                print(f"\n    [{category.upper()}]")
                print(f"      Score    : {data['score']} / 100")
                print(f"      Feedback : {data['feedback']}")
                if "matched_keywords" in data:
                    print(f"      Matched  : {data['matched_keywords']}")
                if "missing_keywords" in data:
                    print(f"      Missing  : {data['missing_keywords']}")
            save_ats_result(result, output_path)
