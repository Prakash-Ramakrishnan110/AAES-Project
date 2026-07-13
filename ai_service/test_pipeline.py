import requests
import os
import json
import logging
from unittest.mock import patch

# Configuration
API_URL = "http://127.0.0.1:8000/process"
TEST_FILE = "test_handwritten.png"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_mock_image():
    """Create a dummy white image for testing."""
    import cv2
    import numpy as np
    img = np.full((500, 500, 3), 255, dtype=np.uint8)
    cv2.putText(img, "The CPU is the heart of the computer.", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,0), 2)
    cv2.imwrite(TEST_FILE, img)
    return TEST_FILE

def test_ocr_fallback():
    """
    Test 1: OCR Fallback
    Simulate PaddleOCR failure and verify EasyOCR succeeds.
    """
    logger.info("\n--- TEST 1: OCR FALLBACK ---")
    
    # We will mock PaddleOCR.ocr in ocr_engine to raise an exception
    with patch('ocr_engine.ocr_paddle.ocr') as mock_paddle:
        mock_paddle.side_effect = Exception("Simulated PaddleOCR Error")
        
        # We need to run the extraction logic. 
        # Since the server is a separate process, we'll test the function directly
        import ocr_engine
        image = create_mock_image()
        try:
            text = ocr_engine.extract_text(image)
            logger.info(f"Extracted Text via Fallback: '{text}'")
            if text:
                logger.info("SUCCESS: EasyOCR fallback worked.")
            else:
                logger.error("FAILURE: EasyOCR returned empty text.")
        finally:
            if os.path.exists(image):
                os.remove(image)

def test_image_quality_failure():
    """
    Test 3: Image Quality Check Failure
    Create a very small (low resolution) or blurry image and verify the pipeline rejects it.
    """
    logger.info("\n--- TEST 3: IMAGE QUALITY FAILURE ---")
    import cv2
    import numpy as np
    
    # Create a small image (below 1024x768)
    bad_image = "low_res.png"
    img = np.full((100, 100, 3), 255, dtype=np.uint8)
    cv2.imwrite(bad_image, img)
    
    files = {'file': open(bad_image, 'rb')}
    data = {'assignment_id': 'test', 'subject_id': 'test'}
    
    try:
        response = requests.post(API_URL, files=files, data=data)
        logger.info(f"Response Status: {response.status_code}")
        result = response.json()
        if response.status_code == 400 and "Low Quality Image" in result.get("error", ""):
            logger.info(f"SUCCESS: System correctly rejected low quality image: {result['reason']}")
        else:
            logger.error(f"FAILURE: Expected 400 rejection, got {response.status_code}")
            logger.error(result)
    finally:
        files['file'].close()
        if os.path.exists(bad_image): os.remove(bad_image)

def test_full_pipeline():
    """
    Test 2: End-to-End Pipeline
    Run the full pipeline via the API and verify new research metrics.
    """
    logger.info("\n--- TEST 2: FULL PIPELINE ---")
    
    image = create_mock_image()
    
    files = {'file': open(image, 'rb')}
    data = {
        'assignment_id': 'test_assignment_123',
        'subject_id': 'subject_789',
        'question': 'What is a CPU?',
        'model_answer': 'The CPU is the Central Processing Unit that executes instructions.',
        'rubric': json.dumps({"content": 50, "concept": 50})
    }
    
    try:
        response = requests.post(API_URL, files=files, data=data)
        if response.status_code == 200:
            result = response.json()
            logger.info("SUCCESS: Pipeline returned 200 OK")
            
            # Verify Top-Level Metrics
            required_metrics = ['confidence_score', 'confidence_level', 'consistency_status', 'pipeline_status']
            missing_metrics = [f for f in required_metrics if f not in result]
            
            # Verify Data-Level Metrics
            data_result = result.get('data', {})
            required_data = ['reasoning', 'learning_feedback', 'suggested_study', 'concept_analysis']
            missing_data = [f for f in required_data if f not in data_result]
            
            if not missing_metrics and not missing_data:
                logger.info("SUCCESS: All new research metrics present in response.")
                logger.info(f"Confidence: {result['confidence_score']} ({result['confidence_level']})")
                logger.info(f"Consistency: {result['consistency_status']}")
                logger.info(f"Reasoning: {data_result['reasoning'][:100]}...")
            else:
                logger.error(f"FAILURE: Missing Metrics: {missing_metrics}")
                logger.error(f"FAILURE: Missing Data: {missing_data}")
        else:
            logger.error(f"FAILURE: Server returned {response.status_code}")
    finally:
        files['file'].close()
        if os.path.exists(image): os.remove(image)

if __name__ == "__main__":
    import sys
    # test_ocr_fallback()
    test_image_quality_failure()
    test_full_pipeline()
