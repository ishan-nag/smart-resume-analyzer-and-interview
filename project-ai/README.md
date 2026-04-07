# Smart Mock Interview and Resume Analyzer Tool — AI Module

The AI module handles four things: parsing resumes, generating interview questions, scoring resumes against job descriptions, and evaluating candidate answers. It's written in Python and uses the Groq API for LLM calls.

---

## Team

- **AI/ML** — This module (Python)
- **Backend** — Java Spring Boot, calls functions from this module
- **Frontend** — Talks to the backend, never touches this module directly

---

## Setup

You need Python 3.10+ and pip installed.

```bash
# 1. Go into the project folder
cd project-ai

# 2. Create and activate a virtual environment
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1
# Mac/Linux
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up your API key
copy .env.example .env       # Windows
cp .env.example .env         # Mac/Linux
```

Open `.env` and add your Groq API key:
```
GROQ_API_KEY=your_key_here
```

Get a free key at https://console.groq.com

> Never push `.env` to GitHub. It's already in `.gitignore`.

---
# Smart Resume Analyzer — AI Module

The AI module handles resume parsing and resume vs. job role analysis. It is written in Python and uses the Groq API (free tier) for LLM calls. The backend calls functions from this module — the frontend never touches it directly.

---

## Team

| Role | Technology |
|---|---|
| AI/ML | Python — this module |
| Backend | Java Spring Boot |
| Frontend | Separate teammate |

---

## Project Repository Structure

```
smart-resume-analyzer-and-interview/
├── project-ai/         ← Python AI module (AI/ML teammate)
├── project-backend/    ← Java Spring Boot (backend teammate)
└── project-frontend/   ← Frontend (frontend teammate)
```

---

## For Teammates — Getting Started with the Repo

### Step 1 — Clone the repository to your Desktop

Open a terminal (Command Prompt, PowerShell, or Git Bash) and run:

```bash
cd Desktop
git clone https://github.com/ishan-nag/smart-resume-analyzer-and-interview.git
cd smart-resume-analyzer-and-interview
```

Your folder structure on Desktop will look like:

```
Desktop/
└── smart-resume-analyzer-and-interview/
    ├── project-ai/
    ├── project-backend/
    └── project-frontend/
```

---

### Step 2 — Work inside your own folder only

Each teammate works only in their own subfolder:

| Teammate | Your folder |
|---|---|
| AI/ML | `project-ai/` |
| Backend | `project-backend/` |
| Frontend | `project-frontend/` |

Do NOT make changes in another teammate's folder.

---

### Step 3 — Create your own branch before making changes

Never push directly to `main`. Always work on your own branch.

```bash
# Create and switch to your branch
git checkout -b your-name/feature-name

# Examples:
git checkout -b backend/resume-upload-api
git checkout -b frontend/role-selection-page
git checkout -b ai/resume-analyzer-module
```

---

### Step 4 — Make your changes, then commit

After making changes inside your folder:

```bash
# Check what files you changed
git status

# Stage your changes
git add .

# Commit with a clear message
git commit -m "Add resume upload endpoint to backend"
```

---

### Step 5 — Push your branch to GitHub

```bash
git push origin your-branch-name

# Example:
git push origin backend/resume-upload-api
```

---

### Step 6 — Open a Pull Request (PR) to main

1. Go to the repository on GitHub: https://github.com/ishan-nag/smart-resume-analyzer-and-interview
2. You will see a prompt: **"Compare & pull request"** — click it
3. Set the base branch to `main` and the compare branch to your branch
4. Write a short title and description of what you changed
5. Click **"Create pull request"**
6. The repo host (Ishan) will review and merge it

> Do NOT merge your own PR. Wait for the host to review and approve it.

---

### Step 7 — Keep your local repo up to date

Before starting work each day, pull the latest changes from main:

```bash
git checkout main
git pull origin main

# Switch back to your branch and bring in the latest main changes
git checkout your-branch-name
git merge main
```

If there are merge conflicts, resolve them in your editor, then:

```bash
git add .
git commit -m "Resolve merge conflicts"
```

---

## AI Module Setup (for AI/ML teammate only)

### Requirements

- Python 3.10 or higher
- pip

### Installation

