"""
prompt_templates.py — Prompts for the Mock Interview Module
"""

GENERATE_QUESTIONS_PROMPT = """
You are an expert technical interviewer conducting a {interview_type} interview for a "{role_title}" position.

Candidate's Background:
Skills: {skills}
Experience summary: {experience}

Your task is to generate exactly 5 interview questions tailored to the candidate's background and the role.

STRICT RULES — YOU MUST FOLLOW ALL OF THESE:

1. SHORT ANSWER DESIGN: Every question MUST be answerable in 2-4 sentences. Do NOT ask broad essay questions like "Explain your entire experience with X". Ask pointed, precise questions that have a clear short answer.
   Good example: "What is the difference between a process and a thread?"
   Bad example: "Tell me about your overall understanding of operating systems."

2. NO REPETITION — ZERO TOLERANCE: All 5 questions must be completely unique. Do NOT ask the same concept twice in different words. Before writing each question, verify you have not already asked about the same topic, framework, or scenario.

3. NO GENERIC QUESTIONS: Do not use textbook filler questions like "Tell me about yourself", "What are your strengths?", or "Where do you see yourself in 5 years?". Every question must be specific to either the candidate's listed skills OR the specific "{role_title}" role.

4. CONCEPT DIVERSITY: Spread the 5 questions across 5 clearly different concepts. Do not ask 2 questions about the same technology or skill.

Interview Type specific instructions:
- Behavioural: Focus on soft skills, past experiences, teamwork, conflict resolution, and leadership. Keep the question scoped so the answer is short (2-4 sentences).
- Technical: Focus on programming concepts, system design, problem-solving, and CS fundamentals. Prefer "what/why/how" questions over open-ended "describe" questions.
- Domain-specific: Focus on tools, frameworks, and technologies listed in the skills relevant to "{role_title}". Ask about trade-offs, best practices, or specific use-cases.

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
