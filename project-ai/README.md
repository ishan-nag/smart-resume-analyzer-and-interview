# Smart Resume Analyzer & Mock Interview Tool — AI Module

The AI module is the intelligence layer of this project. It handles **resume parsing**, **ATS scoring**, **resume analysis**, **mock interview question generation**, and **answer evaluation**. It is written in Python and uses the **Groq API** (free tier, `llama-3.3-70b-versatile` model) for all LLM calls.

> **This README is the single source of truth.** Every teammate (Backend, Frontend, AI) should read their dedicated section below by clicking the 19 clickable sections in the Table of Contents.

---

## Table of Contents

1. [Team & Responsibilities](#team--responsibilities)
2. [Project Repository Structure](#project-repository-structure)
3. [Git Workflow (All Teammates)](#git-workflow-all-teammates)
4. [What the Product Does — The 3 Modes](#what-the-product-does--the-3-modes)
5. [Session Rules & Constraints](#session-rules--constraints)
6. [AI Module Setup (AI Teammates Only)](#ai-module-setup-ai-teammates-only)
7. [Running the AI Modules Locally](#running-the-ai-modules-locally)
8. [FOR THE BACKEND DEVELOPER — Complete Integration Guide](#for-the-backend-developer--complete-integration-guide)
9. [FOR THE FRONTEND DEVELOPER — Complete UI Guide](#for-the-frontend-developer--complete-ui-guide)
10. [FOR THE AI TEAMMATES — Module Reference](#for-the-ai-teammates--module-reference)
11. [API Function Reference (All 7 Functions)](#api-function-reference-all-7-functions)
12. [API Call Budget & Rate Limits](#api-call-budget--rate-limits)
13. [End-to-End Flow — AI Module Only](#end-to-end-flow--ai-module-only)
14. [End-to-End Flow — Full Project](#end-to-end-flow--full-project-frontend--backend--ai)
15. [Project Folder Structure](#project-folder-structure)
16. [Stateless Architecture & Data Privacy](#stateless-architecture--data-privacy)
17. [Handling Scanned / Image-Based PDFs](#handling-scanned--image-based-pdfs)
18. [Common Errors & Fixes](#common-errors--fixes)
19. [Deployment Notes](#deployment-notes)

---

## Team & Responsibilities

| Role | Count | Technology | Folder | What they build |
|---|---|---|---|---|
| **AI/ML** | 2 people | Python 3.10+ | `project-ai/` | Resume parser, ATS scorer, resume analyzer, mock interview engine |
| **Backend (Team Lead)** | 1 person | Java Spring Boot | `project-backend/` | REST API, PDF upload, session orchestration, calls AI functions |
| **Frontend** | 1 person | TBD | `project-frontend/` | User interface, file upload, role selection, results display |

**Key rule:** Each teammate works ONLY in their own folder. Do NOT edit files in another teammate's directory.

**Communication flow:**
```
Frontend  ──HTTP──►  Backend  ──Python calls──►  AI Module  ──HTTPS──►  Groq API
```
- Frontend **never** calls the AI module directly.
- Backend is the **orchestrator** — it decides which AI functions to call and in what order.
- AI module is a **stateless library** — it takes inputs, returns outputs, stores nothing.

---

## Project Repository Structure

```
smart-resume-analyzer-and-interview/
├── project-ai/         ← Python AI module (AI teammates)
├── project-backend/    ← Java Spring Boot (backend / team lead)
└── project-frontend/   ← UI (frontend teammate)
```

**GitHub:** https://github.com/ishan-nag/smart-resume-analyzer-and-interview

---

## Git Workflow (All Teammates)

### Step 1 — Clone the repo

```bash
cd Desktop
git clone https://github.com/ishan-nag/smart-resume-analyzer-and-interview.git
cd smart-resume-analyzer-and-interview
```

### Step 2 — Create your own branch (NEVER push to main)

```bash
# Format: your-role/feature-name
git checkout -b backend/resume-upload-api
git checkout -b frontend/role-selection-page
git checkout -b ai/mock-interview-module
```

### Step 3 — Make changes, commit, push

```bash
git status                                    # See what changed
git add .                                     # Stage changes
git commit -m "Add resume upload endpoint"    # Commit with clear message
git push origin your-branch-name              # Push to GitHub
```

### Step 4 — Open a Pull Request

1. Go to https://github.com/ishan-nag/smart-resume-analyzer-and-interview
2. Click **"Compare & pull request"**
3. Base branch = `main`, compare = your branch
4. Write a title + description → Click **"Create pull request"**
5. **Wait for the team lead to review and merge.** Do NOT merge your own PR.

### Step 5 — Stay up to date (do this daily)

```bash
git checkout main
git pull origin main
git checkout your-branch-name
git merge main
```

If merge conflicts appear:
```bash
# Fix conflicts in your editor, then:
git add .
git commit -m "Resolve merge conflicts"
```

---

## What the Product Does — The 3 Modes

The product offers three distinct flows. The user picks one when they start.

### Mode 1 — Resume Analysis Only

> "I want to know how my resume scores against specific job roles."

```
User uploads PDF → Selects up to 3 roles → Gets ATS scores, skills gap analysis,
quality scores, section-by-section feedback, and a global upgrade tip.
```

**No interview. Just resume feedback.**

### Mode 2 — Mock Interview Only

> "I want to practice interview questions for a specific role."

```
User uploads PDF (required — we need their background) → Selects 1 role →
Interview automatically includes all 3 domains (Behavioural, Technical, Domain-specific) →
Gets questions ONE AT A TIME (15 total questions) →
Answers each question before the next one appears →
Gets full feedback report with scores, feedback per question, and ideal answers.
```

**No resume analysis. Just interview practice.**

**Important — Sequential Question Flow:**
- The candidate sees **one question at a time**. They must answer Q1 before Q2 appears.
- Questions flow through all selected types in order: e.g., Behavioural Q1→Q5, then Technical Q1→Q5, then Domain Q1→Q5.
- Answers are accumulated in a dict grouped by interview type.
- Feedback is shown **only after ALL questions across ALL types are answered**. There are NO interruptions mid-interview.

### Mode 3 — Both at Once

> "I want the full experience — analyze my resume AND interview me."

```
User uploads PDF → Selects 1 role →
Resume analysis runs first → Interview starts automatically after (including all 3 domains) →
Questions appear one at a time (15 total) → User answers each before next appears →
Gets a combined final report with both resume analysis results AND interview feedback.
```

---

## Session Rules & Constraints

These rules are **non-negotiable** and enforced in code via `shared/validators.py`:

| Rule | Detail | Who enforces it |
|---|---|---|
| Max roles per session | **3** | `validate_role_selection()` returns error if > 3 |
| Valid interview types | `"behavioural"`, `"technical"`, `"domain-specific"` only | `validate_interview_types()` rejects anything else |
| Resume required first | Resume must be parsed before interview can start | `validate_parsed_resume()` checks for valid data |
| No duplicate roles | Same role cannot be selected twice | `validate_role_selection()` checks for duplicates |
| Stateless | No data stored between sessions | Every function call is self-contained |
| Text-based PDFs only | Scanned/image PDFs are rejected | `parse_resume()` returns error |
| Text-only answers | Interview answers are text input — no audio/video | Frontend enforces this |

---

## AI Module Setup (AI Teammates Only)

> **Backend and Frontend teammates:** You do NOT need to set this up. Skip to your dedicated section below.

### Requirements

- Python 3.10 or higher
- pip

### Installation

```powershell
# 1. Go into the AI module folder
cd Desktop\smart-resume-analyzer-and-interview\project-ai

# 2. Create a virtual environment
python -m venv .venv

# 3. Activate it
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Mac/Linux:
source .venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Set up your API key
copy .env.example .env          # Windows
cp .env.example .env            # Mac/Linux
```

Open `.env` and replace with your real key:
```
GROQ_API_KEY=your_key_here
```

Get a free key at https://console.groq.com

> ⚠️ **NEVER push `.env` to GitHub.** It is already in `.gitignore`.

---

## Running the AI Modules Locally

Always run from the `project-ai/` folder, never from inside a subfolder.

```powershell
# Activate venv first
.\.venv\Scripts\Activate.ps1

# Run modules in this order:
python -m resume_parser.resume_parser       # Must run first — generates parsed JSON
python -m job_roles.job_roles               # Test: shows all 28 roles
python -m ats_scorer.ats_scorer             # Test: scores resume vs roles
python -m resume_analyzer.resume_analyzer   # Test: full analysis pipeline

# Test mock interview module:
python test_mock_interview.py
```

---

## FOR THE BACKEND DEVELOPER — Complete Integration Guide

> **This section is specifically for you.** We have wrapped the entire Python AI module in a blazing fast **FastAPI microservice** (`main.py`). You do NOT need to write any Python code! You will connect to it over standard HTTP REST calls just like any third-party external API.

### Step 1: Start the AI Microservice

Have the AI module running in the background during local development:
```powershell
cd project-ai
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```
This starts the AI background server on `http://localhost:8000`.

### Step 2: Use the Interactive Web Docs (Swagger)

FastAPI automatically generates beautiful, interactive API documentation. 
Open your browser and navigate to: **[http://localhost:8000/docs](http://localhost:8000/docs)**

You will see all 5 endpoints, the exact JSON shapes they require, and you can even upload your PDF and test them live without writing any code.

### Step 3: The 5 Endpoints to Call

From your Java Spring Boot app, use `RestTemplate` or `WebClient` to make HTTP requests to these endpoints. The API handles ALL routing, validation, error catching, and JSON structuring internally!

#### Endpoint 1: Upload Resume (`POST /api/upload`)
- **Input:** Multipart form-data with parameter `file` (the PDF).
- **Action:** Extracts text and structures it into JSON using the LLM.
- **Output:** The full `parsed_resume` JSON. Save this JSON in your Java memory to pass to future steps. Do not store it in a database.

#### Endpoint 2: Get Available Roles (`GET /api/roles`)
- **Input:** None.
- **Output:** List of 28 roles to display in the frontend dropdown.

#### Endpoint 3: Resume Analysis (`POST /api/analyze`)
- **Input JSON Request Body:** `{"parsed_resume": {...}, "role_ids": ["ml_engineer", "backend_engineer"]}`
- **Action:** Generates ATS scores for up to 3 roles simultaneously AND writes the cross-role upgrade tip.
- **Output:** Combined list of `analyses` and the final `upgrade_tip`.

#### Endpoint 4: Generate Mock Interview (`POST /api/interview/generate`)
- **Input JSON Request Body:** `{"parsed_resume": {...}, "role_id": "ml_engineer", "interview_types": ["behavioural", "technical"]}`
- **Action:** Generates 5 high-quality questions per selected interview type.
- **Output:** Returns a `sequential_questions` array (a flat list of questions so the frontend can display them smoothly one-by-one).

#### Endpoint 5: Evaluate Interview (`POST /api/interview/evaluate`)
- **Input JSON Request Body:**
  ```json
  {
    "role_id": "ml_engineer",
    "submitted_answers": {
      "behavioural": [
        {"question": "Tell me about a time...", "answer": "I did X..."}
      ],
      "technical": [
        {"question": "How do you scale...", "answer": "Use a load balancer..."}
      ]
    }
  }
  ```
- **Action:** Evaluates all candidate answers at the very end of the interview.
- **Output:** Full grading breakdown, scores out of 10, and AI-written *ideal answers*.

### Error Handling

The FastAPI wrapper standardizes all errors into proper network HTTP status codes. Your Java code should check the HTTP response code!
- **`200 OK`**: Success.
- **`400 Bad Request`**: You provided bad inputs (e.g., `"string"` instead of a real role ID, >3 roles selected, or you sent a non-PDF file). The JSON response `detail` parameter will explicitly state what you did wrong.
- **`500 Internal Server Error`**: The external Groq LLM API failed to respond, or python panics. Usually fixed by checking your `GROQ_API_KEY` in `.env`.

### What NOT to do for Backend Devs
- ❌ Do NOT try to run Python shell commands from Java. Just make `http://localhost:8000/api/...` requests!
- ❌ Do NOT cache AI results across requests — the system is strictly stateless.
- ❌ Do NOT store parsed resumes in a database — process fresh each time from the frontend flow.
- ❌ Do NOT rely on Java to enforce the "Max 3 Roles Selected" rule—the Python API rigorously blocks requests with 4+ roles natively.
- ❌ **Do NOT use async/parallel threads for your HTTP calls.** Hit the AI API endpoints purely sequentially. Hitting it simultaneously triggers `429 Too Many Requests` API ratelimits.

---

## FOR THE FRONTEND DEVELOPER — Complete UI Guide

> **This section is specifically for you.** You talk to the Backend only — never to the AI module directly.

### Pages you need to build

| Page | What it does |
|---|---|
| **Landing / Upload** | File upload (PDF only) + mode selector (Analysis / Interview / Both) |
| **Role Selection** | Dropdown or card grid of roles — max 3 selectable for analysis, 1 for interview |
| **Interview Questions** | Display questions **one at a time** — candidate answers current question before next appears. Show progress indicator (e.g., "Question 3 of 15"). Exactly 15 questions across 3 domains. |
| **Results — Analysis** | ATS scores, skills gap, quality bars, section feedback, upgrade tip |
| **Results — Interview** | Per-question scores, feedback, ideal answers, overall score |
| **Results — Combined** | Both analysis + interview results on one page (Mode 3) |

### What the backend sends you (data shapes)

#### Role list (for dropdown)

```json
[
    {"id": "ml_engineer", "title": "Machine Learning Engineer", "category": "Data & AI", "experience_level": "Mid-level"},
    {"id": "backend_engineer", "title": "Backend Engineer", "category": "Software Engineering", "experience_level": "Mid-level"}
]
```

28 roles across 7 categories: Software Engineering, Data & AI, Infrastructure & Cloud, Mobile, Security, Product & Management, Emerging & Specialist.

#### Resume analysis result (per role)

```json
{
    "role": {
        "id": "ml_engineer",
        "title": "Machine Learning Engineer",
        "category": "Data & AI"
    },
    "ats": {
        "overall_score": 78.0,
        "recommendation": "Good Match",
        "breakdown": {
            "semantic_match":   {"score": 80, "feedback": "Strong backend experience but lacks cloud skills."},
            "experience_match": {"score": 70, "feedback": "2 years relevant experience, role requires 3-5."},
            "education_match":  {"score": 85, "feedback": "B.Tech Computer Science matches the requirement."}
        }
    },
    "skills_gap": {
        "matched": ["python", "pytorch", "docker"],
        "missing": ["tensorflow", "mlflow"],
        "nice_to_have_missing": ["kubernetes", "airflow"]
    },
    "quality_score": {
        "overall": 72,
        "breakdown": {"format": 75, "clarity": 70, "impact": 68, "brevity": 80}
    },
    "section_feedback": {
        "experience": {"score": 75, "feedback": "Good range but lacks metrics.", "improvements": ["Add quantifiable achievements"]},
        "education":  {"score": 90, "feedback": "Degree is well-aligned.", "improvements": []},
        "summary":    {"score": 60, "feedback": "Too generic.", "improvements": ["Tailor to ML roles", "Mention top tools"]},
        "skills":     {"score": 80, "feedback": "Strong core skills listed.", "improvements": ["Add MLflow"]}
    }
}
```

#### Interview questions (per type)

```json
{
    "status": "success",
    "questions": [
        "How do you handle database schema changes in a Django project?",
        "Can you describe a debugging strategy you used for a complex API issue?",
        "What is the difference between horizontal and vertical scaling?",
        "How would you implement rate limiting in a REST API?",
        "What design patterns do you follow when structuring a new backend app?"
    ]
}
```

#### Interview evaluation (per type)

```json
{
    "status": "success",
    "evaluation": {
        "overall_score": 85,
        "overall_summary": "Good effort overall, strong on basics but could go deeper on system design.",
        "evaluations": [
            {
                "question_number": 1,
                "question": "How do you handle database schema changes?",
                "score_out_of_10": 8,
                "feedback": "You mentioned migrations correctly but didn't discuss rollback strategies.",
                "ideal_answer": "A great answer would cover migration tools, version control of schemas, rollback plans, and zero-downtime migration strategies."
            }
        ]
    }
}
```

### UI ↔ Data Mapping Table

| UI Element | JSON Source |
|---|---|
| Candidate Name | `parsed_resume.name` |
| Primary Stack tags | `parsed_resume.skills[:3]` (first 3 skills) |
| Best Match role title | `role.title` of the result with highest `ats.overall_score` |
| Resume Score (big number) | `ats.overall_score` of best match |
| Roles Compared count | `len(selected_role_ids)` |
| Role card score % | `ats.overall_score` per role |
| ATS breakdown bars | `ats.breakdown.semantic_match.score`, `.experience_match.score`, `.education_match.score` |
| ATS breakdown text | `ats.breakdown.*.feedback` |
| Recommendation tag | `ats.recommendation` — values: "Strong Match", "Good Match", "Average Match", "Poor Match" |
| Matched skills (green tags) | `skills_gap.matched` |
| Missing skills (red tags) | `skills_gap.missing` |
| Nice-to-have missing | `skills_gap.nice_to_have_missing` |
| Quality score bars | `quality_score.breakdown.format`, `.clarity`, `.impact`, `.brevity` |
| Section feedback | `section_feedback.experience.feedback`, etc. |
| Improvements bullets | `section_feedback.*.improvements` (array of strings) |
| Upgrade tip paragraph | `upgrade_tip` (single string) |
| Interview question text | `questions[i]` (string) |
| Interview score per Q | `evaluation.evaluations[i].score_out_of_10` |
| Interview feedback per Q | `evaluation.evaluations[i].feedback` |
| Ideal answer per Q | `evaluation.evaluations[i].ideal_answer` |
| Interview overall score | `evaluation.overall_score` (out of 100) |
| Interview overall summary | `evaluation.overall_summary` |

### UX rules to follow

- **Max 3 roles selectable** — disable the UI after 3 are selected.
- **All 3 interview domains are mandatory** — there is no checkbox; the candidate automatically does the Behavioural, Technical, and Domain-specific questions.
- **PDF only** — reject non-PDF files on the frontend before uploading.
- **Sequential questions (one at a time)** — show ONE question on screen. Candidate types their answer and submits it. Only then does the next question appear. Never show multiple questions at once.
- **Progress indicator** — show "Question X of Y" (e.g., "Question 3 of 15") and optionally the current section label (e.g., "Behavioural").
- **No mid-interview feedback** — do NOT show scores or feedback after each answer. Collect ALL answers across ALL types, send to backend as one batch, then show the full feedback report.
- **Accumulate answers in a dict** — as the candidate answers each question, store it in a dict grouped by interview type: `{"behavioural": [{q, a}, ...], "technical": [...], ...}`. Send this dict to the backend after the last question.
- **Interview answers are text only** — provide a `<textarea>` input, no audio/video.
- **Dynamic Loading Text (Crucial for Demo/UX)** — Because complex flows (like Mode 3) make several sequential LLM calls, it can take 15–30 seconds. To make it feel fast, show a spinner whose text changes every few seconds. (e.g., *0s:* "Extracting resume data...", *4s:* "Matching against ATS algorithms...", *8s:* "Generating tailored interview questions...", *12s:* "Finalizing report..."). Do not just show a static "Loading..." screen.
- **Frontend State Optimization** — Do not force the user to re-upload their PDF for subsequent interviews. Cache the `parsed_resume` JSON in the browser's memory. If they finish an interview and start a second interview for a NEW role, just silently send the exact same cached JSON to the API along with the new `role_id`.
- **Error messages** — if the backend returns an error, display it to the user. For scanned PDFs, suggest these tools: [smallpdf.com](https://www.smallpdf.com), [ilovepdf.com](https://www.ilovepdf.com), [online2pdf.com](https://online2pdf.com)

---

## FOR THE AI TEAMMATES — Module Reference

> **This section is for the 2 AI/ML developers.** You own the `project-ai/` folder.

### Architecture overview

```
project-ai/
├── resume_parser/     → PDF text extraction + LLM structuring
├── job_roles/         → 28 roles from local JSON (0 API calls)
├── ats_scorer/        → ATS scoring (used internally by analyzer)
├── resume_analyzer/   → Full analysis + upgrade tip (primary module)
├── mock_interview/    → Question generation + answer evaluation
├── shared/            → Groq client, retry handler, validators
├── data/              → Sample PDFs + job_roles.json + skills_list.json
└── output/            → Auto-generated JSON outputs (gitignored)
```

### Key design decisions

1. **Single LLM call per analysis** — `analyze_resume` batches ATS + quality + feedback into 1 call (not 3 separate calls).
2. **Skills gap uses regex** — no API call needed for matching skills.
3. **Retry with exponential backoff** — all LLM calls go through `shared/retry_handler.py` (3 retries, 1s → 2s → 4s delay).
4. **Singleton Groq client** — `shared/groq_client.py` creates the client once and reuses it.
5. **Model configs** — temperature and max_tokens per module are centralized in `MODEL_CONFIGS` dict in `groq_client.py`.
6. **Questions are concise** — LLM is prompted to generate questions answerable in 3-4 lines of text.

### How to add a new module

1. Create a folder: `project-ai/new_module/`
2. Add `__init__.py`, your main `.py` file, and `prompt_templates.py`
3. Import the shared client: `from shared.groq_client import get_groq_client, MODEL_CONFIGS`
4. Use `call_with_retry()` for all LLM calls
5. Return plain Python dicts — the backend serializes them
6. Add a config entry in `MODEL_CONFIGS` in `groq_client.py`
7. Update this README

---

## API Function Reference (All 7 Functions)

### 1. `parse_resume(pdf_path)` — Resume Parser

Extracts structured data from a PDF resume using LLM.

```python
from resume_parser import parse_resume
result = parse_resume("uploads/resume.pdf")
```

**Input:** PDF file path (string)
**Output:**
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
**On error:** `{"error": "File not found: uploads/resume.pdf"}` or `{"error": "Could not extract text..."}`
**API calls:** 1

---

### 2. `get_all_roles()` — Job Roles

Returns lightweight list of 28 roles for frontend dropdown. Zero API calls.

```python
from job_roles import get_all_roles
roles = get_all_roles()
```

**Output:** List of `{"id", "title", "category", "experience_level"}` dicts
**API calls:** 0

---

### 3. `analyze_resume(parsed_resume, role_id)` — Resume Analyzer

Full analysis of a resume against one role. Call once per role.

```python
from resume_analyzer import analyze_resume
result = analyze_resume(parsed_resume, role_id="ml_engineer")
```

**Output:** Dict with `role`, `ats`, `skills_gap`, `quality_score`, `section_feedback`
**On error:** `{"error": "..."}`
**API calls:** 1 per role

---

### 4. `generate_upgrade_tip(all_role_results, parsed_resume)` — Upgrade Tip

Call ONCE after all `analyze_resume()` calls. Returns one actionable paragraph.

```python
from resume_analyzer import generate_upgrade_tip
tip = generate_upgrade_tip(all_results, parsed_resume)
```

**Output:** `{"upgrade_tip": "Your resume shows strong Python fundamentals..."}`
**API calls:** 1 total

---

### 5. `score_resume(parsed_resume, role_id)` — ATS Scorer (standalone)

Used internally by `analyze_resume()`. Backend does NOT need to call this separately.

```python
from ats_scorer import score_resume
result = score_resume(parsed_resume, role_id="ml_engineer")
```

**API calls:** 1

---

### 6. `generate_interview_questions(parsed_resume, role_id, interview_type)` — Question Generator

Generates 5 focused questions. Call once per interview type.

```python
from mock_interview import generate_interview_questions
result = generate_interview_questions(parsed_resume, "ml_engineer", "behavioural")
```

**Output:** `{"status": "success", "questions": ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"]}`
**On error:** `{"status": "error", "error": "..."}`
**API calls:** 1 per interview type

---

### 7. `evaluate_interview_answers(role_id, interview_type, questions_and_answers)` — Answer Evaluator

Evaluates 5 answers. Call once per interview type AFTER all answers are collected.

```python
from mock_interview import evaluate_interview_answers
qa_list = [
    {"question": "Q1?", "answer": "My answer..."},
    {"question": "Q2?", "answer": "My answer..."},
    {"question": "Q3?", "answer": "My answer..."},
    {"question": "Q4?", "answer": "My answer..."},
    {"question": "Q5?", "answer": "My answer..."}
]
result = evaluate_interview_answers("ml_engineer", "behavioural", qa_list)
```

**Output:**
```json
{
    "status": "success",
    "evaluation": {
        "overall_score": 85,
        "overall_summary": "Good effort overall...",
        "evaluations": [
            {
                "question_number": 1,
                "question": "Q1?",
                "score_out_of_10": 8,
                "feedback": "You answered this clearly...",
                "ideal_answer": "A perfect answer would have..."
            }
        ]
    }
}
```
**On error:** `{"status": "error", "error": "..."}`
**API calls:** 1 per interview type

---

### Input Validators (0 API calls)

```python
from shared.validators import validate_role_selection, validate_interview_types, validate_parsed_resume

# Enforce 3-role cap
validate_role_selection(["ml_engineer", "backend_engineer"])
# → {"valid": True}

validate_role_selection(["a", "b", "c", "d"])
# → {"valid": False, "error": "Too many roles selected (4). Maximum allowed is 3 per session."}

# Validate interview types
validate_interview_types(["behavioural", "technical"])
# → {"valid": True}

# Gate: resume must exist before interview
validate_parsed_resume(parsed_resume)
# → {"valid": True} or {"valid": False, "error": "..."}
```

---

## API Call Budget & Rate Limits

| Step | Module | Calls | Frequency |
|---|---|---|---|
| Parse resume | resume_parser | 1 | Once per session |
| Get all roles | job_roles | 0 | Once per session |
| Validate inputs | shared/validators | 0 | Once per session |
| Analyze per role | resume_analyzer | 1 per role | Max 3 roles |
| Global upgrade tip | resume_analyzer | 1 | Once after all roles |
| Generate Questions | mock_interview | 1 per type | Max 3 types |
| Evaluate Answers | mock_interview | 1 per type | Max 3 types |

**Groq Free Tier limits (llama-3.3-70b-versatile):**

| Limit | Value |
|---|---|
| Requests per day | 1,000 |
| Requests per minute | 30 |
| Tokens per day | 100,000 |

### Why the 3-Role Cap Matters

Without a cap, one user picking all 28 roles would burn 30+ API calls in a single session.

**Before (no cap) — worst case:**

| Mode | Calls/Session | Users/Day |
|---|---|---|
| Mode 1 (28 roles) | 30 | ~33 |
| Mode 3 (28 roles + 3 types) | 36 | ~27 |

**After (3-role cap) — maximum possible:**

| Mode | Calls/Session | Users/Day |
|---|---|---|
| Mode 1 (3 roles) | 5 | ~200 |
| Mode 2 (3 types) | 7 | ~142 |
| Mode 3 (3 roles + 3 types) | 11 | ~90 |

**Impact:**

| Metric | Before | After | Improvement |
|---|---|---|---|
| Max calls/session (Mode 3) | 36 | **11** | **70% fewer** |
| Max calls/session (Mode 1) | 30 | **5** | **83% fewer** |
| Users/day (Mode 3) | ~27 | **~90** | **3.3× more** |
| Users/day (Mode 1) | ~33 | **~200** | **6× more** |

> In practice, most candidates pick 1–2 roles → **150+ sessions/day** on free tier.

---

## End-to-End Flow — AI Module Only

### Mode 1 — Resume Analysis Only

```
PDF File
  │
  ▼
parse_resume(pdf_path)                  ─── 1 LLM call
  │  Returns: parsed_resume dict
  ▼
get_all_roles()                         ─── 0 LLM calls
  │  Returns: list of 28 roles
  ▼
validate_role_selection(role_ids)       ─── 0 calls (max 3 enforced)
  │
  ▼
┌─ FOR EACH selected role (max 3) ─────────────────┐
│  analyze_resume(parsed_resume, role_id)           │
│      → ATS score, skills gap, quality, feedback   │
│      → 1 LLM call per role                        │
└───────────────────────────────────────────────────┘
  │
  ▼
generate_upgrade_tip(all_results, parsed_resume)  ─── 1 LLM call
  │
  ▼
Final JSON → ATS scores + feedback + upgrade tip
```

### Mode 2 — Interview Only

```
PDF File (required gate)
  │
  ▼
parse_resume(pdf_path)                  ─── 1 LLM call
  │
  ▼
validate_parsed_resume(parsed_resume)  ─── 0 calls (gate check)
  │
  ▼
validate_interview_types(types)        ─── 0 calls (can be all 3)
  │
  ▼
┌─ FOR EACH interview type (up to 3) ───────────────┐
│  generate_interview_questions(                     │
│      parsed_resume, role_id, type)                 │
│      → 5 questions  │  1 LLM call per type        │
└────────────────────────────────────────────────────┘
  │  All questions generated upfront (up to 15 total)
  ▼
Backend sends flat ordered question list to frontend
  │
  ▼
┌─ SEQUENTIAL QUESTION DISPLAY ─────────────────────┐
│  Frontend shows Q1 → candidate answers → Q2 → ... │
│  One question at a time, no skipping ahead.        │
│  Answers accumulate in dict grouped by type:       │
│  {"behavioural": [{q,a},...], "technical": [...]}  │
└────────────────────────────────────────────────────┘
  │  After ALL questions answered
  ▼
Frontend sends complete answers dict to backend
  │
  ▼
┌─ FOR EACH interview type ─────────────────────────┐
│  evaluate_interview_answers(                       │
│      role_id, type, questions_and_answers)          │
│      → scores + feedback  │  1 LLM call per type  │
└────────────────────────────────────────────────────┘
  │
  ▼
Full feedback report shown at end (all types combined)
```

### Mode 3 — Both at Once

```
PDF File
  │
  ▼
parse_resume(pdf_path)                  ─── 1 LLM call
  │
  ▼
validate_role_selection + validate_interview_types (can be all 3)
  │
  ├──► Resume Analysis runs first:
  │      analyze_resume(parsed_resume, role_id)       ─── 1 LLM call
  │      generate_upgrade_tip(results, parsed_resume) ─── 1 LLM call
  │
  │    Analysis complete → Interview starts automatically:
  │
  ├──► generate_interview_questions (per type)        ─── 1 LLM call each
  │      → Questions shown ONE AT A TIME
  │      → Candidate answers each before next appears
  │      → Answers stored in dict grouped by type
  │
  │    After ALL questions answered:
  │
  └──► evaluate_interview_answers (per type)          ─── 1 LLM call each
         │
         ▼
    Combined Final Report
      ├── ATS score + skills gap + quality + section feedback
      ├── Upgrade tip
      └── Interview scores + per-question feedback + ideal answers
```

---

## End-to-End Flow — Full Project (Frontend + Backend + AI)

```
┌───────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vercel)                          │
│                                                                   │
│  1. User uploads PDF resume                                       │
│  2. User picks a mode: Analysis / Interview / Both                │
│  3. User selects role(s) (max 3) and interview types              │
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
│  3. Validates inputs using shared/validators.py                    │
│  4. Calls AI Module functions in sequence based on mode:           │
│                                                                   │
│     Mode 1: parse_resume → validate → analyze_resume (loop) →     │
│             generate_upgrade_tip → return JSON                    │
│                                                                   │
│     Mode 2: parse_resume → validate → generate_questions (loop) → │
│             collect answers → evaluate_answers (loop) →           │
│             return JSON                                           │
│                                                                   │
│     Mode 3: Mode 1 + Mode 2 combined → return combined JSON      │
│                                                                   │
│  5. Serializes AI output with json.dumps()                        │
│  6. Sends final JSON response back to Frontend                    │
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
│  shared/          → Groq client, retry logic, input validators    │
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
├── .env                      ← your API key, NEVER push this
├── .env.example              ← safe to push, no real key
├── .gitignore
├── README.md
├── requirements.txt
└── test_mock_interview.py    ← quick test script
```

---

## Stateless Architecture & Data Privacy

This AI module is designed to be **completely stateless**. There is no session storage, no database, and no accumulated history.

| Principle | How it's enforced |
|---|---|
| No session state | Every function call is self-contained. Pass all inputs every time. |
| No LLM memory | Every API call generates a fresh prompt. The LLM has zero knowledge of previous candidates. |
| No persistent files | `output/` JSON files are overwritten on every run. Never read stale files. |
| No stored API keys | `GROQ_API_KEY` is loaded from `.env` at runtime into RAM only. Never hardcoded or logged. |
| Input validation only | `shared/validators.py` enforces constraints as pure functions — no state stored. |
| No candidate data retention | Candidate resume data exists only in memory during the request lifecycle. |

**For backend:** Treat every request as brand new. Do not cache AI results across requests. Call `parse_resume` fresh for each new PDF upload.

**For frontend:** Do not store or display data from a previous user's session. Each page load = fresh state.

---

## Handling Scanned / Image-Based PDFs

The AI module only supports **text-based PDFs**. If a candidate uploads a scanned/image-based PDF, the parser returns:

```json
{"error": "Could not extract text. File may be scanned or image-based."}
```

**Backend:** Check for the `error` key → return HTTP 400 with the error message.

**Frontend:** Show this user-friendly message:

```
"We couldn't read your resume. This usually means your PDF is image-based
or scanned. Please convert it to a text-based PDF and try again."
```

Suggest these free tools to candidates:
- **SmallPDF (OCR feature):** https://www.smallpdf.com/ocr-pdf
- **ILovePDF (OCR feature):** https://www.ilovepdf.com/ocr-pdf
- **Online2PDF:** https://online2pdf.com
- **Google Drive:** Upload the PDF → Right-click → "Open with Google Docs" (This automatically performs high-quality OCR for free).

**What to search on Google for other options:**
- *"Convert scanned PDF to searchable PDF"*
- *"OCR PDF to text online free"*
- *"Convert image-based PDF to readable PDF"*
- *"Fix non-selectable text in PDF"*

---

## Common Errors & Fixes

| Error | Who sees it | Fix |
|---|---|---|
| `GROQ_API_KEY not found` | AI dev | Check `.env` file — no spaces around `=` |
| `ModuleNotFoundError` | AI dev | Run from `project-ai/` root, not a subfolder |
| `No module named 'groq'` | AI dev | Activate venv first — `.\.venv\Scripts\Activate.ps1` |
| `model decommissioned` | AI dev | Update `DEFAULT_MODEL` in `shared/groq_client.py` |
| `Could not extract text` | Backend/Frontend | PDF is scanned — show user the conversion tools |
| `Too many roles selected` | Backend | Call `validate_role_selection()` before `analyze_resume()` |
| `Invalid interview type` | Backend | Only allow `"behavioural"`, `"technical"`, `"domain-specific"` |
| `git push rejected` | All | Run `git pull origin main --rebase` then push again |
| `pip installs to AppData` | AI dev | Use `.\.venv\Scripts\python.exe -m pip install` instead |

---

At deployment time, the AI module will run as a separate Python service on Render using the included **FastAPI wrapper (`main.py`)**. The Spring Boot backend will call it via standard HTTP REST calls.

```
Frontend (Vercel) → Backend (Render, Java) → AI Module (Render, Python) → Groq API
```

> **Note:** Render free tier services "sleep" after 15 minutes of inactivity. Always open the URL at least 1 minute before your project demo to let the service "wake up".

---

**GitHub:** https://github.com/ishan-nag/smart-resume-analyzer-and-interview
**Last Updated:** Session 6 — FastAPI Microservice Implementation + Mandatory 15-Question Mock Interview Flow.
