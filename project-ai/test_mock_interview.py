import os
import json
import traceback

def run_tests():
    try:
        from mock_interview.generator import generate_interview_questions
        from mock_interview.evaluator import evaluate_interview_answers

        print("Testing Generator...")
        import glob
        resume_files = sorted(glob.glob("output/parsed_resume*.json"))
        if not resume_files:
            print("ERROR: No parsed resume files found in output/. Run resume_parser first.")
            return
            
        resume_path = resume_files[0]
        print(f"Using actual resume: {resume_path}")
        with open(resume_path, "r", encoding="utf-8") as f:
            mock_resume = json.load(f)

        gen_result = generate_interview_questions(
            parsed_resume=mock_resume,
            role_id="backend_engineer",
            interview_type="technical"
        )
        
        print("\n=== Generator Result ===")
        print(json.dumps(gen_result, indent=2))
        
        if gen_result.get("status") == "success":
            print("\nTesting Evaluator with some mock answers...")
            
            questions = gen_result["questions"]
            qa_list = [
                {"question": questions[0], "answer": "I would use a relational database and create indexes."},
                {"question": questions[1], "answer": "I have used Python mostly with Django for the backend."},
                {"question": questions[2], "answer": "To optimize it, I'd probably use caching with Redis."},
                {"question": questions[3], "answer": "I am familiar with REST APIs but not much with GraphQL."},
                {"question": questions[4], "answer": "I try to write unit tests for my code to catch bugs early."}
            ]
            
            eval_result = evaluate_interview_answers(
                role_id="backend_engineer",
                interview_type="technical",
                questions_and_answers=qa_list
            )
            
            print("\n=== Evaluator Result ===")
            print(json.dumps(eval_result, indent=2))
        else:
            print("\nSkipping Evaluator test because Generator failed.")
            
    except Exception as e:
        print("\nError running tests:")
        traceback.print_exc()

if __name__ == "__main__":
    run_tests()
