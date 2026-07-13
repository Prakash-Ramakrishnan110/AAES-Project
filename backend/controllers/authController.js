const User = require('../models/User');
const ClassAdvisor = require('../models/ClassAdvisor');
const jwt = require('jsonwebtoken');

// Helper to find Class Advisor for a student
const findClassAdvisor = async (user) => {
    if (user.role !== 'student') return null;

    let advisorId = user.classAdvisor;

    // If not explicitly set, find by department and academic year
    if (!advisorId) {
        // Try to normalize academic year level
        let yearLevel = user.academicYear;
        
        // If it's a session string like "2023-2024", use semester to infer year level
        if (yearLevel && (yearLevel.includes('-') || !yearLevel.includes('Year'))) {
            const sem = parseInt(user.semester);
            if (sem <= 2) yearLevel = '1st Year';
            else if (sem <= 4) yearLevel = '2nd Year';
            else if (sem <= 6) yearLevel = '3rd Year';
            else yearLevel = '4th Year';
        }

        const advisorRecord = await ClassAdvisor.findOne({
            department: user.department,
            academicYear: yearLevel
        });
        
        if (advisorRecord) {
            advisorId = advisorRecord.staff;
        }
    }

    if (advisorId) {
        const advisor = await User.findById(advisorId).select('fullName profileImage username');
        return advisor ? {
            _id: advisor._id,
            fullName: advisor.fullName || advisor.username,
            profileImage: advisor.profileImage
        } : null;
    }
    return null;
};

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
        const fs = require('fs');
        const logPath = require('path').join(__dirname, '../login_debug.log');
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Attempt for: ${email}\n`);

        const user = await User.findOne({ 
            $or: [
                { email: email?.toLowerCase() },
                { username: email } 
            ]
        });

        if (!user) {
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] User NOT found: ${email}\n`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] User: ${user.username}, Role: ${user.role}, Match: ${isMatch}\n`);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: 'Your account is deactivated' });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Audit Log (Optional)
        try {
            const AuditLog = require('../models/AuditLog');
            await AuditLog.create({
                action: 'LOGIN',
                performedBy: user._id,
                targetModel: 'User',
                targetId: user._id,
                department: user.department,
                role: user.role,
                details: { status: 'SUCCESS' }
            });
        } catch (e) {}

        // Class Advisor check
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
            profileImage: user.profileImage,
            classAdvisor: await findClassAdvisor(user),
            token,
        });

    } catch (error) {
        console.error('LOGIN ERROR:', error);
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
            phone: user.phone,
            bloodGroup: user.bloodGroup,
            schooling: user.schooling,
            currentCgpa: user.currentCgpa,
            historyOfArrears: user.historyOfArrears,
            preferences: user.preferences,
            isAdvisor,
            advisorYear,
            advisorDepartment,
            batch: user.batch,
            section: user.section,
            semester: user.semester,
            academicYear: user.academicYear,
            profileImage: user.profileImage,
            classAdvisor: await findClassAdvisor(user)
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private (all authenticated users)
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // If this is a forced change (requiresPasswordChange flag), skip current password check
    // Otherwise verify the current password for voluntary changes by HOD/Staff/Admin/Student
    if (!user.requiresPasswordChange) {
        if (!currentPassword) {
            return res.status(400).json({ message: 'Current password is required' });
        }
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
    }

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
        profileImage: user.profileImage,
        token: generateToken(user._id, user.role, user.department),
    });
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
        res.json({
            message: 'Settings updated successfully',
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
            fullName: user.fullName,
            phone: user.phone,
            bloodGroup: user.bloodGroup,
            schooling: user.schooling,
            currentCgpa: user.currentCgpa,
            historyOfArrears: user.historyOfArrears,
            profileImage: user.profileImage,
            preferences: user.preferences
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, changePassword, updateUserSettings };