```powershell
# Go into the AI module folder
cd Desktop\smart-resume-analyzer-and-interview\project-ai

# Create a virtual environment
python -m venv .venv

# Activate it (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate it (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up your API key
copy .env.example .env
```

Open `.env` and add your Groq API key:

```
GROQ_API_KEY=your_key_here
```

Get a free key at https://console.groq.com

> Never push `.env` to GitHub. It is already in `.gitignore`.

---

## Running the AI Modules

Always run from the `project-ai/` folder, never from inside a subfolder.

```powershell
# Run in this order:
python -m resume_parser.resume_parser
python -m job_roles.job_roles
python -m ats_scorer.ats_scorer
python -m resume_analyzer.resume_analyzer
```

Run `resume_parser` first — it generates `output/parsed_resume.json` which other modules use.

---

## Handling Scanned / Image-Based PDFs

The AI module only supports text-based PDFs. If a candidate uploads a scanned or image-based PDF, the parser returns:

```json
{"error": "Could not extract text. File may be scanned or image-based."}
```

**Backend:** Check for the `error` key → return HTTP 400 with the error message.

**Frontend:** Show this message to the user:

```
"We couldn't read your resume. This usually means your PDF is image-based
or scanned. Please convert it to a text-based PDF and try again."
```

Suggest these free tools:
- https://www.smallpdf.com
- https://www.ilovepdf.com
- https://online2pdf.com

---

## For the Backend Developer

Every AI function returns a plain Python dict. Serialize it with `json.dumps()` and send it to the frontend.

The backend integration flow is:

```
    1. parse_resume(pdf_path)                        → parsed_resume       [1 LLM call]
    2. get_all_roles()                               → roles list          [0 LLM calls]
    3. validate_role_selection(role_ids)              → check max 3 roles   [0 LLM calls]
    4. for each role_id: analyze_resume(parsed_resume, role_id)
                                                     → role_result         [1 LLM call each]
    5. generate_upgrade_tip(all_role_results, parsed_resume)
                                                     → upgrade_tip         [1 LLM call]
    6. best_match = max(all_role_results,
           key=lambda r: r["ats"]["overall_score"])  → best match role     [0 LLM calls]
    7. Return full JSON to frontend
```

---

### Session Rules

| Rule | Detail |
|---|---|
| Max roles per session | **3** (enforced by `validate_role_selection`) |
| Interview types allowed | `"behavioural"`, `"technical"`, `"domain-specific"` |
| Resume gate | Resume must be parsed before interview can start |
| Stateless | No data is stored between sessions — every request is self-contained |

---

### Input Validators

The backend **must** call these validators before invoking AI functions. They are pure functions with zero API calls.

```python
from shared.validators import validate_role_selection, validate_interview_types, validate_parsed_resume

# Before analysis — enforce 3-role cap
check = validate_role_selection(["ml_engineer", "backend_engineer"])
# → {"valid": True}

check = validate_role_selection(["a", "b", "c", "d"])
# → {"valid": False, "error": "Too many roles selected (4). Maximum allowed is 3 per session."}

# Before interview — validate types
check = validate_interview_types(["behavioural", "technical"])
# → {"valid": True}

# Before interview — gate: resume must exist
check = validate_parsed_resume(parsed_resume)
# → {"valid": True} or {"valid": False, "error": "..."}
```

---

### THREE CANDIDATE FLOWS

You must support three different modes using the functions provided below:

**Mode 1 — Resume Analysis only**
* Upload PDF → `parse_resume` → Select role(s) (**max 3**) → `validate_role_selection` → `analyze_resume` (for selected roles) → `generate_upgrade_tip` → show ATS score, feedback, and upgrade tip.

**Mode 2 — Interview only**
* Upload PDF (required gate) → `parse_resume` → `validate_parsed_resume` → Select role → `validate_interview_types` → `generate_interview_questions` for each type selected (5 questions per section) → frontend shows all text input fields to the candidate.
* Once candidate submits all answers → `evaluate_interview_answers` for each section → Full feedback report shown at the end. (No mid-interview interruptions!)

**Mode 3 — Both at once**
* Upload PDF → `parse_resume` → `validate_role_selection` + `validate_interview_types` → Select role & interview types → `analyze_resume` runs.
* Once analysis is complete, interview starts automatically via `generate_interview_questions` → User answers questions → `evaluate_interview_answers`.
* Output is a combined final report.

