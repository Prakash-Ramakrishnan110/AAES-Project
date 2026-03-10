const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const testUpload = async () => {
    try {
        const formData = new FormData();
        formData.append('category', 'Personal');
        formData.append('documentType', 'Aadhaar Card');
        formData.append('semester', '5');
        formData.append('academicYear', '2023-2024');
        
        // Create a dummy file
        const dummyPath = path.join(__dirname, 'dummy.txt');
        fs.writeFileSync(dummyPath, 'This is a test file.');
        formData.append('file', fs.createReadStream(dummyPath));

        console.log('--- STARTING REAL HTTP TEST ---');
        // We need a token. I'll steal one from the logs if possible, or just expect 401.
        // But wait, the 500 happened for a REAL user.
        // Let's see if 500 happens even without auth (it shouldn't, it should be 401).
        
        try {
            const res = await axios.post('http://localhost:5000/api/student-documents/me', formData, {
                headers: formData.getHeaders()
            });
            console.log('Result:', res.status, res.data);
        } catch (error) {
            if (error.response) {
                console.log('Result (Error):', error.response.status, JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Request Error:', error.message);
            }
        } finally {
            if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);
        }

    } catch (err) {
        console.error('TEST SCRIPT CRASHED:', err);
    }
};

testUpload();
