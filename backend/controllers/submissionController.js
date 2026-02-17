const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

const { runAutoGrading } = require('../utils/pythonRunner');

// @desc    Submit an assignment
// @route   POST /api/submissions
// @access  Private/Student
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, code, answers } = req.body;
        // req.file is available if 'file' field is used

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check availability (Deadline)
        if (new Date() > new Date(assignment.deadline)) {
            return res.status(400).json({ message: 'Submission deadline passed' });
        }

        let marks = 0;
        let testCaseResults = [];
        let status = 'submitted';
        let feedback = '';
        let aiAnalysis = {};

        // --- Python Auto-Grading ---
        if (assignment.type === 'python' && code) {
            const gradingResult = await runAutoGrading(code, assignment.testCases);
            marks = gradingResult.totalMarks;
            testCaseResults = gradingResult.results;
            status = 'graded';
        }

        // --- Theory AI Evaluation ---
        if (assignment.type === 'theory' && req.file) {
            // Call Python Service
            try {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(req.file.path));
                formData.append('model_answer', assignment.modelAnswer || 'No model answer provided.');

                const pythonServiceUrl = 'http://localhost:8000/evaluate/theory';
                const aiRes = await axios.post(pythonServiceUrl, formData, {
                    headers: { ...formData.getHeaders() },
                    timeout: 15000 // 15s timeout
                });

                if (aiRes.data) {
                    marks = aiRes.data.marks || 0;
                    feedback = aiRes.data.feedback || '';
                    aiAnalysis = {
                        rawOutput: JSON.stringify(aiRes.data),
                        metrics: {
                            clarity: 0, // Placeholder
                            relevance: marks / 10, // Approximation
                            completeness: marks / 10
                        }
                    };
                    status = 'graded';
                }
            } catch (error) {
                console.error('AI Evaluation Failed:', error.message);
                // Graceful degradation: Mark as pending instead of failing
                feedback = 'AI Evaluation service is currently unavailable. Your submission has been saved and will be manually reviewed by staff.';
                status = 'submitted'; // Keep as submitted, not graded
            }
        }

        // Check if submitting or re-submitting
        let submission = await Submission.findOne({
            student: req.user.id,
            assignment: assignmentId
        });

        if (submission) {
            submission.code = code || submission.code;
            submission.answers = answers || submission.answers; // Store text if typed
            submission.submittedAt = Date.now();

            // Update marks/status if new grading happened
            if (status === 'graded') {
                submission.marks = marks;
                submission.testCaseResults = testCaseResults;
                submission.status = status;
                submission.feedback = feedback;
                submission.aiAnalysis = aiAnalysis;
            }

            await submission.save();
            return res.json(submission);
        }

        submission = await Submission.create({
            student: req.user.id,
            assignment: assignmentId,
            code,
            answers,
            marks,
            testCaseResults,
            status,
            feedback,
            aiAnalysis
        });

        res.status(201).json(submission);

        // Cleanup uploaded file after processing
        if (req.file) {
            fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my submissions
// @route   GET /api/submissions/my
// @access  Private/Student
const getMySubmissions = async (req, res) => {
    const submissions = await Submission.find({ student: req.user.id })
        .populate('assignment', 'title type maxMarks deadline')
        .sort({ submittedAt: -1 });
    res.json(submissions);
};

// @desc    Get all submissions for an assignment (Staff view)
// @route   GET /api/submissions/assignment/:id
// @access  Private/Staff
const getSubmissionsForAssignment = async (req, res) => {
    const submissions = await Submission.find({ assignment: req.params.id })
        .populate('student', 'username email academicYear semester');
    res.json(submissions);
};

// @desc    Grade submission (Manual override or initial placeholder)
// @route   PUT /api/submissions/:id/grade
// @access  Private/Staff
const gradeSubmission = async (req, res) => {
    const { marks, feedback } = req.body;
    const submission = await Submission.findById(req.params.id);

    if (submission) {
        submission.marks = marks;
        submission.feedback = feedback;
        submission.status = 'graded';
        await submission.save();
        res.json(submission);
    } else {
        res.status(404).json({ message: 'Submission not found' });
    }
};

// @desc    Get student statistics
// @route   GET /api/submissions/stats/student
// @access  Private/Student
const getStudentStats = async (req, res) => {
    try {
        const studentId = req.user.id;

        // 1. Total Assignments Assigned (Approximation based on Subject enrollment)
        // ideally matches enrollment logic. For now, matching Dept + Sem
        const subjects = await require('../models/Subject').find({
            department: req.user.department,
            semester: req.user.semester // Assuming user has this field populated
        });
        const subjectIds = subjects.map(s => s._id);

        const totalAssignments = await Assignment.countDocuments({
            subject: { $in: subjectIds }
        });

        // 2. Submissions Stats
        const submissions = await Submission.find({ student: studentId });

        const submittedCount = submissions.length;
        const pendingCount = Math.max(0, totalAssignments - submittedCount);

        const gradedSubmissions = submissions.filter(s => s.status === 'graded');
        const avgMarks = gradedSubmissions.length > 0
            ? gradedSubmissions.reduce((acc, curr) => acc + curr.marks, 0) / gradedSubmissions.length
            : 0;

        res.json({
            totalAssignments,
            submittedCount,
            pendingCount,
            avgMarks: Math.round(avgMarks * 10) / 10 // 1 decimal place
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitAssignment,
    getMySubmissions,
    getSubmissionsForAssignment,
    gradeSubmission,
    getStudentStats
};
