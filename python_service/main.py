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
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")
ADVANCED_OLLAMA_MODEL = os.getenv("ADVANCED_OLLAMA_MODEL", "qwen3:8b")

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

def query_ollama(prompt: str, model: str = None):
    """Sends a prompt to Ollama and returns the JSON response."""
    selected_model = model if model else OLLAMA_MODEL
    try:
        payload = {
            "model": selected_model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "num_predict": 2048 # Increase output limit to prevent truncation for long lists
            }
        }
        logger.info(f"Querying model: {selected_model}")
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        return response.json()['response']
    except requests.exceptions.RequestException as e:
        logger.error(f"Ollama Error: {e}")
        return None

import fitz  # PyMuPDF
from PIL import ImageEnhance, ImageFilter, ImageOps

def preprocess_image_for_ocr(img):
    """Deep academic preprocessing for OCR."""
    # 1. Convert to Grayscale
    img = img.convert('L')
    # 2. Normalize contrast automatically
    img = ImageOps.autocontrast(img)
    # 3. Enhance Contrast significantly
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.5)
    # 4. Sharpen for better character definition
    img = img.filter(ImageFilter.SHARPEN)
    img = img.filter(ImageFilter.DETAIL)
    return img

def perform_ocr(image_path: str):
    """Extracts text from an image or PDF file using High-Res 3.5x scaling and adaptive PSM."""
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
                
                # 2. Scanned PDF logic
                try:
                    # Upgrade to 3.5x zoom (High fidelity)
                    zoom = 3.5
                    mat = fitz.Matrix(zoom, zoom)
                    pix = page.get_pixmap(matrix=mat)
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    
                    img = preprocess_image_for_ocr(img)
                    
                    # Adaptive PSM: Start with PSM 6 (Uniform Block)
                    ocr_text = pytesseract.image_to_string(img, config=r'--oem 3 --psm 6').strip()
                    
                    # Fallback if text is suspiciously short (potential layout issue)
                    if len(ocr_text) < 50:
                        ocr_text = pytesseract.image_to_string(img, config=r'--oem 3 --psm 3').strip()
                        
                    if ocr_text:
                        text += ocr_text + "\n"
                except Exception as e:
                    logger.warning(f"Skipping OCR for page {i+1} due to error: {e}")
            
            doc.close()
            return text.strip()
            
        # Handle Image files
        else:
            try:
                img = Image.open(image_path)
                img = preprocess_image_for_ocr(img)
                
                # Adaptive PSM for images
                ocr_text = pytesseract.image_to_string(img, config=r'--oem 3 --psm 6').strip()
                if len(ocr_text) < 50:
                    ocr_text = pytesseract.image_to_string(img, config=r'--oem 3 --psm 3').strip()
                
                return ocr_text
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
        # ... (programming prompt remains same)
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
    elif req.type == "Seminar":
        prompt = f"""
        Act as an academic assistant. Generate exactly {req.question_count} presentation topics.

        CONTEXT:
        Subject: {req.subject}
        Topic: {req.topic}

        RULES:
        1. OUTPUT EXACTLY {req.question_count} TOPICS.
        2. USE NUMBERING (1., 2., 3., etc) to keep track of the count.
        3. Professional titles only.
        4. Provide one 'modelAnswer' summarizing the guidelines.

        JSON FORMAT:
        {{
            "title": "Seminar: {req.subject}",
            "questions": ["1. Topic A", "2. Topic B", "3. Topic C"],
            "modelAnswer": "Brief guidelines."
        }}
        """
    else:
        prompt = f"""
        Generate a university-level descriptive theory assignment.
        
        CONTEXT:
        Department: {req.department}
        Subject: {req.subject}
        Semester: {req.semester}
        Topic: {req.topic}
        Difficulty: {req.difficulty}
        Total Marks: {req.marks}
        Desired Question Count: {req.question_count}
        Keywords to include: {req.keywords if req.keywords else "Standard academic concepts"}
        
        STRICT REQUIREMENTS:
        1. Generate EXACTLY {req.question_count} distinct questions. Use numbering (1., 2., 3...) to ensure accuracy.
        2. Each question must be a complete academic sentence.
        3. Align questions with {req.difficulty} difficulty level.
        4. Provide a detailed combined model answer for ALL questions.
        
        OUTPUT FORMAT (Return strictly valid JSON):
        {{
            "title": "[A compelling academic title for the assignment]",
            "questions": [
                "[Question 1 text]",
                "[Question 2 text]"
            ],
            "modelAnswer": "[Detailed combined response showing how to answer these questions using the specified keywords]"
        }}
        """

    # Select model based on difficulty and type
    is_hard = req.difficulty.lower() == "hard"
    is_seminar = req.type == "Seminar"
    target_model = ADVANCED_OLLAMA_MODEL if (is_hard or is_seminar) else OLLAMA_MODEL

    response = query_ollama(prompt, model=target_model)
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
    Generate a university-level MCQ quiz.

    CONTEXT:
    Subject: {req.subject}
    Topic: {req.topic}
    Difficulty: Medium
    Count: {req.count}

    STRICT REQUIREMENTS:
    1. Generate EXACTLY {req.count} multiple choice questions.
    2. "options" must be a list of EXACTLY 4 strings.
    3. DO NOT include "A.", "B.", "C." prefixes in options.
    4. "correct_answer" must exactly match one of the strings in the "options" list.
    
    OUTPUT FORMAT (Return strictly valid JSON):
    {{
        "quiz_title": "[Title of the Quiz]",
        "questions": [
            {{
                "question": "[Question text]",
                "options": ["Opt1", "Opt2", "Opt3", "Opt4"],
                "correct_answer": "Opt1",
                "explanation": "[Brief academic explanation]"
            }}
        ]
    }}
    """
    response = query_ollama(prompt, model=ADVANCED_OLLAMA_MODEL)
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
    4-6 bullet points
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
    response = query_ollama(prompt, model=ADVANCED_OLLAMA_MODEL)
    if not response:
        raise HTTPException(status_code=503, detail="AI Service Unavailable")
    try:
        return extract_json(response)
    except Exception as e:
        return {"error": "Failed to parse AI response", "raw": response}

class DoubtRequest(BaseModel):
    question: str
    context: str

@app.post("/retrieve")
async def retrieve_context(
    query: str = Form(...),
    corpus: str = Form(...) # JSON string of documents/chunks
):
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        
        docs = json.loads(corpus)
        if not docs or len(docs) == 0:
            return {"results": []}
            
        # Combine query with documents
        texts = [query] + [d["text"] for d in docs]
        
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(texts)
        
        # Similarity of query (index 0) with all docs (index 1+)
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        
        # Get top 5 indices
        top_indices = cosine_sim.argsort()[-5:][::-1]
        
        results = []
        for idx in top_indices:
            if cosine_sim[idx] > 0.05: # Confidence threshold
                results.append({
                    "text": docs[idx]["text"],
                    "score": float(cosine_sim[idx]),
                    "metadata": docs[idx].get("metadata", {})
                })
                
        return {"results": results}
    except Exception as e:
        logger.error(f"Retrieval Error: {e}")
        return {"results": [], "error": str(e)}

@app.post("/ask_doubt")
async def ask_doubt(req: DoubtRequest):
    if not req.question or not req.context:
        raise HTTPException(status_code=400, detail="Missing question or context")
    
    prompt = f"Context: {req.context}\nQuestion: {req.question}\nAnswer:"
    response = query_ollama(prompt, model=OLLAMA_MODEL)
    if not response:
        raise HTTPException(status_code=503, detail="AI Service Unavailable")
    return {"answer": response}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
