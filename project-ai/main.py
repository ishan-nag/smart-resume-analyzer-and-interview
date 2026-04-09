import os
import shutil
from typing import List, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import existing AI modules
from resume_parser.resume_parser import parse_resume
from job_roles.job_roles import get_all_roles
from shared.validators import validate_role_selection, validate_interview_types
from resume_analyzer.resume_analyzer import analyze_resume, generate_upgrade_tip
from mock_interview.generator import generate_interview_questions
from mock_interview.evaluator import evaluate_interview_answers

# Initialize FastAPI App
app = FastAPI(
    title="Smart Resume Analyzer API",
    description="AI backend for Resume Analysis and Mock Interviews",
    version="1.0.0"
)

# Enable CORS for all domains so the Frontend/Backend devs can easily connect to it locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Data Models (Pydantic) for stricter validation
# ==========================================

class AnalyzeRequest(BaseModel):
    parsed_resume: Dict[str, Any]
    role_ids: List[str]

class InterviewGenerateRequest(BaseModel):
    parsed_resume: Dict[str, Any]
    role_id: str
    interview_types: List[str]

class QuestionAnswerPair(BaseModel):
    question: str
    answer: str
    
class InterviewEvaluateRequest(BaseModel):
    role_id: str
    submitted_answers: Dict[str, List[QuestionAnswerPair]]

# ==========================================
# Endpoint 1: Upload Resume
# ==========================================
@app.post("/api/upload")
async def upload_resume(file: UploadFile = File(...)):
    """Uploads a PDF resume, parses its text, and extracts skills."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    temp_path = f"tmp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        parsed_resume = parse_resume(temp_path)
        if "error" in parsed_resume:
            raise HTTPException(status_code=400, detail=parsed_resume["error"])
            
        return parsed_resume
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ==========================================
# Endpoint 2: Get Available Roles
# ==========================================
@app.get("/api/roles")
async def get_roles():
    """Returns the list of 28 available technical roles."""
    return {"roles": get_all_roles()}

# ==========================================
# Endpoint 3: Analyze Resume
# ==========================================
@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    """Analyzes a parsed resume against up to 3 chosen job roles."""
    validation = validate_role_selection(request.role_ids)
    if not validation.get("valid", False):
        raise HTTPException(status_code=400, detail=validation.get("error", "Invalid roles."))
        
    all_role_results = []
    for role_id in request.role_ids:
        result = analyze_resume(request.parsed_resume, role_id)
        if "error" not in result:
            all_role_results.append(result)
        else:
            # Safely handle bad role inputs (like "string") by returning a 400 Bad Request
            raise HTTPException(status_code=400, detail=f"Analysis failed: {result['error']}")
            
    if not all_role_results:
        raise HTTPException(status_code=500, detail="All role analyses failed unexpectedly.")
        
    tip_result = generate_upgrade_tip(all_role_results, request.parsed_resume)
    
    return {
        "status": "success",
        "analyses": all_role_results,
        "upgrade_tip": tip_result.get("upgrade_tip", "")
    }

# ==========================================
# Endpoint 4: Generate Mock Interview Questions
# ==========================================
@app.post("/api/interview/generate")
async def generate_interview(request: InterviewGenerateRequest):
    """Generates 5 interview questions per selected interview type."""
    validation = validate_interview_types(request.interview_types)
    if not validation.get("valid", False):
        raise HTTPException(status_code=400, detail=validation.get("error", "Invalid interview types."))
        
    all_questions = {}
    sequential_list = []
    
    for i_type in request.interview_types:
        result = generate_interview_questions(request.parsed_resume, request.role_id, i_type)
        if result.get("status") == "success":
            questions = result["questions"]
            all_questions[i_type] = questions
            for q in questions:
                sequential_list.append({"type": i_type, "question": q})
        else:
            raise HTTPException(status_code=400, detail=f"Failed generating questions for {i_type}. Ensure the role_id is valid.")
            
    return {
        "status": "success",
        "grouped_questions": all_questions,
        "sequential_questions": sequential_list
    }

# ==========================================
# Endpoint 5: Evaluate Interview Answers
# ==========================================
@app.post("/api/interview/evaluate")
async def evaluate_interview(request: InterviewEvaluateRequest):
    """Evaluates all candidate answers at the end of the interview."""
    results = {}
    
    for i_type, qa_pairs in request.submitted_answers.items():
        qa_dicts = [{"question": pair.question, "answer": pair.answer} for pair in qa_pairs]
        
        eval_result = evaluate_interview_answers(request.role_id, i_type, qa_dicts)
        if eval_result.get("status") == "success":
            results[i_type] = eval_result["evaluation"]
        else:
            results[i_type] = {"error": "Failed to evaluate due to bad inputs."}
            
    return {
        "status": "success",
        "reports": results
    }
