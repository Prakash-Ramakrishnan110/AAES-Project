import cv2
import numpy as np
import fitz  # PyMuPDF
import os

def check_image_quality(image_path):
    """
    Performs image quality checks: Blur, Brightness, and Resolution.
    Returns: (is_good, reason)
    """
    # If it's a PDF, we don't check quality the same way
    if image_path.lower().endswith('.pdf'):
        return True, "PDF input detected, quality check bypassed."

    img = cv2.imread(image_path)
    if img is None:
        return False, "Could not read image file."

    h, w = img.shape[:2]
    
    # 1. Resolution Check (Min 1024x768)
    if w < 1024 or h < 768:
        return False, f"Low Resolution Detected: {w}x{h}. Minimum required: 1024x768."

    # 2. Blur Detection (Laplacian Variance)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if laplacian_var < 100: # Threshold for blur
        return False, f"Blurry Image Detected (Variance: {laplacian_var:.2f})."

    # 3. Brightness Detection
    brightness = gray.mean()
    if brightness < 40: # Too dark
        return False, f"Poor Lighting: Image is too dark (Brightness: {brightness:.2f})."
    if brightness > 230: # Too bright/washed out
        return False, f"Poor Lighting: Image is too bright (Brightness: {brightness:.2f})."

    return True, "Image quality passed."

def preprocess_image(input_path, output_path):
    """
    Handle both images and PDFs. For PDFs, convert first page to image.
    Apply OpenCV preprocessing to improve OCR accuracy.
    """
    temp_img_path = input_path

    # Handle PDF
    if input_path.lower().endswith('.pdf'):
        doc = fitz.open(input_path)
        page = doc.load_page(0)  # Handle first page only for now
        # Normal DPI for faster OCR to prevent timeouts
        pix = page.get_pixmap(matrix=fitz.Matrix(100 / 72, 100 / 72)) 
        temp_img_path = f"{input_path}_tmp.png"
        pix.save(temp_img_path)
        doc.close()

    # Load image
    img = cv2.imread(temp_img_path)
    if img is None:
        if temp_img_path != input_path and os.path.exists(temp_img_path):
            os.remove(temp_img_path)
        raise ValueError(f"Could not read image at {temp_img_path}")

    # 1. Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Remove noise using Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # 3. Apply adaptive thresholding
    processed = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # 4. Normalize contrast
    final = np.zeros_like(processed)
    cv2.normalize(processed, final, 0, 255, cv2.NORM_MINMAX)

    # Save processed image for OCR
    cv2.imwrite(output_path, final)

    # Cleanup temp image if created from PDF
    if temp_img_path != input_path and os.path.exists(temp_img_path):
        os.remove(temp_img_path)
    
    return output_path
