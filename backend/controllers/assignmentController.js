const Assignment = require('../models/Assignment');
const Subject = require('../models/Subject');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Staff
const createAssignment = async (req, res) => {
    try {
        const {
            title, description, subjectId, section, maxMarks, deadline,
            submissionType, formatConfig
        } = req.body;

        if (!subjectId) return res.status(400).json({ message: 'Subject must be selected.' });
        if (!submissionType || !formatConfig) {
            return res.status(400).json({ message: 'Submission type and format configuration are required.' });
        }

        // Verify subject ownership
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Ensure the requesting staff is assigned to this subject
        if (!subject.staff.some(staffId => staffId.toString() === req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to create assignments for this subject' });
        }

        // Type-specific validation inside formatConfig
        if (submissionType === 'quiz') {
            const questions = formatConfig.questions || [];
            const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
            if (totalMarks !== maxMarks) {
                return res.status(400).json({ message: `Quiz total marks (${totalMarks}) must match assignment max marks (${maxMarks}).` });
            }
        }

        if (submissionType === 'code') {
            const testCases = formatConfig.testCases || [];
            const totalMarks = testCases.reduce((sum, tc) => sum + (tc.marks || 0), 0);
            if (totalMarks !== maxMarks) {
                return res.status(400).json({ message: `Programming test cases total marks (${totalMarks}) must match assignment max marks (${maxMarks}).` });
            }
        }

        console.log("Creating Assignment with data:", {
            title,
            subjectId,
            dept: subject.department,
            sem: subject.semester
        });

        const assignment = await Assignment.create({
            title,
            description,
            subject: subjectId,
            department: subject.department || 'Unknown',
            semester: subject.semester || 'Unknown',
            section: section || 'All',
            createdBy: req.user.id,
            maxMarks,
            deadline,
            submissionType: submissionType === 'programming' ? 'code' : submissionType,
            formatConfig
        });

        res.status(201).json(assignment);
    } catch (error) {
        console.error("Assignment Creation Error:", error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update assignment (Extend deadline, Enable/Disable submissions)
// @route   PUT /api/assignments/:id
// @access  Private/Staff
const updateAssignment = async (req, res) => {
    try {
        const { deadline, submissionsEnabled } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Verify ownership or admin/hod role
        if (
            req.user.role !== 'admin' &&
            req.user.role !== 'hod' &&
            assignment.createdBy.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: 'Not authorized to update this assignment.' });
        }

        if (deadline) assignment.deadline = deadline;
        if (typeof submissionsEnabled === 'boolean') {
            assignment.submissionsEnabled = submissionsEnabled;
        }

        const updatedAssignment = await assignment.save();
        res.json(updatedAssignment);
    } catch (error) {
        console.error("Assignment Update Error:", error);
        res.status(500).json({ message: error.message || 'Server error while updating assignment.' });
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
        const student = await User.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find subjects matching student's enrollment
        // Priority: Match by Dept and Sem (handle mismatched academic years easily)
        let subjects = await Subject.find({
            department: new RegExp(`^${student.department}$`, 'i'),
            semester: student.semester
        });

        const subjectIds = subjects.map(s => s._id);

        // Fetch assignments for these subjects AND matching student's section
        // Assignments marked 'All' are visible to everyone in that subject
        const assignments = await Assignment.find({
            subject: { $in: subjectIds },
            $or: [
                { section: 'All' },
                { section: student.section },
                { section: { $exists: false } } // Handle legacy assignments
            ]
        })
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
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (
            req.user.role !== 'admin' &&
            req.user.role !== 'hod' &&
            assignment.createdBy.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: 'Not authorized to delete this assignment.' });
        }

        // Clean up related submissions
        await Submission.deleteMany({ assignment: assignment._id });

        // Delete the assignment itself
        await assignment.deleteOne();

        res.json({ message: 'Assignment eliminated completely.' });
    } catch (error) {
        console.error("Delete Assignment Error:", error);
        res.status(500).json({ message: error.message || 'Server error while deleting assignment.' });
    }
};

// @desc    Get assignment gradebook (student list + status + marks)
// @route   GET /api/assignments/:id/gradebook
// @access  Private/Staff
const getAssignmentGradebook = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('subject');
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // Ensure authorization (Owner of assignment or HOD/Admin)
        if (req.user.role !== 'admin' && req.user.role !== 'hod' && assignment.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const subject = assignment.subject;
        if (!subject) return res.status(404).json({ message: 'Subject context not found' });

        // Find students in this subject/context
        const studentFilter = {
            role: 'student',
            department: subject.department,
            semester: subject.semester
        };

        // Section filter - Case insensitive to be safe
        if (assignment.section && assignment.section !== 'All') {
            studentFilter.section = { $regex: new RegExp(`^${assignment.section}$`, 'i') };
        }

        const students = await User.find(studentFilter).select('_id fullName registerNumber section semester department');
        const submissions = await Submission.find({ assignment: assignment._id });

        // Merge data
        const gradebook = students.map(student => {
            const submission = submissions.find(s => s.student.toString() === student._id.toString());
            return {
                studentId: student._id,
                fullName: student.fullName,
                registerNumber: student.registerNumber,
                section: student.section,
                status: submission ? submission.status : 'pending',
                marks: submission ? submission.marks : 0,
                submittedAt: submission ? submission.submittedAt : null,
                submissionId: submission ? submission._id : null
            };
        });

        res.json({
            assignmentTitle: assignment.title,
            maxMarks: assignment.maxMarks,
            gradebook
        });

    } catch (error) {
        console.error("Gradebook Error:", error);
        res.status(500).json({ message: error.message });
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
    updateAssignment,
    getAssignments,
    getMyCreatedAssignments,
    getStudentAssignments,
    getAssignmentById,
    deleteAssignment,
    getAssignmentGradebook,
    getStaffStats
};
