# 🚀 Smart Resume Analyzer & Mock Interview Platform

Welcome to the ultimate AI-powered career assistant. This application provides students and job-seekers with enterprise-grade resume scoring against specific job roles, instantly followed by a tailored 15-question interactive mock interview. 

This repository contains the complete full-stack architecture separated into three distinct microservices perfectly orchestrated to create a highly scalable stateless application.

---

## 📑 Table of Contents

1. [Architecture & Modules](#1-architecture--modules)
2. [What the Product Does — The 3 Modes](#2-what-the-product-does--the-3-modes)
3. [UX Rules & Application Constraints](#3-ux-rules--application-constraints)
4. [Git Workflow (All Teammates)](#4-git-workflow-all-teammates)
5. [How to Run the Application Locally](#5-how-to-run-the-application-locally)
   - [Method 1: The 1-Click Auto-Launcher](#method-1-the-1-click-auto-launcher-windows)
   - [Method 2: Manual Terminal Launch](#method-2-manual-terminal-launch)
6. [Stateless Architecture & Data Privacy](#6-stateless-architecture--data-privacy)

---

## 1. 🏗️ Architecture & Modules

This project adheres to a strict microservice pattern to ensure maximum scalability, zero data-liability (stateless processing), and clear separation of concerns.

| Component | Technology | Directory | Responsibility |
|---|---|---|---|
| **Frontend UI** | React 19, Vite, Tailwind CSS | `project-frontend/` | The beautifully designed dark-mode user interface. Handles file uploads, the sequential 15-question interview player, and rendering all complex feedback graphs. |
| **Backend API** | Java 17, Spring Boot, Maven | `project-backend/` | The orchestrator. Intercepts frontend requests and routes them to the AI microservice. Handles core application networking. |
| **AI Engine** | Python 3.10+, FastAPI, Groq LLM API | `project-ai/` | The absolute "Brain". Completely stateless. Extracts PDF text, computes highly accurate ATS scores, and generates/evaluates custom mock interview questions using LLaMA-3 70B. |

**Communication Flow:**
```
Frontend (React)  ──HTTP──►  Backend (Java)  ──Python calls──►  AI Module (FastAPI)  ──HTTPS──►  Groq LLM API
```

---

## 2. ⚡ What the Product Does — The 3 Modes

The product offers three strictly distinct interview and analysis flows.

### Mode 1 — Resume Analysis Only
> *"I want to know how my resume scores against specific job roles."*
- User uploads PDF → Selects up to 3 roles → Gets ATS scores, skills gap analysis, quality scores, section-by-section feedback, and a global upgrade tip.
- **No interview. Just resume feedback.**

### Mode 2 — Mock Interview Only
> *"I want to practice interview questions for a specific role."*
- User uploads PDF (required to gather background) → Selects 1 role.
- Interview automatically generates 15 questions across 3 domains (Behavioural, Technical, Domain-specific).
- Gets questions **one at a time** → Answers each question before the next one appears.
- Gets full feedback report with scores, feedback per question, and ideal answers only after completion.
- **No deep resume analysis. Just interview practice.**

### Mode 3 — The Full Gauntlet (Both)
> *"I want the full experience — analyze my resume AND interview me."*
- User uploads PDF → Selects 1 role.
- Resume analysis runs first → Interview starts seamlessly afterward.
- Gets a combined final report with both resume analysis results AND interview feedback.

---

## 3. 🔒 UX Rules & Application Constraints

These rules are enforced heavily across the stack to ensure an authentic experience:

- **Max Roles per Session:** 3 roles. Choosing more will result in an AI validation error.
- **Valid Interview Types:** "behavioural", "technical", "domain-specific" only. All 3 are mandatory in an interview.
- **Sequential Pacing:** During an interview, the candidate sees **one question at a time**. They must answer Q1 before Q2 appears. They cannot see all 15 questions at once.
- **Text-based PDFs only:** Scanned/image PDFs are immediately rejected by the parser to prevent hallucinations.
- **No Mid-Interview Feedback:** Users do not see scores or feedback after each answer. All feedback is batched and shown at the very end.

---

## 4. 🔀 Git Workflow (All Teammates)

This project strictly utilizes branch-based Git flow to prevent merge conflicts.

**Step 1 — Create your own branch (NEVER push directly to main)**
```bash
# Format: your-role/feature-name
git checkout -b frontend/role-selection-page
git checkout -b backend/resume-upload-api
git checkout -b ai/mock-interview-module
```

**Step 2 — Make changes, commit, push**
```bash
git status                             
git add .                              
git commit -m "Add resume endpoint"    
git push origin your-branch-name       
```

**Step 3 — Open a Pull Request**
Go to GitHub, click **"Compare & pull request"**, and assign the Team Lead for review. Do not merge your own PR.

---

## 5. 💻 How to Run the Application Locally

### Prerequisites
Ensure your system has the following installed:
- **Node.js** (v18+) & **npm**
- **Python** (3.10+) 
- **Java JDK** (17+) (e.g., Eclipse Adoptium or Oracle)

### Method 1: The 1-Click Auto-Launcher (Windows)
We have provided a convenience script that automatically opens 3 terminal tabs and boots the entire stack.
1. Clone this repository to your local machine.
2. Navigate to the root folder.
3. Double-click the **`start_app.bat`** file.
4. Wait ~30 seconds for all three services to boot up.
5. Open your browser to `http://localhost:3000`.

### Method 2: Manual Terminal Launch
If you prefer a manual startup or are developing on macOS/Linux, open 3 separate terminal windows and run the following in parallel:

**Terminal 1 — Python AI (Port 8000)**
```bash
cd project-ai
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Java Backend (Port 8080)**
*(Ensure your `JAVA_HOME` environment variable is correctly mapped to your JDK 17 installation).*
```bash
cd project-backend
# If you have Maven installed globally:
mvn spring-boot:run
```

**Terminal 3 — React Frontend (Port 3000)**
```bash
cd project-frontend
npm install
npm run dev
```

---

## 6. 🛡️ Stateless Architecture & Data Privacy

To prevent expensive memory leaks, avoid database deployment headaches, and maintain extremely fast cloud scalability, the AI Engine (`project-ai`) strictly **never** saves candidate resumes to a hard drive or database. 

Instead, the **Frontend UI** temporarily caches the parsed resume in local browser memory and simply sends it along within the HTTP payload whenever AI evaluations are needed. 

Because of this specific batch-processing design:
1. **Zero Liability:** No candidate data is permanently stored, keeping the application fully privacy-compliant by default.
2. **Infinite Scale:** You can deploy 10 load-balanced AI microservices, and it will never matter which server receives a request because no session state is required.
3. **Low API Cost:** We only query Groq twice per interview (once to generate 15 questions, once to evaluate 15 answers), dramatically preserving free-tier rate limits compared to traditional single-message chatbots.
