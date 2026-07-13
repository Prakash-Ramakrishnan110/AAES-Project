const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Submission = require('./models/Submission');
const Assignment = require('./models/Assignment');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testEval() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const sub = await Submission.findById('6a550928b181c8e4fe806ce9');

        const assignment = await Assignment.findById(sub.assignmentId);

        const formData = new FormData();
        const filePath = path.join(__dirname, sub.fileUrl);
        formData.append('file', fs.createReadStream(filePath));
        
        formData.append('student_answer', sub.extractedText || ''); 
        formData.append('assignment_data', JSON.stringify({
            title: assignment.title,
            questions: (assignment.questions || []).map(q => ({
                text: q.text || q.questionText || q.question || 'Untitled Question',
                marks: q.marks || 0,
                modelAnswer: q.modelAnswer || ''
            })),
            maxMarks: assignment.maxMarks,
            rubric: assignment.formatConfig?.rubric || {}
        }));

        console.log(`Calling AI Service...`);
        const aiRes = await axios.post('http://localhost:8000/evaluate', formData, {
            headers: { ...formData.getHeaders() }
        });

        console.log(JSON.stringify(aiRes.data, null, 2));

        if (aiRes.data && aiRes.data.success) {
            console.log(`Success! New Text Extracted: ${aiRes.data.extracted_text ? 'YES' : 'EMPTY'}`);
            sub.marks = aiRes.data.total_score;
            sub.feedback = aiRes.data.feedback;
            sub.extractedText = aiRes.data.extracted_text || sub.extractedText;
            sub.status = 'graded';
            console.log(`Saving result... score: ${sub.marks}`);
            await sub.save();
        }

        process.exit(0);
    } catch (err) {
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}
testEval();
