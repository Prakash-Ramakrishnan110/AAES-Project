# Evaluation Engines Setup & Security

## Overview
The AAES project uses two evaluation engines:
1. **Python Auto-Grading Engine** - Executes student Python code against test cases
2. **Theory AI Evaluation Service** - OCR + LLM-based evaluation of handwritten answers

## Python Auto-Grading Engine

### Security Features
- **Code Validation**: Blacklists dangerous imports and operations
- **Timeout**: 3-second execution limit per test case
- **Resource Limits**: 1MB max output buffer
- **Restricted Operations**: File I/O, network access, dynamic code execution blocked

### Blocked Operations
The following are automatically rejected:
- File operations (`open`, `file`)
- Network modules (`socket`, `urllib`, `requests`, `http`)
- System modules (`os`, `sys`, `subprocess`)
- Dynamic execution (`eval`, `exec`, `__import__`)
- Data persistence (`pickle`, `shelve`)

### Usage
Python code is automatically validated before execution. Violations return descriptive error messages to students.

### Known Limitations
- **Not Production-Ready**: Current implementation uses `child_process.exec` which is not fully sandboxed
- **Recommendation for Production**: Use Docker containers with strict resource limits and network isolation

## Theory AI Evaluation Service

### Requirements
1. **Python Service** (`python_service/main.py`)
   - FastAPI application
   - Tesseract OCR
   - Ollama with Gemma model

2. **Installation Steps**
   ```bash
   cd python_service
   pip install -r requirements.txt
   
   # Install Tesseract OCR
   # Windows: https://github.com/UB-Mannheim/tesseract/wiki
   # Linux: sudo apt-get install tesseract-ocr
   
   # Install Ollama
   # https://ollama.ai/download
   
   # Pull Gemma model
   ollama pull gemma:2b
   ```

3. **Running the Service**
   ```bash
   python main.py
   # Service runs on http://localhost:8000
   ```

### Health Check
Check if service is running:
```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "message": "AAES Python AI Service Running (Ollama Enabled)"
}
```

### Graceful Degradation
If the AI service is unavailable:
- Submissions are saved with status `submitted` (not `graded`)
- Students receive message: "AI Evaluation service is currently unavailable. Your submission has been saved and will be manually reviewed by staff."
- Staff can manually grade using the `/api/submissions/:id/grade` endpoint

## Testing

### Testing Python Security
Try submitting code with forbidden operations:

```python
# This should be rejected
import os
os.system('ls')
```

Expected result: `Security Error: Forbidden import detected: os`

### Testing AI Service
1. Start the Python service
2. Upload a handwritten answer image
3. Verify OCR extraction and LLM evaluation
4. Stop the service and submit again - should degrade gracefully

## Production Recommendations

### For Python Execution
1. **Docker Sandboxing**
   - Run each submission in isolated container
   - Strict CPU/memory limits
   - No network access
   - Auto-cleanup after execution

2. **Queue System**
   - Use Redis/Bull for job queue
   - Separate worker processes for execution
   - Rate limiting per user

### For AI Service
1. **High Availability**
   - Deploy multiple service instances
   - Load balancing
   - Health checks and auto-restart

2. **Monitoring**
   - Track service uptime
   - Log evaluation failures
   - Alert on prolonged downtime

## Troubleshooting

### Python Code Not Executing
- Check if `python` command is in PATH
- Verify temp_scripts directory permissions
- Check server logs for detailed errors

### AI Service Connection Failed
- Verify service is running on port 8000
- Check Ollama is installed and running
- Ensure Gemma model is downloaded
- Check firewall settings

### OCR Not Working
- Verify Tesseract is installed correctly
- Check image file format (JPG, PNG supported)
- Ensure image is readable (not too blurry)
