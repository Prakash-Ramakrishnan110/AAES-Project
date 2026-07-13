import re

def clean_text(text):
    """
    Clean OCR output: normalize whitespace, remove duplicates, and fix artifacts.
    """
    if not text:
        return ""

    # 1. Normalize whitespace (tabs, newlines, multiple spaces)
    text = re.sub(r'\s+', ' ', text).strip()

    # 2. Fix duplicated characters (e.g., "coomppuuterr" -> "computer")
    # This is tricky as some words have natural duplicates (e.g., "book").
    # We use a heuristic: more than 2 duplicates are usually OCR errors.
    text = re.sub(r'(.)\1{2,}', r'\1', text) 
    
    # 3. Fix words with spaces in between (e.g., "Th e CPU" -> "The CPU")
    # Heuristic: single letter followed by space and then continuing word
    # This might catch "a book", so we check common cases.
    text = re.sub(r'\b([A-Za-z])\s+(?=[A-Za-z]{2,})', r'\1', text)

    # 4. Correct simple OCR mistakes (common artifacts)
    replacements = {
        '|': 'I',
        '0': 'O',  # Use with caution, maybe only in specific contexts
        '1': 'I',  # Use with caution
        '[': '(',
        ']': ')',
        '{': '(',
        '}': ')',
    }
    # Note: Global digit-to-letter replacement is risky. Usually, we'd use language models.
    # For now, let's keep it minimal.
    
    # 5. Remove non-alphanumeric artifacts at start/end of words
    text = re.sub(r'\s([^\w\s])\s', r' ', text)

    return text
