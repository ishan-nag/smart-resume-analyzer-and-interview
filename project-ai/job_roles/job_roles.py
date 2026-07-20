"""Loads and serves job role data from data/job_roles.json."""

import os
import json


def _load_job_roles() -> list:
    """Loads all job roles from data/job_roles.json. Returns list of role dicts."""
    base_dir   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    roles_path = os.path.join(base_dir, "data", "job_roles.json")

    if not os.path.exists(roles_path):
        print(f"[JobRoles] ERROR: job_roles.json not found at {roles_path}")
        return []

    with open(roles_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    roles = data.get("roles", [])
    print(f"[JobRoles] Loaded {len(roles)} job roles from job_roles.json")
    return roles


_ALL_ROLES: list = _load_job_roles()
_ROLES_BY_ID: dict = {role["id"]: role for role in _ALL_ROLES}


def get_all_roles() -> list:
    """Returns lightweight list of all roles (id, title, category, experience_level) for frontend dropdowns."""
    return [
        {
            "id":               role["id"],
            "title":            role["title"],
            "category":         role["category"],
            "experience_level": role["experience_level"],
        }
        for role in _ALL_ROLES
    ]


def get_role_by_id(role_id: str) -> dict:
    """Returns full role dict for a given role ID, or error dict if not found."""
    role = _ROLES_BY_ID.get(role_id)

    if role is None:
        return {"error": f"Role not found: {role_id}"}

    return role


def build_job_description(role: dict) -> str:
    """Converts a role dict into a plain text job description string for LLM prompts."""
    if not role or "error" in role:
        return ""

    title            = role.get("title", "")
    description      = role.get("description", "")
    required_skills  = role.get("required_skills", [])
    nice_to_have     = role.get("nice_to_have_skills", [])
    experience_level = role.get("experience_level", "")

    jd = f"""Job Title: {title}
Experience Level: {experience_level}

About the Role:
{description}

Required Skills:
{", ".join(required_skills)}

Nice to Have:
{", ".join(nice_to_have)}
"""
    return jd


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    print("\n" + "="*60)
    print("TEST 1: get_all_roles()")
    print("="*60)
    all_roles = get_all_roles()
    print(f"Total roles loaded: {len(all_roles)}")
    for r in all_roles:
        print(f"  [{r['category']}] {r['id']} — {r['title']} ({r['experience_level']})")

    print("\n" + "="*60)
    print("TEST 2: get_role_by_id('ml_engineer')")
    print("="*60)
    role = get_role_by_id("ml_engineer")
    print(f"  Title            : {role['title']}")
    print(f"  Category         : {role['category']}")
    print(f"  Experience Level : {role['experience_level']}")
    print(f"  Required Skills  : {role['required_skills']}")
    print(f"  Nice to Have     : {role['nice_to_have_skills']}")

    print("\n" + "="*60)
    print("TEST 3: get_role_by_id('invalid_role')")
    print("="*60)
    bad_role = get_role_by_id("invalid_role")
    print(f"  Result: {bad_role}")

    print("\n" + "="*60)
    print("TEST 4: build_job_description(ml_engineer)")
    print("="*60)
    jd = build_job_description(role)
    print(jd)
