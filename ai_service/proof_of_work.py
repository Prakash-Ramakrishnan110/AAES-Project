import os
import json
import requests
import cv2
import numpy as np
import ocr_engine
import similarity
import llm_connector

# 1. TEST DATA PREPARATION
print("--- PREPARING TEST DATA ---")
TEST_IMAGE = "proof_test.png"
img = np.full((100, 400, 3), 255, dtype=np.uint8)
cv2.putText(img, "AI Verification Test", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 2)
cv2.imwrite(TEST_IMAGE, img)
print(f"Created test image: {TEST_IMAGE}")

try:
    # 2. TEST OCR ENGINE (PaddleOCR)
    print("\n--- TESTING 1: OCR ENGINE (PaddleOCR) ---")
    extracted_text = ocr_engine.extract_text(TEST_IMAGE)
    print(f"Extracted Text: '{extracted_text}'")
    if extracted_text:
        print("RESULT: PaddleOCR is working.")

    # 3. TEST SIMILARITY (SentenceTransformers)
    print("\n--- TESTING 2: SIMILARITY (SentenceTransformers) ---")
    query = "This is a test answer about photosynthesis."
    corpus = ["Photosynthesis is the process by which plants use sunlight to synthesize foods."]
    score, status = similarity.check_similarity(query, corpus)
    print(f"Similarity Score: {score}, Status: {status}")
    if score is not None:
        print("RESULT: SentenceTransformers is working.")

    # 4. TEST LLM CONNECTORS (Gemma 3 via Ollama)
    print("\n--- TESTING 3: LLM CONNECTORS (Ollama) ---")
    # Using query_evaluator or query_llava logic partially
    prompt = "Reply with 'Ollama is alive' if you can read this."
    payload = {
        "model": "gemma3:1b",
        "prompt": prompt,
        "stream": False
    }
    try:
        resp = requests.post("http://127.0.0.1:11434/api/generate", json=payload, timeout=10)
        if resp.status_code == 200:
            print(f"Ollama Response: {resp.json().get('response', '').strip()}")
            print("RESULT: Ollama/Gemma 3 is working.")
        else:
            print(f"Ollama Error: Status {resp.status_code}")
    except Exception as e:
        print(f"Ollama Connection Error: {e}")

finally:
    if os.path.exists(TEST_IMAGE):
        os.remove(TEST_IMAGE)
    print("\n--- PROOF OF WORK COMPLETED ---")
