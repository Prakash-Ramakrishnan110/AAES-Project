const Assignment = require('../models/Assignment');
const Subject = require('../models/Subject');
const Submission = require('../models/Submission');
const User = require('../models/User');
const ReEvaluationRequest = require('../models/ReEvaluationRequest');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Staff
const createAssignment = async (req, res) => {
    try {
        const {
            title, description, subjectId, type, submissionType, 
            totalMarks, maxMarks, deadline, questions, modelAnswers,
            section, department, semester, formatConfig
        } = req.body;

        if (!subjectId) return res.status(400).json({ message: 'Subject must be selected.' });

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Check if the staff member is assigned to this subject
        // We handle both staffId and staff array for compatibility
        const isAuthorized = subject.staffId?.toString() === req.user.id || 
                            subject.staff?.some(id => id.toString() === req.user.id);

        if (!isAuthorized && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized for this subject' });
        }

        const assignment = await Assignment.create({
            title,
            description,
            subjectId,
            semester: semester || subject.semester,
            department: department || subject.department,
            section: section || 'All',
            createdBy: req.user.id,
            type: type || submissionType || 'handwritten',
            submissionType: submissionType || type || 'handwritten',
            questions: questions || [],
            modelAnswers,
            maxMarks: maxMarks || totalMarks || 10,
            totalMarks: totalMarks || maxMarks || 10,
            deadline,
            formatConfig: formatConfig || {}
        });

        res.status(201).json(assignment);
    } catch (error) {
        console.error('Create Assignment Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update assignment
const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        if (req.user.role !== 'admin' && assignment.createdBy?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(assignment, req.body);
        await assignment.save();
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments by Subject
const getAssignments = async (req, res) => {
    const { subjectId } = req.query;
    if (!subjectId) return res.status(400).json({ message: 'Subject ID required' });
    const assignments = await Assignment.find({ subjectId }).sort({ createdAt: -1 });
    res.json(assignments);
};

// @desc    Get assignments created by current Staff
const getMyCreatedAssignments = async (req, res) => {
    try {
        const staffId = req.user.id;
        const subjects = await Subject.find({ 
            $or: [
                { staffId: staffId },
                { staff: staffId }
            ]
        });
        const subjectIds = subjects.map(s => s._id);
        const assignments = await Assignment.find({ subjectId: { $in: subjectIds } })
            .populate('subjectId', 'name code semester department')
            .sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments for current student
const getStudentAssignments = async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        const subjects = await Subject.find({
            department: { $regex: new RegExp(`^${student.department}$`, 'i') },
            semester: student.semester
        });
        const subjectIds = subjects.map(s => s._id);

        // Fetch assignments directly by department and semester for maximum reliability
        const assignments = await Assignment.find({
            $or: [
                { subjectId: { $in: subjectIds } },
                { 
                    department: { $regex: new RegExp(`^${student.department}$`, 'i') }, 
                    semester: student.semester 
                }
            ]
        }).populate('subjectId', 'name')
            .sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAssignmentById = async (req, res) => {
    const assignment = await Assignment.findById(req.params.id).populate('subjectId', 'name');
    if (assignment) res.json(assignment);
    else res.status(404).json({ message: 'Assignment not found' });
};

const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        await Submission.deleteMany({ assignmentId: assignment._id });
        await assignment.deleteOne();
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAssignmentGradebook = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('subjectId');
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        const subject = assignment.subjectId;
        if (!subject) return res.status(404).json({ message: 'Subject not found for this assignment' });

        const students = await User.find({
            role: 'student',
            department: { $regex: new RegExp(`^${subject.department}$`, 'i') },
            semester: subject.semester
        }).select('_id fullName email registerNumber profileImage isActive');

        const submissions = await Submission.find({ assignmentId: assignment._id });

        const gradebook = students.map(student => {
            const submission = submissions.find(s => s.studentId.toString() === student._id.toString());
            return {
                studentId: student._id,
                fullName: student.fullName,
                registerNumber: student.registerNumber,
                email: student.email,
                status: submission ? submission.status : 'pending',
                marks: submission ? submission.marks : 0,
                submittedAt: submission ? submission.submittedAt : null,
                submissionId: submission ? submission._id : null
            };
        });

        res.json({
            title: assignment.title,
            totalMarks: assignment.totalMarks,
            gradebook
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStaffStats = async (req, res) => {
    try {
        const staffId = req.user.id;
        const subjects = await Subject.find({ 
            $or: [
                { staffId: staffId },
                { staff: staffId }
            ]
        });
        const subjectIds = subjects.map(s => s._id);
        const assignments = await Assignment.find({ subjectId: { $in: subjectIds } });
        const assignmentIds = assignments.map(a => a._id);
        
        // Only count graded submissions for average score
        const submissions = await Submission.find({ 
            assignmentId: { $in: assignmentIds },
            status: 'graded'
        }).populate('assignmentId', 'totalMarks');

        let totalPercentage = 0;
        submissions.forEach(s => {
            const max = s.assignmentId?.totalMarks || 100;
            totalPercentage += (s.marks / max) * 100;
        });
        const avgScore = submissions.length > 0 ? (totalPercentage / submissions.length).toFixed(1) : 0;

        res.json({
            subjectCount: subjects.length,
            assignmentCount: assignments.length,
            submissionCount: await Submission.countDocuments({ assignmentId: { $in: assignmentIds } }),
            pendingGrading: await Submission.countDocuments({ 
                assignmentId: { $in: assignmentIds }, 
                status: { $in: ['submitted', 're-eval-pending'] } 
            }),
            avgScore: parseFloat(avgScore)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAssignment,
    updateAssignment,
    getAssignments,
    getMyCreatedAssignments,
    getStudentAssignments,
    getAssignmentById,
    deleteAssignment,
    getAssignmentGradebook,
    getStaffStats
};

