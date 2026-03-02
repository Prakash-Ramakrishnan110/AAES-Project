const User = require('../models/User');
const ClassAdvisor = require('../models/ClassAdvisor');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role, department) => {
    return jwt.sign({ id, role, department }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user (Admin use primarily)
// @route   POST /api/auth/register
// @access  Public (for initial setup) / Admin
const registerUser = async (req, res) => {
    const { username, email, password, role, department, academicYear, semester } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Set requiresPasswordChange to true specifically for default student accounts
    const isStudentWithDefaultPassword = role === 'student' && password === 'password123';

    // Create user
    const user = await User.create({
        username,
        email,
        password,
        role,
        department,
        academicYear,
        semester,
        requiresPasswordChange: isStudentWithDefaultPassword
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            requiresPasswordChange: user.requiresPasswordChange,
            token: generateToken(user._id, user.role, user.department),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Governance: check if account is active
            if (user.isActive === false) {
                return res.status(403).json({ message: 'Your account is currently deactivated. Please contact administration.' });
            }

            // Update last login
            user.lastLogin = Date.now();
            await user.save();

            // Check if this staff member is a class advisor
            let isAdvisor = false;
            let advisorYear = null;
            let advisorDepartment = null;
            if (user.role === 'staff') {
                const advisorRecord = await ClassAdvisor.findOne({ staff: user._id });
                if (advisorRecord) {
                    isAdvisor = true;
                    advisorYear = advisorRecord.academicYear;
                    advisorDepartment = advisorRecord.department;
                }
            }

            const token = generateToken(user._id, user.role, user.department);

            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department,
                semester: user.semester,
                academicYear: user.academicYear,
                fullName: user.fullName,
                phone: user.phone,
                batch: user.batch,
                section: user.section,
                bloodGroup: user.bloodGroup,
                schooling: user.schooling,
                currentCgpa: user.currentCgpa,
                historyOfArrears: user.historyOfArrears,
                requiresPasswordChange: user.requiresPasswordChange,
                isAdvisor,
                advisorYear,
                advisorDepartment,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user) {
        let isAdvisor = false;
        let advisorYear = null;
        let advisorDepartment = null;
        if (user.role === 'staff') {
            const advisorRecord = await ClassAdvisor.findOne({ staff: user._id });
            if (advisorRecord) {
                isAdvisor = true;
                advisorYear = advisorRecord.academicYear;
                advisorDepartment = advisorRecord.department;
            }
        }

        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
            fullName: user.fullName,
            isAdvisor,
            advisorYear,
            advisorDepartment
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Change password (used for forced change on first login)
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (user) {
        user.password = newPassword;
        user.requiresPasswordChange = false;
        await user.save();

        res.json({
            message: 'Password updated successfully',
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
            semester: user.semester,
            academicYear: user.academicYear,
            fullName: user.fullName,
            phone: user.phone,
            batch: user.batch,
            section: user.section,
            bloodGroup: user.bloodGroup,
            schooling: user.schooling,
            currentCgpa: user.currentCgpa,
            historyOfArrears: user.historyOfArrears,
            requiresPasswordChange: user.requiresPasswordChange,
            token: generateToken(user._id, user.role, user.department),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user preferences/settings
// @route   PUT /api/auth/settings
// @access  Private
const updateUserSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.preferences) {
            // Shallow merge preferences to avoid overwriting the whole object if only one sub-field is sent
            user.preferences = {
                ...user.preferences,
                ...req.body.preferences,
                notifications: {
                    ...(user.preferences?.notifications || {}),
                    ...(req.body.preferences.notifications || {})
                },
                appearance: {
                    ...(user.preferences?.appearance || {}),
                    ...(req.body.preferences.appearance || {})
                },
                privacy: {
                    ...(user.preferences?.privacy || {}),
                    ...(req.body.preferences.privacy || {})
                }
            };
        }

        // Also allow updating basic info from here if needed
        if (req.body.fullName) user.fullName = req.body.fullName;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.bloodGroup) user.bloodGroup = req.body.bloodGroup;
        if (req.body.schooling) user.schooling = req.body.schooling;
        if (req.body.currentCgpa !== undefined) user.currentCgpa = req.body.currentCgpa;
        if (req.body.historyOfArrears !== undefined) user.historyOfArrears = req.body.historyOfArrears;

        await user.save();
        res.json({ message: 'Settings updated successfully', preferences: user.preferences });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, changePassword, updateUserSettings };
