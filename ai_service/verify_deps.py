try:
    import cv2
    import numpy as np
    import paddleocr
    from sentence_transformers import SentenceTransformer
    import torch
    from fastapi import FastAPI
    import uvicorn
    print("SUCCESS: All major AI packages are correctly installed.")
except ImportError as e:
    print(f"FAILURE: Missing package: {e}")
except Exception as e:
    print(f"ERROR during verification: {e}")
