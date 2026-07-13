import requests
import json

def test_generation():
    print("--- TESTING AI GENERATION (Gemma 3) ---")
    url = "http://127.0.0.1:8000/generate/assignment"
    payload = {
        "subject": "Computer Science",
        "topic": "Operating Systems",
        "question_count": 2,
        "difficulty": "Easy"
    }
    resp = requests.post(url, json=payload)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))

def test_retrieval():
    print("\n--- TESTING SEMANTIC RETRIEVAL (SentenceTransformer) ---")
    url = "http://127.0.0.1:8000/retrieve"
    data = {
        "query": "What is memory management?",
        "corpus": json.dumps([
            {"text": "Memory management is the process of controlling and coordinating computer memory."},
            {"text": "A CPU is the electronic circuitry within a computer."},
            {"text": "Paging is a memory management scheme."}
        ])
    }
    resp = requests.post(url, data=data)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))

if __name__ == "__main__":
    test_generation()
    test_retrieval()
