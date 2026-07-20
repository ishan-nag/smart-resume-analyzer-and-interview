"""Input validation helpers for session-level constraints."""

MAX_ROLES_PER_SESSION = 3
VALID_INTERVIEW_TYPES = ["behavioural", "technical", "domain-specific"]


def validate_role_selection(role_ids: list) -> dict:
    """Validates role IDs: non-empty list, max 3, no duplicates. Returns {"valid": True} or error dict."""
    if not role_ids or not isinstance(role_ids, list):
        return {"valid": False, "error": "No roles selected. Please select at least 1 role."}

    if len(role_ids) > MAX_ROLES_PER_SESSION:
        return {
            "valid": False,
            "error": f"Too many roles selected ({len(role_ids)}). Maximum allowed is {MAX_ROLES_PER_SESSION} per session."
        }

    if len(set(role_ids)) != len(role_ids):
        return {"valid": False, "error": "Duplicate roles detected. Each role can only be selected once."}

    return {"valid": True}


def validate_interview_types(interview_types: list) -> dict:
    """Validates interview types: non-empty list, valid types only, no duplicates."""
    if not interview_types or not isinstance(interview_types, list):
        return {"valid": False, "error": "No interview types selected. Choose at least 1."}

    for t in interview_types:
        if t not in VALID_INTERVIEW_TYPES:
            return {
                "valid": False,
                "error": f"Invalid interview type: '{t}'. Must be one of: {VALID_INTERVIEW_TYPES}"
            }

    if len(set(interview_types)) != len(interview_types):
        return {"valid": False, "error": "Duplicate interview types detected."}

    return {"valid": True}


def validate_parsed_resume(parsed_resume: dict) -> dict:
    """Validates a parsed resume exists and has minimum required fields."""
    if not parsed_resume or not isinstance(parsed_resume, dict):
        return {"valid": False, "error": "Resume must be uploaded and parsed before starting an interview."}

    if "error" in parsed_resume:
        return {"valid": False, "error": f"Resume parsing failed: {parsed_resume['error']}"}

    if not parsed_resume.get("skills") and not parsed_resume.get("raw_text"):
        return {"valid": False, "error": "Parsed resume has no usable content. Please re-upload."}

    return {"valid": True}
