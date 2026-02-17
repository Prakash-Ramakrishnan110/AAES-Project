from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import uvicorn
import shutil
import os
import pytesseract
from PIL import Image
import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Temporary directory for uploaded images
UPLOAD_DIR = "temp_uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Ollama Configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma:2b" # Or "gemma:7b" depending on user system

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

def perform_ocr(image_path: str):
    """Extracts text from an image using Pytesseract."""
    try:
        text = pytesseract.image_to_string(Image.open(image_path))
        return text.strip()
    except Exception as e:
        logger.error(f"OCR Error: {e}")
        return ""

@app.get("/")
def read_root():
    return {"message": "AAES Python AI Service Running (Ollama Enabled)"}

@app.post("/evaluate/theory")
async def evaluate_theory(
    file: UploadFile = File(...), 
    model_answer: str = Form(...)
):
    try:
        # 1. Save File
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. OCR Extraction
        student_answer_text = perform_ocr(file_path)
        
        # Cleanup file immediately after processing (optional)
        # os.remove(file_path)

        if not student_answer_text:
            return {
                "marks": 0,
                "feedback": "Could not extract text from image. Please ensure handwriting is clear.",
                "ocr_text": ""
            }

        # 3. AI Evaluation with Ollama
        prompt = f"""
        You are an academic evaluator. 
        Compare the following Student Answer with the Model Answer.
        
        Model Answer: "{model_answer}"
        
        Student Answer: "{student_answer_text}"
        
        Tasks:
        1. Evaluate the relevance and correctness of the student's answer based STRICTLY on the model answer.
        2. Assign a score from 0 to 100.
        3. Provide constructive feedback (max 2 sentences).
        
        Respond ONLY in valid JSON format:
        {{
            "marks": <number>,
            "feedback": "<string>"
        }}
        """
        
        llm_response_str = query_ollama(prompt)
        
        if not llm_response_str:
            return {
                "marks": 0, 
                "feedback": "AI Service Unavailable (Ollama not responding).",
                "ocr_text": student_answer_text
            }

        try:
            # Parse JSON from LLM
            # Sometimes LLMs add markdown code blocks, strip them
            clean_json = llm_response_str.replace("```json", "").replace("```", "").strip()
            result = json.loads(clean_json)
            result["ocr_text"] = student_answer_text
            return result
        except json.JSONDecodeError:
            logger.error(f"Failed to parse LLM JSON: {llm_response_str}")
            return {
                "marks": 0, 
                "feedback": "AI Evaluation Failed (Invalid JSON response).",
                "ocr_text": student_answer_text,
                "raw_llm": llm_response_str
            }

    except Exception as e:
        logger.error(f"Evaluation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate/python")
def evaluate_python(code: str = Form(...)):
    # Placeholder - handled by Node for now, but could move here later
    return {"message": "Python evaluation is currently handled by Node.js backend"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
