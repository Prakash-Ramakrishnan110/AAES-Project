const ReEvaluationRequest = require('../models/ReEvaluationRequest');
const Submission = require('../models/Submission');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc    Create re-evaluation request
// @route   POST /api/re-evaluation
// @access  Private (Student)
const createRequest = async (req, res) => {
    try {
        const { assignmentId, submissionId, subjectId, originalScore, reason } = req.body;

        const existingRequest = await ReEvaluationRequest.findOne({
            student: req.user._id,
            assignment: assignmentId
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Re-evaluation request already submitted for this assignment' });
        }

        const request = await ReEvaluationRequest.create({
            student: req.user._id,
            assignment: assignmentId,
            submission: submissionId,
            subject: subjectId,
            originalScore,
            reason
        });

        // Notify Staff (In a real app, you'd find the teacher who graded it)
        // For now, we'll just create the request

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all re-evaluation requests
// @route   GET /api/re-evaluation
// @access  Private (Staff/HOD/Student)
const getRequests = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'student') {
            query.student = req.user._id;
        } else if (req.user.role === 'staff') {
            // In a full implementation, filter by subjects taught by staff
            // For now, return all for simplicity or add filtering
        }

        const requests = await ReEvaluationRequest.find(query)
            .populate('student', 'username fullName')
            .populate('assignment', 'title')
            .populate('subject', 'name')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update re-evaluation request status
// @route   PUT /api/re-evaluation/:id
// @access  Private (Staff)
const updateRequest = async (req, res) => {
    try {
        const { status, updatedScore, reviewerComment } = req.body;
        const request = await ReEvaluationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        request.reviewerComment = reviewerComment;
        request.reviewedBy = req.user._id;
        request.reviewedAt = Date.now();

        if (status === 'Approved' && updatedScore !== undefined) {
            request.updatedScore = updatedScore;

            // Update the actual submission marks
            const submission = await Submission.findById(request.submission);
            if (submission) {
                const oldScore = submission.marks;
                submission.marks = updatedScore;
                await submission.save();

                // Log in Audit Trail
                await AuditLog.create({
                    performedBy: req.user._id,
                    role: req.user.role,
                    action: 'SCORE_MODIFICATION_REEVALUATION',
                    targetId: submission._id,
                    previousValue: oldScore,
                    newValue: updatedScore,
                    details: {
                        reason: reviewerComment,
                        message: `Score updated via re-evaluation.`
                    }
                });
            }
        }

        await request.save();

        // Notify Student
        await Notification.create({
            user: request.student,
            title: `Re-evaluation ${status}`,
            message: `Your re-evaluation request for ${request.assignment ? 'assignment' : 'the subject'} has been ${status.toLowerCase()}.${reviewerComment ? ' Comment: ' + reviewerComment : ''}`,
            type: status === 'Approved' ? 'Success' : 'Warning'
        });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createRequest, getRequests, updateRequest };
