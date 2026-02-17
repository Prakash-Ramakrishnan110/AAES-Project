const Assignment = require('../models/Assignment');
const Subject = require('../models/Subject');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Staff
const createAssignment = async (req, res) => {
    const {
        title, description, subjectId, maxMarks, deadline,
        type, aiEnabled, modelAnswer, testCases
    } = req.body;

    // Verify subject ownership
    const subject = await Subject.findById(subjectId);
    if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
    }

    // Ensure the requesting staff is assigned to this subject
    // Note: req.user.id is string, subject.staff is array of ObjectIds
    if (!subject.staff.some(staffId => staffId.toString() === req.user.id)) {
        return res.status(403).json({ message: 'Not authorized to create assignments for this subject' });
    }

    const assignment = await Assignment.create({
        title,
        description,
        subject: subjectId,
        createdBy: req.user.id,
        maxMarks,
        deadline,
        type,
        aiEnabled,
        modelAnswer,
        testCases
    });

    if (assignment) {
        res.status(201).json(assignment);
    } else {
        res.status(400).json({ message: 'Invalid assignment data' });
    }
};

// @desc    Get assignments by Subject
// @route   GET /api/assignments?subjectId=...
// @access  Private (All Roles - filtered by enrollment/assignment)
const getAssignments = async (req, res) => {
    const { subjectId } = req.query;

    if (!subjectId) {
        return res.status(400).json({ message: 'Subject ID required' });
    }

    const assignments = await Assignment.find({ subject: subjectId })
        .sort({ createdAt: -1 });

    res.json(assignments);
};

// @desc    Get assignments created by current Staff
// @route   GET /api/assignments/my-created
// @access  Private/Staff
const getMyCreatedAssignments = async (req, res) => {
    const assignments = await Assignment.find({ createdBy: req.user.id })
        .populate('subject', 'name code')
        .sort({ createdAt: -1 });
    res.json(assignments);
};

// @desc    Get assignments for current student (enrolled subjects only)
// @route   GET /api/assignments/student
// @access  Private/Student
const getStudentAssignments = async (req, res) => {
    try {
        const student = req.user;

        // Find subjects matching student's enrollment (department, semester, academicYear)
        const subjects = await Subject.find({
            department: student.department,
            semester: student.semester,
            academicYear: student.academicYear
        });

        const subjectIds = subjects.map(s => s._id);

        // Fetch assignments for these subjects
        const assignments = await Assignment.find({ subject: { $in: subjectIds } })
            .populate('subject', 'name code')
            .sort({ createdAt: -1 });

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res) => {
    // Ensure testCases are sent so the frontend knows what to run (or the backend knows)
    // For students, maybe we shouldn't send hidden test cases? 
    // For MVP, we send them.
    const assignment = await Assignment.findById(req.params.id).populate('subject', 'name code');
    if (assignment) {
        res.json(assignment);
    } else {
        res.status(404).json({ message: 'Assignment not found' });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Staff
const deleteAssignment = async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);

    if (assignment) {
        if (assignment.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await assignment.deleteOne();
        res.json({ message: 'Assignment removed' });
    } else {
        res.status(404).json({ message: 'Assignment not found' });
    }
};

// @desc    Get staff statistics
// @route   GET /api/assignments/stats/staff
// @access  Private/Staff
const getStaffStats = async (req, res) => {
    try {
        const staffId = req.user.id;

        // 1. My Subjects
        // We need to query subjects where 'staff' array contains this user
        const subjects = await Subject.find({ staff: staffId });
        const subjectCount = subjects.length;
        const subjectIds = subjects.map(s => s._id);

        // 2. Created Assignments
        const assignments = await Assignment.find({ createdBy: staffId });
        const assignmentCount = assignments.length;
        const assignmentIds = assignments.map(a => a._id);

        // 3. Submissions to me (assignments I created)
        // Alternatively, submissions to subjects I teach (more broad)
        // Let's stick to assignments I created for now.
        const submissions = await Submission.find({ assignment: { $in: assignmentIds } });
        const submissionCount = submissions.length;

        const gradedCount = submissions.filter(s => s.status === 'graded').length;
        const pendingCount = submissionCount - gradedCount;

        res.json({
            subjectCount,
            assignmentCount,
            submissionCount,
            pendingGrading: pendingCount
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAssignment,
    getAssignments,
    getMyCreatedAssignments,
    getStudentAssignments,
    getAssignmentById,
    deleteAssignment,
    getStaffStats
};
