const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    const { name, code, department, semester, academicYear } = req.body;

    const subject = await Subject.create({
        name,
        code,
        department,
        semester,
        academicYear
    });

    if (subject) {
        res.status(201).json(subject);
    } else {
        res.status(400).json({ message: 'Invalid subject data' });
    }
};

// @desc    Get all subjects (with optional filtering)
// @route   GET /api/subjects
// @access  Private (All Roles)
const getSubjects = async (req, res) => {
    const { department, semester, academicYear, staffId } = req.query;
    const query = {};

    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;
    if (staffId) query.staff = staffId;

    const subjects = await Subject.find(query).populate('staff', 'username email');
    res.json(subjects);
};

// @desc    Assign staff to subject
// @route   PUT /api/subjects/:id/assign
// @access  Private/Admin
const assignStaff = async (req, res) => {
    const { staffId } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (subject) {
        // Check if staff exists and is actually a staff member
        const staffUser = await User.findById(staffId);
        if (!staffUser || staffUser.role !== 'staff') {
            return res.status(400).json({ message: 'Invalid staff user' });
        }

        if (!subject.staff.includes(staffId)) {
            subject.staff.push(staffId);
            await subject.save();
        }

        res.json(subject);
    } else {
        res.status(404).json({ message: 'Subject not found' });
    }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res) => {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
        await subject.deleteOne();
        res.json({ message: 'Subject removed' });
    } else {
        res.status(404).json({ message: 'Subject not found' });
    }
};

module.exports = {
    createSubject,
    getSubjects,
    assignStaff,
    deleteSubject
};
