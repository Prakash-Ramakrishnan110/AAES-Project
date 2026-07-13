const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Submission = require('./models/Submission');
const Assignment = require('./models/Assignment');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function reEvaluate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find submissions with 0 marks and matching feedback
        const submissions = await Submission.find({ marks: 0, feedback: 'No feedback provided' });
        console.log(`Found ${submissions.length} submissions to re-evaluate.`);

        for (const sub of submissions) {
            console.log(`Re-evaluating submission: ${sub._id}`);
            const assignment = await Assignment.findById(sub.assignmentId);
            if (!assignment) continue;

            const formData = new FormData();
            if (sub.fileUrl) {
                const filePath = path.join(__dirname, sub.fileUrl);
                if (fs.existsSync(filePath)) {
                    formData.append('file', fs.createReadStream(filePath));
                }
            }
            
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

            try {
                console.log(`Calling AI Service for ${sub._id}...`);
                const aiRes = await axios.post('http://localhost:8000/evaluate', formData, {
                    headers: { ...formData.getHeaders() },
                    timeout: 120000 
                });

                if (aiRes.data && aiRes.data.success) {
                    console.log(`Successfully evaluated ${sub._id}: ${aiRes.data.total_score} pts`);
                    sub.marks = aiRes.data.total_score;
                    sub.feedback = aiRes.data.feedback;
                    sub.extractedText = aiRes.data.extracted_text || sub.extractedText;
                    sub.status = 'graded';
                    sub.aiResultStatus = 'graded';
                    await sub.save();
                }
            } catch (err) {
                console.error(`Error for ${sub._id}: ${err.message}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

reEvaluate();
