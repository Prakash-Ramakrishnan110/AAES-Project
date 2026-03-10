from main import perform_ocr
import sys

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
        print(f"Running OCR on: {test_file}")
        try:
            result = perform_ocr(test_file)
            print("--- OCR RESULT ---")
            print(result)
            print("------------------")
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("Please provide a file path to test.")
