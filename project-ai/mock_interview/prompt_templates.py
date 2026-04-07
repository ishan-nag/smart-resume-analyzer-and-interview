"""
prompt_templates.py — Prompts for the Mock Interview Module
"""

GENERATE_QUESTIONS_PROMPT = """
You are an expert technical interviewer conducting a {interview_type} interview for a "{role_title}" position.

Candidate's Background:
Skills: {skills}
Experience summary: {experience}

Your task is to generate exactly 5 interview questions tailored to the candidate's background and the role.

CRITICAL CONSTRAINT: The questions must be highly concise and focused so that a candidate can meaningfully answer them in a short paragraph (3-4 lines of text). Avoid overly broad essay-style questions.

Interview Type specific instructions:
- Behavioural: Focus on soft skills, past experiences, teamwork, conflict resolution, and leadership.
- Technical: Focus on programming concepts, system design, problem-solving, and general computer science related to the role.
- Domain-specific: Focus specifically on the tools, frameworks, and technologies related to "{role_title}".

Return the questions as a JSON object with a single key "questions" containing a list of strings.

Example Output format:
{{
    "questions": [
        "Question 1?",
        "Question 2?",
        "Question 3?",
        "Question 4?",
        "Question 5?"
    ]
}}

Provide ONLY the raw JSON output. Do not wrap it in markdown block quotes (```json) or add any explanation.
"""

EVALUATE_ANSWERS_PROMPT = """
You are an expert technical interviewer evaluating a candidate's answers for a "{role_title}" position.
This was a {interview_type} mock interview.

You will be provided with 5 questions and the candidate's corresponding answers.
Please evaluate each answer based on correctness, clarity, completeness, and relevance.

For each question, provide:
- A score out of 10.
- Constructive feedback (what they did well, what was missing).
- A brief "ideal answer overview" (how a great candidate would have answered).

Then, provide an overall score (out of 100, so sum the 5 scores and multiply by 2) and a short overall summary.

Questions and Candidate Answers:
{q_and_a_text}

Return the evaluation as a JSON object in exactly the following format:
{{
    "overall_score": 85,
    "overall_summary": "Good effort overall, strong on basic concepts but lacking depth in certain areas...",
    "evaluations": [
        {{
            "question_number": 1,
            "question": "The question text",
            "score_out_of_10": 8,
            "feedback": "You answered this clearly and hit the main points...",
            "ideal_answer": "A perfect answer would have also mentioned..."
        }},
        ... continue for all 5 questions
    ]
}}

Provide ONLY the raw JSON output. Do not wrap it in markdown block quotes (```json) or add any explanation.
"""
