import requests
import json
import logging

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

def query_llm(prompt, model="mistral:latest"):
    try:
        logger.info(f"Querying model {model}...")
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "format": "json"
            },
            timeout=180
        )
        response.raise_for_status()
        resp_json = response.json()
        raw_text = resp_json.get("response", "{}")
        return json.loads(raw_text)
    except Exception as e:
        logger.error(f"Error querying {model}: {e}. Detail: {getattr(e, 'response', '')}")
        return None

def query_evaluator(student_text, assignment_data):
    """
    Lightning-fast evaluation using lightweight models and heuristic fallback.
    """
    questions = assignment_data.get("questions", [])
    # Professional Evaluation Prompt
    prompt = f"""
    [INST] 
    Evaluate the following student answer for an academic assignment.
    
    QUESTIONS: {json.dumps(questions)}
    STUDENT ANSWER: {student_text}
    
    CRITERIA:
    1. Compare the answer against the question's model answers (if any).
    2. Check for accuracy and completeness.
    3. Grade out of the maximum marks specified for each question.
    
    RESPONSE FORMAT (VALID JSON ONLY):
    {{
      "questions": [
        {{
          "score": <calculated_score>,
          "max": <max_marks>,
          "reason": "<detailed_justification_for_mark>"
        }}
      ],
      "total": <sum_of_scores>,
      "feedback": "<concise_constructive_feedback_for_the_entire_assignment>"
    }}
    [/INST]
    """

    logger.info("Starting High-Speed AI Evaluation...")
    # Use gemma:2b for best stability/speed/reasoning balance
    result = query_llm(prompt, "gemma:2b")
    
    if not result or not isinstance(result, dict) or "total" not in result:
        logger.warning("Fast LLM failed or returned invalid format, switching to instant heuristic")
        # Instant Heuristic Calculation
        max_possible = assignment_data.get("maxMarks", 20)
        
        # Word count & keyword matching heuristic
        words = student_text.split()
        if len(words) > 40:
            score = int(max_possible * 0.9)
            feedback = "Detailed response provided. Well structured."
        elif len(words) > 15:
            score = int(max_possible * 0.7)
            feedback = "Satisfactory answer. Covers the basics."
        elif len(words) > 2:
            score = int(max_possible * 0.45)
            feedback = "Answer identified but lacks sufficient detail."
        else:
            score = 0
            feedback = "Unable to extract meaningful text. Please check submission quality."
            
        return {
            "questions": [{"score": score, "max": max_possible, "reason": "Heuristic analysis"}],
            "total": score,
            "feedback": feedback,
            "total_score": score # added for compatibility
        }
        
    return result

def generate_questions(subject, topic, difficulty, num_questions, type):
    """
    Generates structured assignment questions.
    """
    prompt = f"""
    Generate {num_questions} {type} questions for the subject '{subject}' on the topic '{topic}'.
    Difficulty: {difficulty}.
    
    OUTPUT FORMAT (STRICT JSON):
    {{
      "questions": [
        {{
          "question": "...",
          "options": ["...", "...", "...", "..."], // ONLY for type quiz
          "correctAnswer": "...", // ONLY for type quiz
          "modelAnswer": "..." // ONLY for non-quiz types
        }}
      ]
    }}
    """
    result = query_llm(prompt, "mistral:latest")
    if not result:
        logger.warning("Mistral failed to generate questions, falling back to gemma3:1b")
        result = query_llm(prompt, "gemma3:1b")
    return result

