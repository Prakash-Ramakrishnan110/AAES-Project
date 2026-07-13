const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Submission = require('./models/Submission');
const Assignment = require('./models/Assignment');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function reEvaluateFailed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const submissions = await Submission.find({ 
            marks: 0, 
            feedback: 'Pending evaluation...',
            fileUrl: { $ne: '' }
        });

        if (submissions.length === 0) {
            console.log('No failed submissions found to re-evaluate.');
            process.exit(0);
        }

        console.log(`Found ${submissions.length} submissions to re-evaluate.`);

        for (const sub of submissions) {
            console.log(`\nForce re-evaluating: ${sub._id}`);
            const assignment = await Assignment.findById(sub.assignmentId);
            if (!assignment) continue;

            const formData = new FormData();
            if (sub.fileUrl) {
                const filePath = path.join(__dirname, sub.fileUrl);
                if (fs.existsSync(filePath)) {
                    formData.append('file', fs.createReadStream(filePath));
                } else {
                    console.log(`File not found: ${filePath}`);
                    continue;
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

            console.log(`Calling AI Service...`);
            try {
                const aiRes = await axios.post('http://localhost:8000/evaluate', formData, {
                    headers: { ...formData.getHeaders() },
                    timeout: 120000 
                });

                if (aiRes.data && aiRes.data.success) {
                    console.log(`Success! New Text Extracted: ${aiRes.data.extracted_text ? 'YES' : 'EMPTY'}`);
                    sub.marks = aiRes.data.total_score;
                    sub.feedback = aiRes.data.feedback;
                    sub.extractedText = aiRes.data.extracted_text || sub.extractedText;
                    sub.status = 'graded';
                    console.log(`Saving result... score: ${sub.marks}`);
                    await sub.save();
                }
            } catch (aiErr) {
                console.error(`AI Eval failed for ${sub._id}:`, aiErr.message);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

reEvaluateFailed();
