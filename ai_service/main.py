from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import json
import logging
from typing import List, Optional

# Import custom modules
import processor
import ocr_engine
import text_cleaner
import llm_connector
import rag_system

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AAES AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "Ready", "message": "AI Engine is running"}

@app.post("/evaluate")
async def evaluate_submission(
    file: Optional[UploadFile] = File(None),
    student_answer: Optional[str] = Form(None),
    assignment_data: str = Form(...) 
):
    """
    Pipeline: (Image -> OCR -> Cleaning) OR (Direct Text) -> LLM Evaluation
    """
    temp_input = None
    temp_output = None
    extracted_text = student_answer or ""
    ocr_conf = 1.0
    
    try:
        if file:
            temp_input = f"temp_eval_{file.filename}"
            # Ensure output is always a valid image format for OpenCV imwrite
            temp_output = f"proc_eval_{file.filename}.png" 
            
            with open(temp_input, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            processor.preprocess_image(temp_input, temp_output)
            ocr_text, ocr_conf = ocr_engine.extract_text(temp_output)
            logger.info(f"OCR Extracted ({ocr_conf}): {ocr_text[:100]}...")
            extracted_text = ocr_text if ocr_text else extracted_text
            extracted_text = text_cleaner.clean_text(extracted_text or "")
            logger.info(f"Final Student Text for Eval: {extracted_text[:100]}...")

        assignment_info = json.loads(assignment_data)
        logger.info(f"Evaluating assignment: {assignment_info.get('title')}")
        eval_result = llm_connector.query_evaluator(extracted_text, assignment_info)

        if not eval_result:
            raise ValueError("AI Evaluator returned no result. Check LLM connection.")

        # Cleanup
        # Temporarily disabled cleanup for debugging
        # if temp_input and os.path.exists(temp_input): os.remove(temp_input)
        # if temp_output and os.path.exists(temp_output): os.remove(temp_output)

        questions_eval = eval_result.get("questions", [])
        if not isinstance(questions_eval, list):
            questions_eval = []
            
        calculated_total = 0
        for q in questions_eval:
            if not isinstance(q, dict):
                continue
            try:
                score = float(q.get("score", 0))
                max_val = float(q.get("max", score))
                calculated_total += min(score, max_val)
            except (ValueError, TypeError):
                pass
                
        return {
            "success": True,
            "ocr_confidence": ocr_conf,
            "extracted_text": extracted_text,
            "total_score": int(calculated_total),
            "feedback": eval_result.get("feedback", "No feedback provided"),
            "evaluation": questions_eval
        }

    except Exception as e:
        logger.error(f"Evaluation error: {str(e)}")
        if temp_input and os.path.exists(temp_input): os.remove(temp_input)
        if temp_output and os.path.exists(temp_output): os.remove(temp_output)
        raise HTTPException(status_code=500, detail=str(e))

class AssignmentRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str
    question_count: int
    type: str
    rubric: Optional[dict] = None

class QuizRequest(BaseModel):
    subject: str
    topic: str
    count: int
    type: str = "MCQ"
    rubric: Optional[dict] = None

class PPTRequest(BaseModel):
    subject: str
    topic: str
    slide_count: int
    level: str
    rubric: Optional[dict] = None

@app.post("/generate/assignment")
async def generate_assignment(request: AssignmentRequest):
    try:
        result = llm_connector.generate_questions(
            request.subject, request.topic, request.difficulty, request.question_count, request.type
        )
        if result is None:
            raise HTTPException(status_code=503, detail="AI Service is temporarily unavailable (LLM connection failed)")
        return {"success": True, "questions": result.get("questions", [])}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Assignment generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/quiz")
async def generate_quiz(request: QuizRequest):
    try:
        result = llm_connector.generate_questions(
            request.subject, request.topic, "medium", request.count, "quiz"
        )
        if result is None:
            raise HTTPException(status_code=503, detail="AI Service is temporarily unavailable (LLM connection failed)")
        return {"success": True, "questions": result.get("questions", [])}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quiz generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/ppt")
async def generate_ppt(request: PPTRequest):
    try:
        # Re-using generate_questions logic for PPT outline
        result = llm_connector.generate_questions(
            request.subject, request.topic, request.level, request.slide_count, "ppt_outline"
        )
        if result is None:
            raise HTTPException(status_code=503, detail="AI Service is temporarily unavailable (LLM connection failed)")
        return {"success": True, "questions": result.get("questions", [])}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PPT generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_questions")
async def generate_assignment_questions_old(
    subject: str = Form(...),
    topic: str = Form(...),
    difficulty: str = Form("medium"),
    num_questions: int = Form(5),
    type: str = Form("handwritten")
):
    try:
        result = llm_connector.generate_questions(subject, topic, difficulty, num_questions, type)
        if result is None:
            raise HTTPException(status_code=503, detail="AI Service is temporarily unavailable (LLM connection failed)")
        return {"success": True, "questions": result.get("questions", [])}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notes/upload")
async def upload_notes(
    file: UploadFile = File(...),
    subject_id: str = Form(...)
):
    temp_input = f"temp_note_{file.filename}"
    temp_output = f"proc_note_{file.filename}.png"
    try:
        with open(temp_input, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        processor.preprocess_image(temp_input, temp_output)
        extracted_text, _ = ocr_engine.extract_text(temp_output)
        cleaned_text = text_cleaner.clean_text(extracted_text)

        # Index in RAG system
        rag_system.add_notes(subject_id, cleaned_text)

        if os.path.exists(temp_input): os.remove(temp_input)
        if os.path.exists(temp_output): os.remove(temp_output)

        return {"success": True, "extracted_text": cleaned_text}
    except Exception as e:
        logger.error(f"Notes upload error: {str(e)}")
        if os.path.exists(temp_input): os.remove(temp_input)
        if os.path.exists(temp_output): os.remove(temp_output)
        raise HTTPException(status_code=500, detail=str(e))

class QueryRequest(BaseModel):
    subject_id: str
    question: str
    notes: Optional[str] = None

@app.post("/notes/ask")
async def ask_notes_ai(request: QueryRequest):
    try:
        if request.notes:
            rag_system.set_notes(request.subject_id, request.notes)
        answer = rag_system.query(request.subject_id, request.question)
        return {"success": True, "answer": answer}
    except Exception as e:
        logger.error(f"RAG error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