---

### 1. Resume Parser

Parses a PDF resume and returns structured candidate data.

```python
from resume_parser import parse_resume

result = parse_resume("uploads/resume.pdf")
```

Returns:
```json
{
    "name":       "John Doe",
    "email":      "john@gmail.com",
    "phone":      "+91 9876543210",
    "linkedin":   "linkedin.com/in/johndoe",
    "github":     "github.com/johndoe",
    "skills":     ["python", "docker", "react"],
    "education":  "B.Tech Computer Science, XYZ University, 2024",
    "experience": "Software Intern at ABC Corp, June–Aug 2023",
    "summary":    "Software engineer with 2 years of experience...",
    "raw_text":   "full resume text..."
}
```

On failure: `{"error": "File not found: uploads/resume.pdf"}`

**API calls: 1**

---

### 2. Job Roles

Returns the list of 28 supported job roles. Zero API calls — reads from a local JSON file.

```python
from job_roles import get_all_roles, get_role_by_id, build_job_description

# Get lightweight list for frontend dropdown
roles = get_all_roles()
```

Returns:
```json
[
    {"id": "ml_engineer",  "title": "Machine Learning Engineer", "category": "Data & AI",          "experience_level": "Mid-level"},
    {"id": "backend_engineer", "title": "Backend Engineer",      "category": "Software Engineering", "experience_level": "Mid-level"}
]
```

28 roles across 7 categories: Software Engineering, Data & AI, Infrastructure & Cloud, Mobile, Security, Product & Management, Emerging & Specialist.

**API calls: 0**

---

### 3. Resume Analyzer — PRIMARY MODULE

Analyzes a resume against a specific job role. Call once per role. The backend loops over selected roles.

```python
from resume_analyzer import analyze_resume, generate_upgrade_tip

# Call once per role
result = analyze_resume(parsed_resume, role_id="ml_engineer")
```

Returns:
```json
{
    "role": {
        "id":       "ml_engineer",
        "title":    "Machine Learning Engineer",
        "category": "Data & AI"
    },
    "ats": {
        "overall_score":  78.0,
        "recommendation": "Good Match",
        "breakdown": {
            "semantic_match":   {"score": 80, "feedback": "Strong backend experience but lacks cloud skills."},
            "experience_match": {"score": 70, "feedback": "2 years relevant experience, role requires 3-5."},
            "education_match":  {"score": 85, "feedback": "B.Tech Computer Science matches the requirement."}
        }
    },
    "skills_gap": {
        "matched":              ["python", "pytorch", "docker"],
        "missing":              ["tensorflow", "mlflow"],
        "nice_to_have_missing": ["kubernetes", "airflow"]
    },
    "quality_score": {
        "overall": 72,
        "breakdown": {"format": 75, "clarity": 70, "impact": 68, "brevity": 80}
    },
    "section_feedback": {
        "experience": {"score": 75, "feedback": "Good range of projects but lacks metrics.", "improvements": ["Add quantifiable achievements"]},
        "education":  {"score": 90, "feedback": "Degree is well-aligned.", "improvements": []},
        "summary":    {"score": 60, "feedback": "Too generic.", "improvements": ["Tailor to ML roles", "Mention top tools"]},
        "skills":     {"score": 80, "feedback": "Strong core skills listed.", "improvements": ["Add MLflow"]}
    }
}
```

On failure: `{"error": "Reason for failure"}`

**API calls: 1 per role**

---

### 4. Upgrade Tip Generator

Call ONCE after all `analyze_resume()` calls are done. Takes all role results and returns a single upgrade tip paragraph.

```python
# After looping over all roles:
tip = generate_upgrade_tip(all_role_results, parsed_resume)
```

Returns:
```json
{
    "upgrade_tip": "Your resume shows strong Python fundamentals across all roles
                    but consistently lacks cloud and deployment skills like Docker
                    and Kubernetes. Adding these with concrete project examples
                    would significantly improve your ATS scores."
}
```

**API calls: 1 total (called once, not per role)**

---

### 5. ATS Scorer (standalone)

Scores a resume against a role. Already used internally by `analyze_resume()` — backend does not need to call this separately unless needed standalone.

