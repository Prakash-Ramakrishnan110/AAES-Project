from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import uvicorn
import shutil
import os
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from PIL import Image
import requests
import json
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev, or specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary directory for uploaded images
UPLOAD_DIR = "temp_uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Ollama Configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma3:1b" # Updated to match user's installed model

def extract_json(text: str):
    """Deeply extracts and cleans JSON from LLM output."""
    text = text.strip()
    
    # 1. Remove markdown formatting if present
    if "```json" in text:
        text = text.split("```json")[-1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[-1].split("```")[0].strip()
        
    # 2. Find first open bracket
    start_idx = -1
    for i, char in enumerate(text):
        if char in ('{', '['):
            start_idx = i
            break
            
    if start_idx == -1:
        raise ValueError("No JSON object or array found in text")
        
    clean_text = text[start_idx:]
    
    # 3. Auto-close truncated JSON (count brackets and string states)
    stack = []
    in_string = False
    escape = False
    
    valid_length = len(clean_text)
    for i, char in enumerate(clean_text):
        if not in_string:
            if char in ('{', '['):
                stack.append(char)
            elif char == '}':
                if stack and stack[-1] == '{': stack.pop()
            elif char == ']':
                if stack and stack[-1] == '[': stack.pop()
            elif char == '"':
                in_string = True
        else:
            if char == '\\' and not escape:
                escape = True
                continue
            if char == '"' and not escape:
                in_string = False
            escape = False
            
        if not stack and not in_string:
            # We found a completely closed JSON object early
            valid_length = i + 1
            break

    clean_text = clean_text[:valid_length]
            
    # If still in string, close it
    if in_string:
        clean_text += '"'
        
    # Close any remaining brackets in reverse order
    while stack:
        open_bracket = stack.pop()
        clean_text += '}' if open_bracket == '{' else ']'
        
    # 4. Clean up common LLM JSON syntax errors (e.g., trailing commas)
    clean_text = re.sub(r',\s*([\]}])', r'\1', clean_text)
    
    # Replace Python boolean/None variations if LLM forgot JSON spec
    clean_text = re.sub(r'\bTrue\b', 'true', clean_text)
    clean_text = re.sub(r'\bFalse\b', 'false', clean_text)
    clean_text = re.sub(r'\bNone\b', 'null', clean_text)
    
    logger.info(f"Attempting JSON parse on text of length {len(clean_text)}")
    return json.loads(clean_text)

def query_ollama(prompt: str):
    """Sends a prompt to Ollama and returns the JSON response."""
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json" # Force JSON output mode if supported by model/version, otherwise instruct in prompt
        }
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        return response.json()['response']
    except requests.exceptions.RequestException as e:
        logger.error(f"Ollama Error: {e}")
        return None

import fitz  # PyMuPDF

def perform_ocr(image_path: str):
    """Extracts text from an image or PDF file."""
    try:
        ext = image_path.lower().split('.')[-1]
        
        # Handle PDF files
        if ext == 'pdf':
            doc = fitz.open(image_path)
            text = ""
            for i, page in enumerate(doc):
                # 1. Try extracting direct digital text
                page_text = page.get_text().strip()
                if page_text:
                    text += page_text + "\n"
                    continue
                
                # 2. If no text found, assume it is a scanned image inside a PDF and try OCR
                try:
                    pix = page.get_pixmap()
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    ocr_text = pytesseract.image_to_string(img).strip()
                    if ocr_text:
                        text += ocr_text + "\n"
                except Exception as e:
                    logger.warning(f"Skipping OCR for page {i+1} due to error: {e}")
            
            doc.close()
            return text.strip()
            
        # Handle Image files
        else:
            try:
                text = pytesseract.image_to_string(Image.open(image_path))
                return text.strip()
            except Exception as e:
                logger.error(f"Failed to extract text from image due to OCR error: {e}")
                return ""
            
    except Exception as e:
        logger.error(f"OCR/PDF Error: {e}")
        return ""

