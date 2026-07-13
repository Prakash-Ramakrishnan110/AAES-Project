from pdf2image import convert_from_path
import os

try:
    print("Testing pdf2image...")
    # Just try to see if it even imports and runs the function (without a real pdf first)
    # Actually, let's look for a pdf in uploads.
    # No, let's just check if it's installed.
    import pdf2image
    print(f"pdf2image version: {pdf2image.__version__ if hasattr(pdf2image, '__version__') else 'unknown'}")
    
    # Check poppler
    from pdf2image.exceptions import PDFInfoNotInstalledError
    try:
        convert_from_path('nonexistent.pdf')
    except FileNotFoundError:
        print("pdf2image + poppler seems to be working (caught FileNotFoundError as expected)")
    except PDFInfoNotInstalledError:
        print("Poppler is NOT installed or NOT on the path.")
    except Exception as e:
        print(f"Caught other error: {type(e).__name__}: {e}")
except Exception as e:
    print(f"Error: {e}")
