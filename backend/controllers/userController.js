const User = require('../models/User');

// @desc    Get all users (with filtering)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const { role, department } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;

    const users = await User.find(query).select('-password');
    res.json(users);
};

// @desc    Create a new user (Staff/Student/HOD)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { username, email, password, role, department, academicYear, semester } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        username,
        email,
        password,
        role,
        department,
        academicYear,
        semester
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.department = req.body.department || user.department;
        user.academicYear = req.body.academicYear || user.academicYear;
        user.semester = req.body.semester || user.semester;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get system statistics (Admin/HOD)
// @route   GET /api/users/stats/system
// @access  Private/Admin/HOD
const getSystemStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const Department = require('../models/Department');
        const Subject = require('../models/Subject');

        const studentCount = await User.countDocuments({ role: 'student' });
        const staffCount = await User.countDocuments({ role: 'staff' });
        const deptCount = await Department.countDocuments();
        const subjectCount = await Subject.countDocuments();

        res.json({
            studentCount,
            staffCount,
            deptCount,
            subjectCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Promote students to next semester
// @route   POST /api/users/promote
// @access  Private/Admin
const promoteStudents = async (req, res) => {
    const { department, currentSemester, newSemester, academicYear } = req.body;

    if (!department || !currentSemester || !newSemester) {
        return res.status(400).json({ message: 'Please provide department, current semester, and new semester' });
    }

    try {
        const updateData = { semester: newSemester };
        if (academicYear) {
            updateData.academicYear = academicYear;
        }

        const result = await User.updateMany(
            { role: 'student', department: department, semester: currentSemester },
            { $set: updateData }
        );

        res.json({
            message: `Successfully promoted students from Sem ${currentSemester} to Sem ${newSemester}`,
            count: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getSystemStats,
    promoteStudents
};