@app.get("/")
def read_root():
    return {"message": "ClassTrack Python AI Service Running (Ollama Enabled)"}

@app.post("/extract_text")
async def extract_text(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        student_answer_text = perform_ocr(file_path)
        
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return {"text": student_answer_text}
    except Exception as e:
        logger.error(f"Text Extraction Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract text from document")

@app.post("/evaluate/question")
async def evaluate_question(
    student_answer_text: str = Form(...), 
    model_answer: str = Form(...),
    question: str = Form(...),
    max_marks: int = Form(...),
    keywords: str = Form(default=""),
    rubric: str = Form(default="{}")
):
    try:
        # Parse rubric and format it for the prompt
        try:
            rubric_dict = json.loads(rubric)
            rubric_text = "\n".join([f"- {k}: {v} Marks" for k, v in rubric_dict.items()])
        except:
            rubric_text = "Standard academic evaluation criteria."

        # Construct keyword instructions
        keyword_instruction = ""
        if keywords and keywords.strip():
            keyword_instruction = f"""
            CRITICAL KEYWORD REQUIREMENT:
            The assignment explicitly demands that the student includes these concepts/keywords:
            "{keywords}"
            
            - You MUST check if the student's answer includes these keywords (or their direct synonyms).
            - If ANY of these keywords are completely missing, you MUST deduct points from their score.
            - You MUST explicitly mention the missing keywords in your `feedback` response.
            """

        # Prompt for single question evaluation
        prompt = f"""
        You are a strict academic grading engine.
        
        This evaluation is for ONE question only.
        
        Maximum Marks for this question: {max_marks}
        
        STRICT RULES:
        - The score MUST be a number between 0 and {max_marks}.
        - NEVER give marks greater than {max_marks}.
        - NEVER give negative marks.
        - If the answer is irrelevant to the question, give 0.
        - If the answer does not properly address the question, give 0.
        - If the answer is blank, meaningless, or unrelated, give 0.
        - Do NOT assume meaning if content is unrelated.
        - Be strict, logical, and objective.
        - Return ONLY valid JSON.
        - Do NOT include any text outside JSON.
        {keyword_instruction}
        
        Evaluation Rubric & Criteria:
        {rubric_text}
        
        Additionally, consider:
        1. Relevance
        2. Correctness
        3. Completeness
        4. Technical clarity
        
        Question:
        "{question}"
        
        Model Answer (for reference only):
        "{model_answer}"
        
        Student Answer:
        "{student_answer_text}"
        
        Return strictly in this format:
        {{
          "score": 0,
          "feedback": ""
        }}
        """
        
        llm_response_str = query_ollama(prompt)
        
        if not llm_response_str:
            return {
                "marks": 0, 
                "feedback": "AI Service Unavailable (Ollama not responding)."
            }

        try:
            # Parse JSON robustly from LLM
            result = extract_json(llm_response_str)
            
            # Map score to marks and apply STRICT CLAMPING
            ai_score = float(result.get("score", 0))
            if ai_score < 0:
                ai_score = 0
            if ai_score > max_marks:
                ai_score = max_marks
                
            # Rename score to marks for backend compatibility
            result["marks"] = round(ai_score)
            if "score" in result:
                del result["score"]
                
            return result
        except (json.JSONDecodeError, ValueError):
            logger.error(f"Failed to parse LLM JSON: {llm_response_str}")
            return {
                "marks": 0, 
                "feedback": "The uploaded content was determined to be completely irrelevant to the question.",
                "raw_llm": llm_response_str
            }

    except Exception as e:
        logger.error(f"Evaluation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate/plagiarism")
async def evaluate_plagiarism(
    target_text: str = Form(...),
    reference_texts: str = Form(...) # Assumes JSON array string of other submissions
):
    try:
        import json
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        
        refs = json.loads(reference_texts)
        if not refs or len(refs) == 0:
            return {"plagiarismScore": 0, "flaggedSource": None}
            
        # Combine target text with reference texts for TF-IDF
        documents = [target_text] + [ref["text"] for ref in refs]
        
        # Calculate TF-IDF vectors
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(documents)
        
        # Calculate cosine similarity between target (index 0) and all others
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        
        # Find the highest similarity
        max_sim_index = cosine_sim.argmax()
        max_sim_score = float(cosine_sim[max_sim_index]) * 100 # Convert to percentage
        
        # Return the highest score and the ID of the matched document
        return {
            "plagiarismScore": round(max_sim_score, 2),
            "flaggedSource": refs[max_sim_index].get("id") if max_sim_score > 0 else None
        }
    except Exception as e:
        logger.error(f"Plagiarism Evaluation Error: {e}")
        return {"plagiarismScore": 0, "flaggedSource": None, "error": str(e)}

from pydantic import BaseModel
from typing import List, Optional

# --- Request Models ---
class AssignmentRequest(BaseModel):
    department: Optional[str] = "General"
    semester: Optional[str] = "General"
    academic_year: Optional[str] = "2024-25"
    subject: str
    topic: str
    difficulty: str
    marks: int
    type: str = "Theory"
    keywords: Optional[str] = ""
    question_count: Optional[int] = 5
    rubric: Optional[dict] = {}

class QuizRequest(BaseModel):
    department: Optional[str] = "General"
    semester: Optional[str] = "General"
    subject: str
    topic: str
    count: int
    type: str = "MCQ"
    rubric: Optional[dict] = {}

class PPTRequest(BaseModel):
    department: Optional[str] = "General"
    semester: Optional[str] = "General"
    subject: str
    topic: str
    slide_count: int
    level: str
    rubric: Optional[dict] = {}

# --- Generation Endpoints ---

@app.post("/generate/assignment")
async def generate_assignment(req: AssignmentRequest):
    if req.type == "Python" or req.type == "C" or req.type == "Java" or req.type == "Programming":
        lang = req.type if req.type in ["Python", "C", "Java"] else "Python"
        prompt = f"""
        Generate a university-level {lang} programming assignment using the following context:

        Department: {req.department}
        Subject: {req.subject}
        Semester: {req.semester}
        Topic: {req.topic}
        Difficulty: {req.difficulty} (Easy, Medium, or Hard)
        Total Marks: {req.marks}

        Requirements:
        - The problem must require logical reasoning and be appropriate for the {req.difficulty} level.
        - If difficulty is 'Hard', include algorithms like sorting, trees, or complex data structures if applicable to the topic.
        - If difficulty is 'Easy', focus on basic syntax, loops, and simple logic.

        Provide:
        1. Problem statement
        2. Input format
        3. Output format
        4. Constraints
        5. Sample input/output
        6. At least 3 hidden test cases with mark distribution that sums exactly to {req.marks}.

        Return strictly in structured JSON format:
        {{
            "title": "",
            "problem_statement": "",
            "input_format": "",
            "output_format": "",
            "constraints": "",
            "sample_input": "",
            "sample_output": "",
            "test_cases": [
                {{"input": "", "expected_output": "", "marks": 0}}
            ],
            "total_marks": {req.marks}
        }}
        """
    else:
        prompt = f"""
        Generate a university-level assignment using the following academic context:

        Department: {req.department}
        Subject: {req.subject}
        Semester: {req.semester}
        Academic Year: {req.academic_year}
        Assignment Type: Theory / Descriptive
        Topic: {req.topic}
        Difficulty: {req.difficulty}
        Total Marks: {req.marks}
        Number of Main Questions to Generate: {req.question_count}
        Keywords expected in answers: {req.keywords if req.keywords else "Standard academic concepts"}
        
        Evaluation Rubric (Questions should be design to test these):
        {json.dumps(req.rubric, indent=2)}

        Requirements:
        Generate exactly {req.question_count} distinct questions.
        The questions must align strictly with the given topic and keywords.
        Each question must be clear, structured, and academically valid.
        
        Provide a structured model answer for each question that includes the requested keywords.

        Return output strictly in this JSON format matching the schema below:
        {{
            "title": "Assignment Title",
            "questions": [
                "1. [Question text here]",
                "2. [Question text here]"
            ],
            "modelAnswer": "[Detailed combined model answer for all questions, highlighting the keywords]"
        }}
        """

    response = query_ollama(prompt)
    if not response:
        raise HTTPException(status_code=503, detail="AI Service Unavailable")
    
    try:
        data = extract_json(response)
        
        # Normalize for frontend
        if "problem_statement" in data:
             data["description"] = data["problem_statement"]
        
        # Fallback mappings if the LLM hallucinated the old structure
        if "model_answer" in data and "modelAnswer" not in data:
            data["modelAnswer"] = data["model_answer"]
        if "question" in data and "questions" not in data:
            data["questions"] = [data["question"]]
            
        return data
    except Exception as e:
        logger.error(f"Assignment Parsing Error: {e}")
        logger.error(f"Raw Output: {response}")
        return {"error": "Failed to parse AI response", "raw": response}

@app.post("/generate/quiz")
async def generate_quiz(req: QuizRequest):
    prompt = f"""
    Generate an academic quiz using:

    Department: {req.department}
    Subject: {req.subject}
    Semester: {req.semester}
    Topic: {req.topic}
    Number of Questions: {req.count}
    Difficulty: "Medium"

    Requirements:
    - Generate EXACTLY {req.count} multiple choice questions.
    - The "options" array MUST contain exactly 4 string elements corresponding to the choices.
    - Do NOT put the correct answer or the explanation inside the "options" array.
    - Provide the "correct_answer" and "explanation" as separate fields.

    Return ONLY a valid JSON object matching the exact structure below. Do not include markdown:
    {{
        "quiz_title": "string",
        "questions": [
            {{
                "question": "string",
                "options": ["string", "string", "string", "string"],
                "correct_answer": "string",
                "explanation": "string"
            }}
        ]
    }}
    """
    response = query_ollama(prompt)
    if not response:
        raise HTTPException(status_code=503, detail="AI Service Unavailable")

    try:
        return extract_json(response)
    except Exception as e:
        return {"error": "Failed to parse AI response", "raw": response}

@app.post("/generate/ppt")
async def generate_ppt(req: PPTRequest):
    prompt = f"""
    Generate structured academic slide content using:

    Department: {req.department}
    Subject: {req.subject}
    Semester: {req.semester}
    Topic: {req.topic}
    Number of Slides: {req.slide_count}

    Requirements:
    Each slide must contain:
    Slide title
    4–6 bullet points
    Content must match semester level
    Include summary slide at end

    Return structured format:
    {{
        "presentation_title": "",
        "slides": [
            {{
                "slide_title": "",
                "bullet_points": []
            }}
        ]
    }}
    """
    response = query_ollama(prompt)
    if not response:
        raise HTTPException(status_code=503, detail="AI Service Unavailable")

    try:
        return extract_json(response)
    except Exception as e:
        return {"error": "Failed to parse AI response", "raw": response}

class DoubtRequest(BaseModel):
    question: str
    context: str

@app.post("/ask_doubt")
async def ask_doubt(req: DoubtRequest):
    if not req.question or not req.context:
        raise HTTPException(status_code=400, detail="Missing question or context")
    if len(req.question) > 500:
        raise HTTPException(status_code=400, detail="Question is too long")

    prompt = f"""You are 'ClassTrack AI', an intelligent academic assistant designed to help students understand their study materials.

STRICT RULES:
1. You must ONLY answer the student's question based on the provided context.
2. If the answer is not contained in the context, you MUST say "I cannot answer this based on the provided notes." Do not generate external information.
3. Be concise, educational, and clear.
4. If asked to summarize, summarize the provided context only.

Context:
{req.context}

Student Question:
{req.question}

Your Answer:"""

    response = query_ollama(prompt)
    if not response:
        raise HTTPException(status_code=503, detail="AI Service Unavailable")
    return {"answer": response}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
