const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Subject = require('../models/Subject');

// @desc    Submit an assignment
// @route   POST /api/submissions
// @access  Private/Student
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, answers, extractedText, code } = req.body;
        const studentId = req.user.id;
        const finalStudentText = answers || extractedText || code || '';

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (new Date() > new Date(assignment.deadline)) {
            return res.status(400).json({ message: 'Submission deadline has passed.' });
        }

        let fileUrl = '';
        if (req.file) {
            // Construct the same identifier as the upload middleware
            const namePart = req.user?.fullName ? req.user.fullName.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Student';
            const regPart = req.user?.registerNumber || req.user?._id?.toString() || 'ID';
            const identifier = `${namePart}_${regPart}`.toLowerCase();
            
            // Subfolder is 'submissions' as defined in the route middleware
            fileUrl = `uploads/${identifier}/submissions/${req.file.filename}`;
        }

        // 1. Trigger AI Evaluation (Only for Manual Builder/Handwritten/Document types)
        let aiEvaluation = null;
        if (req.file || finalStudentText) {
            try {
                const axios = require('axios');
                const fs = require('fs');
                const FormData = require('form-data');
                const path = require('path');

                const formData = new FormData();
                if (req.file) {
                    const filePath = path.join(__dirname, '..', fileUrl);
                    formData.append('file', fs.createReadStream(filePath));
                }
                
                formData.append('student_answer', finalStudentText);
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

                console.log(`[AI] Attempting evaluation at: http://127.0.0.1:8000/evaluate`);
                const aiRes = await axios.post('http://127.0.0.1:8000/evaluate', formData, {
                    headers: { ...formData.getHeaders() },
                    timeout: 120000 // Increased timeout for heavier OCR
                });

                if (aiRes.data && aiRes.data.success) {
                    console.log(`[AI] Evaluation Successful: ${aiRes.data.total_score} points`);
                    aiEvaluation = aiRes.data;
                }
            } catch (err) {
                console.error('[AI] Connector Error:', err.response?.data || err.message);
            }
        }

        // 2. Upsert Submission Record
        let submission = await Submission.findOne({ studentId, assignmentId });

        const submissionData = {
            studentId,
            assignmentId,
            fileUrl: fileUrl || (submission ? submission.fileUrl : ''),
            extractedText: aiEvaluation ? (aiEvaluation.extracted_text || finalStudentText) : finalStudentText,
            marks: aiEvaluation ? aiEvaluation.total_score : (submission ? submission.marks : 0),
            feedback: aiEvaluation ? aiEvaluation.feedback : (submission ? submission.feedback : 'Pending evaluation...'),
            status: aiEvaluation ? 'graded' : 'submitted',
            aiResultStatus: aiEvaluation ? 'graded' : 'pending',
            learningFeedback: aiEvaluation ? aiEvaluation.feedback : '',
            submittedAt: Date.now()
        };

        if (submission) {
            Object.assign(submission, submissionData);
            await submission.save();
            return res.status(200).json(submission);
        }

        submission = await Submission.create(submissionData);
        res.status(201).json(submission);
    } catch (error) {
        console.error('Submit Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my submissions
const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user.id })
            .populate({
                path: 'assignmentId',
                select: 'title maxMarks totalMarks type submissionType subjectId',
                populate: {
                    path: 'subjectId',
                    select: 'name description'
                }
            })
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all submissions for an assignment
const getSubmissionsForAssignment = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignmentId: req.params.id })
            .populate('studentId', 'fullName email');
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Grade submission
const gradeSubmission = async (req, res) => {
    try {
        const { marks, feedback } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.marks = marks;
        submission.feedback = feedback;
        submission.status = 'graded';
        await submission.save();

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student stats
const getStudentStats = async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await User.findById(studentId);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const subjects = await Subject.find({
            department: { $regex: new RegExp(`^${student.department}$`, 'i') },
            semester: student.semester || 'Unknown'
        });
        const subjectIds = subjects.map(s => s._id);
        
        // Fetch relevant assignments for this student
        const assignments = await Assignment.find({
            $or: [
                { subjectId: { $in: subjectIds } },
                { 
                    department: { $regex: new RegExp(`^${student.department}$`, 'i') }, 
                    semester: student.semester 
                }
            ]
        });
        const submissions = await Submission.find({ studentId });

        const submittedCount = submissions.length;
        const totalAssignments = assignments.length;
        const pendingCount = Math.max(0, totalAssignments - submittedCount);
        
        const gradedSubmissions = submissions.filter(s => s.marks > 0);
        const avgMarks = gradedSubmissions.length > 0 
            ? gradedSubmissions.reduce((acc, curr) => acc + curr.marks, 0) / gradedSubmissions.length 
            : 0;

        res.json({
            totalAssignments,
            submittedCount,
            pendingCount,
            avgMarks: Math.round(avgMarks)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request resubmission (Student)
const requestResubmit = async (req, res) => {
    try {
        const { reason } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        
        if (submission.studentId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        submission.resubmissionStatus = 'requested';
        submission.resubmissionReason = reason;
        await submission.save();

        res.json({ message: 'Resubmission request sent', submission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Handle resubmission request (Staff)
const handleResubmissionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        submission.resubmissionStatus = status;
        
        // If approved, we can also update the main status to reflect that a new attempt is awaited
        if (status === 'approved') {
            submission.status = 're-eval-approved';
        } else {
            submission.status = 're-eval-rejected';
        }

        await submission.save();
        res.json({ message: `Resubmission ${status}`, submission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitAssignment,
    getMySubmissions,
    getSubmissionsForAssignment,
    gradeSubmission,
    getStudentStats,
    requestResubmit,
    handleResubmissionStatus
};
