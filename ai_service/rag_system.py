import os
import json
import logging
from typing import List
import requests
# Using a simple implementation for now to avoid heavy dependencies if not present
# In a real scenario, we'd use FAISS + SentenceTransformers

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

class RAGSystem:
    def __init__(self):
        self.notes_cache = {} # subject_id -> full_text

    def add_notes(self, subject_id: str, text: str):
        if subject_id not in self.notes_cache:
            self.notes_cache[subject_id] = ""
        self.notes_cache[subject_id] += "\n" + text

    def set_notes(self, subject_id: str, text: str):
        self.notes_cache[subject_id] = text

    def query(self, subject_id: str, question: str):
        notes = self.notes_cache.get(subject_id, "No notes available for this subject.")
        
        prompt = f"""
        You are an AI Assistant helping a student based on their subject notes.
        
        NOTES:
        {notes}
        
        QUESTION:
        {question}
        
        RULES:
        1. Answer ONLY from the notes provided.
        2. No hallucinations.
        3. If the answer is not in the notes, say "I cannot find this in the notes".
        
        ANSWER:
        """
        
        try:
            response = requests.post(
                OLLAMA_URL,
                json={
                    "model": "gemma3:1b",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=60
            )
            response.raise_for_status()
            return response.json().get("response", "I cannot find this in the notes")
        except Exception as e:
            logger.warning(f"RAG LLM error, falling back to heuristic: {e}")
            
            # Simple keyword extraction and heuristic search
            question_lower = question.lower()
            sentences = [s.strip() for s in notes.split('.') if len(s.strip()) > 10]
            
            if "summarize" in question_lower or "summary" in question_lower:
                if sentences:
                    preview = '. '.join(sentences[:2]) + '.'
                    return f"[Heuristic Fallback]: Here is a quick preview of the document: {preview}"
                return "The document appears to be empty."
                
            query_words = [w for w in question_lower.split() if len(w) > 4]
            
            best_sentence = ""
            max_matches = 0
            
            for sentence in sentences:
                matches = sum(1 for word in query_words if word in sentence.lower())
                if matches > max_matches:
                    max_matches = matches
                    best_sentence = sentence
                    
            if max_matches > 0:
                return f"[Heuristic Fallback]: Based on your notes: '{best_sentence}.'"
            else:
                return "I apologize, but the neural backend is offline and I couldn't find a direct keyword match. Please check the document manually."

rag_engine = RAGSystem()

def add_notes(subject_id: str, text: str):
    rag_engine.add_notes(subject_id, text)

def query(subject_id: str, question: str):
    return rag_engine.query(subject_id, question)

def set_notes(subject_id: str, text: str):
    rag_engine.set_notes(subject_id, text)
