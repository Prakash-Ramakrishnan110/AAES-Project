const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testAI() {
    try {
        console.log('Testing AI Service...');
        const formData = new FormData();
        formData.append('student_answer', 'This is a test answer.');
        formData.append('assignment_data', JSON.stringify({
            title: 'Test Assignment',
            questions: [],
            maxMarks: 10,
            rubric: {}
        }));

        const res = await axios.post('http://localhost:8000/evaluate', formData, {
            headers: { ...formData.getHeaders() }
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error connecting to AI service:');
        console.error(err.response ? err.response.data : err.message);
    }
}

testAI();