```python
from ats_scorer import score_resume

# New way — pass role_id
result = score_resume(parsed_resume, role_id="ml_engineer")

# Old way — pass raw job description string (still works)
result = score_resume(parsed_resume, job_description="We are looking for...")
```

**API calls: 1**

---

### 6. Mock Interview (Question Generator)

Generates 5 personalized questions based on the candidate's resume and selected role. Do this once per selected section type.

```python
from mock_interview import generate_interview_questions

result = generate_interview_questions(
    parsed_resume=parsed_resume,
    role_id="ml_engineer",
    interview_type="behavioural" # or "technical", "domain-specific"
)
```

Returns:
```json
{
    "status": "success",
    "questions": [
        "Tell me about a time you had to resolve a conflict...",
        "Question 2...",
        "Question 3...",
        "Question 4...",
        "Question 5..."
    ]
}
```

**API calls: 1 per interview section**

---

### 7. Mock Interview (Answer Evaluator)

Evaluates the 5 candidate answers for a specific interview section and provides detailed feedback and scoring. Do this after they submit all answers for a section.

```python
from mock_interview import evaluate_interview_answers

# Build the payload based on the candidate's inputs
qa_list = [
    {"question": "Tell me about a time...", "answer": "I once had a coworker..."},
    # ... exactly 5 objects
]

result = evaluate_interview_answers(
    role_id="ml_engineer",
    interview_type="behavioural",
    questions_and_answers=qa_list
)
```

Returns:
```json
{
    "status": "success",
    "evaluation": {
        "overall_score": 85,
        "overall_summary": "Good effort overall...",
        "evaluations": [
            {
                "question_number": 1,
                "question": "Tell me about a time...",
                "score_out_of_10": 8,
                "feedback": "You answered this clearly...",
                "ideal_answer": "A perfect answer would have..."
            }
        ]
    }
}
```

**API calls: 1 per interview section**

---

## API Call Budget

| Step | Module | Calls | Frequency |
|---|---|---|---|
| Parse resume | resume_parser | 1 | Once per session |
| Get all roles | job_roles | 0 | Once per session |
| Analyze per role | resume_analyzer | 1 per role | Per role selected |
| Global upgrade tip | resume_analyzer | 1 | Once after all roles |
| Generate Questions | mock_interview | 1 per section | Per interview type selected |
| Evaluate Answers | mock_interview | 1 per section | Per interview type selected |
| **Example Flow Total** | | **6** | (Parse + 2 Roles Analyzed + 1 Tip + 1 Q-Gen + 1 Eval) |

**Groq Free Tier limits (llama-3.3-70b-versatile):**

| Limit | Value |
|---|---|
| Requests per day | 1,000 |
| Requests per minute | 30 |
| Tokens per day | 100,000 |

At 6 calls per session, the free tier supports ~166 full sessions per day comfortably.

---

## Frontend → AI Output Mapping

| UI Element | Source |
|---|---|
| Best Match role title | `role.title` of max `ats.overall_score` across all roles |
| Resume Score number | `ats.overall_score` of best match role |
| Roles Compared count | `len(selected_role_ids)` — backend counts |
| Role card score % | `ats.overall_score` per role |
| Role card skill tags | `role.required_skills[:3]` from job_roles |
| ATS breakdown bars | `ats.breakdown` per role |
| Recommendation paragraph | `ats.recommendation` per role |
| Strengths bullets | `section_feedback[section].feedback` (positive sections) |
| Needs Improvement bullets | `section_feedback[section].improvements` |
| Suggested Resume Upgrade | `upgrade_tip.upgrade_tip` |
| Candidate Name | `parsed_resume.name` |
| Primary Stack | `", ".join(parsed_resume["skills"][:3])` — backend derives this |

---

## Project Folder Structure

