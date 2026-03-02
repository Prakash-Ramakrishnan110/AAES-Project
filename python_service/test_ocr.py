import pytesseract
from PIL import Image, ImageDraw, ImageFont
import sys

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

img = Image.new('RGB', (200, 100), color = (255, 255, 255))
d = ImageDraw.Draw(img)
d.text((10,10), "Hello Python", fill=(0,0,0))
img.save('test_ocr.png')

try:
    text = pytesseract.image_to_string(Image.open('test_ocr.png'))
    print(f"SUCCESS: {text.strip()}")
except Exception as e:
    print(f"ERROR: {e}")
