"""
validators.py — Input Validation Helpers
==========================================
Shared validation functions used by the backend (or FastAPI wrapper)
to enforce session-level constraints before calling AI functions.

Rules enforced:
    - Maximum 3 roles per session
    - Valid interview types only
    - Parsed resume must exist before interview

This module is stateless — it only validates inputs, it does not
store any session data.
"""

MAX_ROLES_PER_SESSION = 3
VALID_INTERVIEW_TYPES = ["behavioural", "technical", "domain-specific"]


def validate_role_selection(role_ids: list) -> dict:
    """
    Validates the list of role IDs selected by the candidate.

    Rules:
        - Must be a non-empty list
        - Maximum 3 roles allowed per session
        - No duplicate role IDs

    Parameters:
        role_ids (list): List of role ID strings.
                         Example: ["ml_engineer", "backend_engineer"]

    Returns:
        dict: {"valid": True} if all checks pass.
              {"valid": False, "error": "..."} if validation fails.
    """
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
    """
    Validates the list of interview types selected by the candidate.

    Rules:
        - Must be a non-empty list
        - Each type must be one of: "behavioural", "technical", "domain-specific"
        - No duplicates

    Parameters:
        interview_types (list): List of interview type strings.

    Returns:
        dict: {"valid": True} if all checks pass.
              {"valid": False, "error": "..."} if validation fails.
    """
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
    """
    Validates that a parsed resume exists and has the minimum required fields.
    This acts as the 'gate' for Mode 2 (Interview Only) — resume must be
    parsed before interview can start.

    Parameters:
        parsed_resume (dict): The dict returned by parse_resume().

    Returns:
        dict: {"valid": True} if the resume is usable.
              {"valid": False, "error": "..."} if not.
    """
    if not parsed_resume or not isinstance(parsed_resume, dict):
        return {"valid": False, "error": "Resume must be uploaded and parsed before starting an interview."}

    if "error" in parsed_resume:
        return {"valid": False, "error": f"Resume parsing failed: {parsed_resume['error']}"}

    if not parsed_resume.get("skills") and not parsed_resume.get("raw_text"):
        return {"valid": False, "error": "Parsed resume has no usable content. Please re-upload."}

    return {"valid": True}