```
project-ai/
├── ats_scorer/
│   ├── __init__.py
│   ├── ats_scorer.py
│   └── prompt_templates.py
├── data/
│   ├── sample_resume_1.pdf
│   ├── sample_resume_2.pdf
│   ├── sample_resume_3.pdf
│   ├── sample_resume_4.pdf
│   ├── sample_resume_5.pdf
│   ├── skills_list.json
│   └── job_roles.json
├── job_roles/
│   ├── __init__.py
│   └── job_roles.py
├── mock_interview/
│   ├── __init__.py
│   ├── evaluator.py
│   ├── generator.py
│   └── prompt_templates.py
├── output/                   ← auto-generated, gitignored
├── resume_analyzer/
│   ├── __init__.py
│   ├── prompt_templates.py
│   └── resume_analyzer.py
├── resume_parser/
│   ├── __init__.py
│   ├── resume_parser.py
│   └── utils.py
├── shared/
│   ├── __init__.py
│   ├── groq_client.py
│   ├── retry_handler.py
│   └── validators.py
├── .env                      ← your API key, never push this
├── .env.example              ← safe to push, no real key
├── .gitignore
├── README.md
└── requirements.txt
```

---

## Common Errors

| Error | Fix |
|---|---|
| `GROQ_API_KEY not found` | Check `.env` file — no spaces around `=` |
| `ModuleNotFoundError` | Run from `project-ai/` root, not a subfolder |
| `No module named 'groq'` | Activate venv first — `.\.venv\Scripts\Activate.ps1` |
| `model decommissioned` | Update `DEFAULT_MODEL` in `shared/groq_client.py` |
| `Could not extract text` | PDF must be text-based, not a scanned image |
| `git push rejected` | Run `git pull origin main --rebase` then push again |
| `pip installs to AppData` | Use `.\.venv\Scripts\python.exe -m pip install` instead |

---

## Stateless Architecture & Data Privacy

This AI module is designed to be **completely stateless**. There is no session storage, no database, and no accumulated history.

| Principle | How it's enforced |
|---|---|
| No session state | Every function call is self-contained. Pass all inputs every time. |
| No LLM memory | Every API call generates a fresh prompt with only the current candidate's data. The LLM has zero knowledge of previous resumes or candidates. |
| No persistent files | `output/` JSON files are overwritten on every run. Never read stale files from a previous session. |
| No stored API keys | `GROQ_API_KEY` is loaded from `.env` at runtime into RAM. Never hardcoded, logged, or written to disk. |
| Input validation only | `shared/validators.py` enforces the 3-role cap and interview type checks as pure functions — no state stored. |

**Important for backend:** Treat every incoming request as a brand new session. Do not cache AI results across requests. Always call `parse_resume` fresh for each new PDF upload.

---

## End-to-End Flow — AI Module Only

This is the internal flow of the Python AI module. All functions are called from `project-ai/` root.

### Mode 1 — Resume Analysis Only

```
PDF File
  │
  ▼
parse_resume(pdf_path)                  ─── 1 LLM call
  │  Returns: parsed_resume dict
  ▼
get_all_roles()                         ─── 0 LLM calls
  │  Returns: list of 28 roles (from local JSON)
  ▼
User selects role(s)
  │
  ▼
┌─ FOR EACH selected role ──────────────────────────┐
│  analyze_resume(parsed_resume, role_id)            │
│      → ATS score, skills gap, quality, feedback    │
│      → 1 LLM call per role                         │
└────────────────────────────────────────────────────┘
  │
  ▼
generate_upgrade_tip(all_role_results, parsed_resume)  ─── 1 LLM call
  │  Returns: single upgrade tip paragraph
  ▼
Final JSON → ATS scores + feedback + upgrade tip
```

### Mode 2 — Interview Only

```
PDF File (required gate — resume must be parsed first)
  │
  ▼
parse_resume(pdf_path)                  ─── 1 LLM call
  │  Returns: parsed_resume dict
  ▼
User selects 1 role + interview types
  (behavioural / technical / domain-specific)
  │
  ▼
┌─ FOR EACH selected interview type ─────────────────┐
│  generate_interview_questions(                      │
│      parsed_resume, role_id, interview_type)        │
│      → 5 focused questions                          │
│      → 1 LLM call per type                          │
└─────────────────────────────────────────────────────┘
  │
  ▼
Candidate answers all questions (text only, no interruptions)
  │
  ▼
┌─ FOR EACH interview type ──────────────────────────┐
│  evaluate_interview_answers(                        │
│      role_id, interview_type, questions_and_answers) │
│      → score per question + overall score + feedback │
│      → 1 LLM call per type                          │
└─────────────────────────────────────────────────────┘
  │
  ▼
Full feedback report shown at end
```

### Mode 3 — Both at Once

