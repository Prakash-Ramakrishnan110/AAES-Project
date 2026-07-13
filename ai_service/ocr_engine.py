from paddleocr import PaddleOCR
import easyocr
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize PaddleOCR (English, with angle classification)
try:
    ocr_paddle = PaddleOCR(use_angle_cls=True, lang='en')
except Exception as e:
    logger.warning(f"PaddleOCR init failed with use_angle_cls=True: {e}. Retrying without angle_cls...")
    try:
        ocr_paddle = PaddleOCR(lang='en')
    except Exception as e2:
        logger.error(f"PaddleOCR completely failed to initialize: {e2}. System will rely solely on EasyOCR/PyMuPDF.")
        ocr_paddle = None

# Initialize EasyOCR (English)
try:
    ocr_easy = easyocr.Reader(['en'])
except Exception as e:
    logger.error(f"EasyOCR init failed: {e}")
    ocr_easy = None

def extract_text(image_path):
    """
    Extract text from an image using PaddleOCR with EasyOCR fallback.
    Returns: (text, average_confidence)
    """
    extracted_text = ""
    avg_confidence = 0.0
    
    # 1. Try PaddleOCR
    if ocr_paddle:
        try:
            logger.info("Attempting text extraction with PaddleOCR...")
            result = ocr_paddle.predict(image_path)
            if result and result[0]:
                lines = [line[1][0] for line in result[0]]
                confidences = [line[1][1] for line in result[0]]
                extracted_text = " ".join(lines).strip()
                if confidences:
                    avg_confidence = sum(confidences) / len(confidences)
        except Exception as e:
            logger.error(f"PaddleOCR extraction failed: {e}")
    else:
        logger.warning("PaddleOCR is not initialized, skipping...")

    # 2. Fallback to EasyOCR if PaddleOCR failed or returned empty text
    if not extracted_text:
        logger.info("PaddleOCR failed or empty. Falling back to EasyOCR...")
        if ocr_easy:
            try:
                # detail=1 gives [([box], text, confidence)]
                result = ocr_easy.readtext(image_path, detail=1)
                lines = [r[1] for r in result]
                confidences = [r[2] for r in result]
                extracted_text = " ".join(lines).strip()
                if confidences:
                    avg_confidence = sum(confidences) / len(confidences)
            except Exception as e:
                logger.error(f"EasyOCR extraction failed: {e}")
        else:
            logger.error("EasyOCR is not initialized.")

    return extracted_text, avg_confidence
