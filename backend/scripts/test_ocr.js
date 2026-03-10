const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function testExtraction() {
    try {
        console.log("Starting test...");
        const extractFormData = new FormData();
        extractFormData.append('file', fs.createReadStream('test_ocr.png'));

        const extractRes = await axios.post('http://localhost:8000/extract_text', extractFormData, {
            headers: { ...extractFormData.getHeaders() },
            timeout: 20000
        });

        console.log("EXTRACTED TEXT:", extractRes.data.text);
    } catch (e) {
        console.error("FAILED:", e.message);
        if (e.response) console.error("BODY:", e.response.data);
    }
}
testExtraction();
