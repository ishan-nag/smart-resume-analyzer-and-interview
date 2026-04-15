# Smart Resume Analyzer & Mock Interview Tool — Frontend Module

The Frontend module is the user-facing layer of this project. It handles **file uploads**, **role selection**, **mock interview interactive flow**, and **formatting complex JSON feedback into beautiful UI**. It is built using **React 19**, **Vite**, **Tailwind CSS**, and **React Router**.

> **This README is the single source of truth for the Frontend.** Every teammate should read their dedicated section below by clicking the sections in the Table of Contents.

---

## Table of Contents

1. [Team & Responsibilities](#team--responsibilities)
2. [Project Repository Structure](#project-repository-structure)
3. [Git Workflow (All Teammates)](#git-workflow-all-teammates)
4. [Frontend Setup & Running Locally](#frontend-setup--running-locally)
5. [What the UI Does — The 3 Modes](#what-the-ui-does--the-3-modes)
6. [Pages & Routing](#pages--routing)
7. [UX Rules & Constraints](#ux-rules--constraints)
8. [FOR THE BACKEND DEVELOPER — Integration Guide](#for-the-backend-developer--integration-guide)
9. [UI ↔ Data Mapping](#ui--data-mapping)

---

## Team & Responsibilities

| Role | Count | Technology | Folder | What they build |
|---|---|---|---|---|
| **AI/ML** | 2 people | Python 3.10+ | `project-ai/` | Resume parser, ATS scorer, analyzer, mock interview engine |
| **Backend (Team Lead)** | 1 person | Java Spring Boot | `project-backend/` | REST API, PDF upload, session orchestration |
| **Frontend** | 1 person | React + Vite + Tailwind | `project-frontend/` | User interface, file upload, interactivity, results display |

**Key rule:** Each teammate works ONLY in their own folder. Do NOT edit files in another teammate's directory.

**Communication flow:**
```
Frontend  ──HTTP──►  Backend  ──Python calls──►  AI Module  ──HTTPS──►  Groq API
```
- Frontend **never** calls the AI module directly.
- Frontend completely manages the display logic and interview question pacing.
- Backend is the orchestrator connecting the Frontend to the AI service.

---

## Project Repository Structure

```
smart-resume-analyzer-and-interview/
├── project-ai/         ← Python AI module
├── project-backend/    ← Java Spring Boot (Team Lead)
└── project-frontend/   ← UI (Frontend Teammate)
```

---

## Git Workflow (All Teammates)

### Step 1 — Clone the repo
```bash
git clone https://github.com/ishan-nag/smart-resume-analyzer-and-interview.git
cd smart-resume-analyzer-and-interview
```

### Step 2 — Create your own branch (NEVER push to main)
```bash
git checkout -b frontend/feature-name
```

### Step 3 — Make changes, commit, push
```bash
git add .
git commit -m "Update layout component"
git push origin frontend/feature-name
```

### Step 4 — Open a PR and Sync
1. Open a Pull Request on GitHub.
2. Wait for the Backend/Team Lead to review and merge your PR.
3. Stay updated by pulling changes from `main` frequently.

---

## Frontend Setup & Running Locally

Requirements: **Node.js (18+)** and **npm**

```bash
# 1. Go into the Frontend folder
cd project-frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

The application will be available at **http://localhost:3000** (or similar port defined by Vite).

### Important Commands
- `npm run dev` - Starts development server.
- `npm run build` - Creates production build.
- `npm run lint` - Lints code with ESLint.

---

## What the UI Does — The 3 Modes

### Mode 1 — Resume Analysis Only
Prompts the user to upload a PDF and pick up to 3 roles. Displays ATS score cards, skills gap, quality score, and comprehensive section feedback. No interview sequence is triggered.

### Mode 2 — Mock Interview Only
Upload PDF & Select exactly 1 role. Interactively steps the candidate through exactly 15 questions sequentially (one at a time) across 3 domains. Feedback is completely hidden until all answers are submitted. 

### Mode 3 — Both at Once
Combines Mode 1 and 2. The resume score is generated immediately, followed by the seamless transition into the 15-question interview flow.

---

## Pages & Routing

| Route | Component | What it does |
|---|---|---|
| `/` | `Upload.jsx` | Landing page. Upload PDF and choose the interaction mode. |
| `/dashboard` | `Dashboard.jsx` | Displays available roles. Let user pick max 3 for matching. |
| `/interview` | `Interview.jsx` | Sequential interview player. 1 Q at a time. Candidate inputs text. |
| `/results` | `Results.jsx` | Displays complete feedback for ATS scores and interview grades. |

---

## UX Rules & Constraints

- **Only PDFs** - We must reject `.docx`, `.png`, or any other format before hitting the backend.
- **Max 3 Roles** - The UI explicitly disables role checkboxes when 3 are clicked.
- **Sequential Pacing** - We strictly display one question at a time. The candidate types in a text area, clicks Next, and *then* sees Q2. They cannot see all 15 questions at once.
- **Client Cache Optimization** - Once the `parsed_resume` JSON is fetched, it is kept in React Context. Re-running analytics across another role does not require uploading the PDF again.
- **Dynamic Loading State** - Since AI APIs take ~20 seconds to reply, we cycle loading text (e.g., "Extracting text...", "Matching ATS..."). Do not show a static loading spinner.

---

## FOR THE BACKEND DEVELOPER — Integration Guide

> **This is how the Frontend expects to interact with you.** 

1. We upload files via **POST** `/api/upload` (multipart form-data).
2. We get roles from **GET** `/api/roles`.
3. We send a batched JSON of answers to **POST** `/api/interview/evaluate` mapped strictly like:
```json
{
  "role_id": "ml_engineer",
  "submitted_answers": {
    "behavioural": [
      {"question": "Tell me about...", "answer": "I..."}
    ]
  }
}
```

Ensure CORS is enabled over `localhost:3000` (or `"*"`) so Vite can seamlessly communicate with the Spring Boot server during local testing!

---

## UI ↔ Data Mapping

The UI heavily relies on the JSON shapes forwarded by the Backend from the AI modules.

| UI Element | JSON Source |
|---|---|
| Big Score Number | `ats.overall_score` |
| Primary Tags | `skills_gap.matched` |
| Missing Alerts | `skills_gap.missing` |
| Progress Indicator | Derived by Frontend (`current_q_index / 15`) |
| Feedback List | `evaluation.evaluations[i].feedback` |
| Question Text | `questions[i]` |