```
PDF File
  │
  ▼
parse_resume(pdf_path)                  ─── 1 LLM call
  │
  ▼
User selects 1 role + interview types
  │
  ├──► Resume Analysis runs first:
  │      analyze_resume(parsed_resume, role_id)        ─── 1 LLM call
  │      generate_upgrade_tip(results, parsed_resume)  ─── 1 LLM call
  │
  │    Analysis complete, interview starts automatically:
  │
  ├──► generate_interview_questions (per type)         ─── 1 LLM call each
  │      → Candidate answers all questions
  │
  └──► evaluate_interview_answers (per type)           ─── 1 LLM call each
         │
         ▼
    Combined Final Report
      ├── ATS score + skills gap + quality + section feedback
      ├── Upgrade tip
      └── Interview scores + per-question feedback + ideal answers
```

---

## End-to-End Flow — Full Project (Frontend + Backend + AI)

This is how the three layers talk to each other at runtime.

```
┌───────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vercel)                          │
│                                                                   │
│  1. User uploads PDF resume                                       │
│  2. User picks a mode: Analysis / Interview / Both                │
│  3. User selects role(s) and interview types                      │
│  4. Sends HTTP requests to Backend                                │
│  5. Displays results: scores, feedback, interview evaluation      │
└──────────────────────────────┬────────────────────────────────────┘
                               │  HTTP (REST API)
                               ▼
┌───────────────────────────────────────────────────────────────────┐
│                   BACKEND (Render, Java Spring Boot)               │
│                                                                   │
│  1. Receives PDF + mode + role selection from Frontend             │
│  2. Saves PDF temporarily                                         │
│  3. Calls AI Module functions in sequence based on mode:           │
│                                                                   │
│     Mode 1: parse_resume → analyze_resume (loop) →                │
│             generate_upgrade_tip → return JSON                    │
│                                                                   │
│     Mode 2: parse_resume → generate_interview_questions (loop) → │
│             collect answers → evaluate_interview_answers (loop) → │
│             return JSON                                           │
│                                                                   │
│     Mode 3: parse_resume → analyze_resume → upgrade_tip →         │
│             generate_interview_questions → collect answers →      │
│             evaluate_interview_answers → return combined JSON     │
│                                                                   │
│  4. Serializes AI output with json.dumps()                        │
│  5. Sends final JSON response back to Frontend                    │
└──────────────────────────────┬────────────────────────────────────┘
                               │  Python function calls (or HTTP
                               │  via FastAPI wrapper at deployment)
                               ▼
┌───────────────────────────────────────────────────────────────────┐
│                   AI MODULE (Render, Python)                       │
│                                                                   │
│  resume_parser    → Extracts structured data from PDF             │
│  job_roles        → Serves 28 roles from local JSON (0 API calls) │
│  ats_scorer       → Scores resume vs role (used by analyzer)      │
│  resume_analyzer  → Full analysis + upgrade tip generation        │
│  mock_interview   → Question generation + answer evaluation       │
│                                                                   │
│  All functions return plain Python dicts.                          │
│  All LLM calls go through shared/groq_client.py                   │
│  All LLM calls have retry logic via shared/retry_handler.py       │
└──────────────────────────────┬────────────────────────────────────┘
                               │  HTTPS
                               ▼
┌───────────────────────────────────────────────────────────────────┐
│                     GROQ API (External)                           │
│                                                                   │
│  Model: llama-3.3-70b-versatile                                   │
│  Free tier: 1,000 req/day · 30 req/min · 100K tokens/day         │
│  Stateless — no candidate data is stored by Groq                  │
└───────────────────────────────────────────────────────────────────┘
```

---

## Deployment Notes

At deployment time, the AI module will run as a separate Python service on Render with a FastAPI wrapper (`main.py`). The Spring Boot backend will call it via HTTP.

```
Frontend (Vercel) → Backend (Render, Java) → AI Module (Render, Python) → Groq API
```

> Render free tier sleeps after 15 minutes of inactivity. Open the app at least 1 minute before your demo.

The FastAPI `main.py` will be added at deployment time — it is not part of the current module.

---

**GitHub:** https://github.com/ishan-nag/smart-resume-analyzer-and-interview  
**Last Updated:** Session 5 complete — Mock Interview module done.
