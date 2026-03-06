const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const path = require('path');

const getDirectorySize = (dirPath) => {
    let size = 0;
    try {
        if (!fs.existsSync(dirPath)) return 0;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                size += getDirectorySize(filePath);
            } else {
                size += stats.size;
            }
        }
    } catch (err) {
        console.error('Error calculating directory size:', err);
    }
    return size;
};

// Helper: Create Audit Log
const createAuditLog = async (action, performedBy, targetId, department, details = {}) => {
    try {
        await AuditLog.create({
            action,
            performedBy,
            targetId,
            targetModel: 'User',
            department,
            details
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

// @desc    Get all users (with optional filtering)
// @route   GET /api/users
// @access  Private/Admin/HOD
const getUsers = async (req, res) => {
    const { role, department, status, academicYear, semester, batch, section } = req.query;
    let query = {};

    // 1. ADMIN - Global Governance Access
    if (req.user.role === 'admin') {
        if (department) query.department = department;
        if (role) query.role = role;
    }
    // 2. HOD - Department-Level Full Visibility
    else if (req.user.role === 'hod') {
        query.department = req.user.department;
        if (role) query.role = role;
    }
    // 3. STAFF - Subject-Based Student Visibility
    else if (req.user.role === 'staff') {
        // Staff should only query students. If they try to query staff/admin, deny or restrict.
        if (role && role !== 'student') {
            return res.status(403).json({ message: 'Staff can only view student profiles' });
        }
        query.role = 'student';

        // Find all subjects assigned to this staff
        const Subject = require('../models/Subject');
        const assignedSubjects = await Subject.find({ staff: req.user.id });

        if (assignedSubjects.length === 0) {
            // Staff has no subjects, can't see any students
            return res.json([]);
        }

        // Build OR conditions for each subject's enrollment criteria (dept + semester + year)
        const subjectConditions = assignedSubjects.map(sub => ({
            department: sub.department,
            semester: sub.semester,
            academicYear: sub.academicYear
        }));

        query.$or = subjectConditions;
    }
    // 4. STUDENT - Self Profile Isolation (If they ever hit this)
    else if (req.user.role === 'student') {
        query._id = req.user.id;
    }

    // Default to active users, unless Admin/HOD request 'all'
    if (status !== 'all') {
        query.isActive = true;
    }

    // Additional filters if provided
    if (academicYear && !query.academicYear) query.academicYear = academicYear;
    if (semester && !query.semester) query.semester = semester;
    if (batch && !query.batch) query.batch = batch;
    if (section && !query.section) query.section = section;

    const users = await User.find(query).select('-password').populate('createdBy', 'username');
    res.json(users);
};

// @desc    Bulk update students
// @route   POST /api/users/bulk-update
// @access  Private/Admin/HOD
const bulkUpdateStudents = async (req, res) => {
    try {
        const { studentIds, updates } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'No students selected for update' });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        // Build base query
        const query = { _id: { $in: studentIds }, role: 'student' };

        // Enforce department scoping for HOD
        if (req.user.role === 'hod') {
            query.department = req.user.department;
        } else if (req.user.role === 'admin' && updates.department) {
            // Admin can only change department if they want, but usually bulk update doesn't touch it. 
            // We do nothing else for Admin.
        }

        // Ensure we only update fields that are explicitly provided in "updates" object and are valid
        const allowedUpdates = {};
        if (updates.batch !== undefined && updates.batch !== '') allowedUpdates.batch = updates.batch;
        if (updates.section !== undefined && updates.section !== '') allowedUpdates.section = updates.section;
        if (updates.academicYear !== undefined && updates.academicYear !== '') allowedUpdates.academicYear = updates.academicYear;
        if (updates.classAdvisor !== undefined && updates.classAdvisor !== '') allowedUpdates.classAdvisor = updates.classAdvisor;
        if (updates.isActive !== undefined) allowedUpdates.isActive = updates.isActive;

        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ message: 'All provided fields were empty. Nothing to update.' });
        }

        const result = await User.updateMany(
            query,
            { $set: allowedUpdates }
        );

        // Audit Log
        const departmentForLog = req.user.role === 'hod' ? req.user.department : 'SYSTEM';
        await createAuditLog('BULK_UPDATE_STUDENTS', req.user.id, null, departmentForLog, { count: result.modifiedCount, updates: allowedUpdates });

        res.json({
            message: `Successfully updated ${result.modifiedCount} students`,
            count: result.modifiedCount
        });

    } catch (error) {
        console.error('Bulk Update Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new user (Staff/Student/HOD)
// @route   POST /api/users
// @access  Private/Admin/HOD
const createUser = async (req, res) => {
    let { username, fullName, email, password, role, department, academicYear, semester, registerNumber, staffId } = req.body;

    // Governance: HOD Restrictions
    if (req.user.role === 'hod') {
        // Force department to be HODs department
        department = req.user.department;

        // Block creating Admin or HOD roles
        if (role === 'admin' || role === 'hod') {
            return res.status(403).json({ message: 'HODs cannot create Admin or HOD accounts' });
        }
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const profileImage = req.file ? `/uploads/${req.file.filename}` : '';

    const isStudentWithDefaultPassword = role === 'student' && password === 'password123';

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        role,
        department,
        academicYear,
        semester,
        registerNumber,
        staffId,
        profileImage,
        requiresPasswordChange: isStudentWithDefaultPassword,
        createdBy: req.user.id
    });

    if (user) {
        // Governance: Audit Log
        await createAuditLog('CREATE_USER', req.user.id, user._id, department, { role, email });

        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
            createdBy: req.user.id
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin/HOD
const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Governance: HOD Restrictions
        if (req.user.role === 'hod') {
            if (user.department.toString() !== req.user.department.toString()) {
                return res.status(403).json({ message: 'Not authorized to update users from other departments' });
            }
            // Prevent HOD from changing user's department
            if (req.body.department && req.body.department !== user.department.toString()) {
                return res.status(403).json({ message: 'HODs cannot change user department' });
            }
            // Prevent HOD from promoting to Admin/HOD
            if (req.body.role && (req.body.role === 'admin' || req.body.role === 'hod')) {
                return res.status(403).json({ message: 'HODs cannot promote users to Admin or HOD' });
            }
        }

        // Capture old values for audit
        const oldValues = { role: user.role, department: user.department, isActive: user.isActive };

        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        // Only update department if allowed (Admin) or if logic permits (HOD shouldn't be sending it usually if blocked above)
        if (req.user.role === 'admin') {
            user.department = req.body.department || user.department;
        }

        user.fullName = req.body.fullName || user.fullName;
        user.academicYear = req.body.academicYear || user.academicYear;
        user.semester = req.body.semester || user.semester;

        if (req.body.password) {
            user.password = req.body.password;
        }

        // Governance: Reactivate
        if (req.body.isActive !== undefined) {
            user.isActive = req.body.isActive;
        }

        if (req.file) {
            user.profileImage = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await user.save();

        // Governance: Audit Log
        const newValues = { ...req.body, isActive: updatedUser.isActive };
        if (req.file) newValues.profileImage = user.profileImage;

        await createAuditLog('UPDATE_USER', req.user.id, user._id, user.department, { old: oldValues, new: newValues });

        res.json({
            _id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            isActive: updatedUser.isActive
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Soft Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin/HOD
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Governance: HOD Restrictions
        if (req.user.role === 'hod') {
            if (user.department.toString() !== req.user.department.toString()) {
                return res.status(403).json({ message: 'Not authorized to delete users from other departments' });
            }
        }

        // Governance: Soft Delete
        user.isActive = false;
        await user.save();

        // Governance: Audit Log
        await createAuditLog('SOFT_DELETE_USER', req.user.id, user._id, user.department, { email: user.email });

        res.json({ message: 'User deactivated (Soft Delete)' });
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

        let studentQuery = { role: 'student', isActive: true }; // Filter active
        let staffQuery = { role: 'staff', isActive: true };
        let deptQuery = {};
        let subjectQuery = {};

        // Governance: HOD Views Stats for OWN Department only
        if (req.user.role === 'hod') {
            const deptId = req.user.department;
            studentQuery.department = deptId;
            staffQuery.department = deptId;
            // Dept count is always 1 for HOD perspective (their own), or we can show total system depts? 
            // Usually HOD wants to see "My Department" stats. 
            // But let's keep deptCount as system wide or maybe filter?
            // "HOD Dashboard: Department-only metrics". 
            // So HOD shouldn't see system-wide dept count, but asking for "deptCount" within a single dept context is trivial (1).
            // Let's filter Subject count by dept.
            subjectQuery.department = deptId;
        }

        const studentCount = await User.countDocuments(studentQuery);
        const staffCount = await User.countDocuments(staffQuery);
        // For Admin: All depts. For HOD: Maybe just show 1? Or keep system visibility? 
        // Requirement says: "HOD Dashboard: Department-only metrics".
        const deptCount = req.user.role === 'hod' ? 1 : await Department.countDocuments(deptQuery);
        const subjectCount = await Subject.countDocuments(subjectQuery);

        // System Health & Storage (Admin only)
        let storageStats = null;
        if (req.user.role === 'admin') {
            const uploadsPath = path.join(__dirname, '../uploads');
            const totalSize = getDirectorySize(uploadsPath);
            storageStats = {
                totalSizeBytes: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                capacityBytes: 1024 * 1024 * 1024, // 1GB mock capacity
                percentUsed: ((totalSize / (1024 * 1024 * 1024)) * 100).toFixed(1)
            };
        }

        res.json({
            studentCount,
            staffCount,
            deptCount,
            subjectCount,
            storage: storageStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Promote students to next semester
// @route   POST /api/users/promote
// @access  Private/Admin
const promoteStudents = async (req, res) => {
    let { department, currentSemester, newSemester, academicYear } = req.body;

    if (!currentSemester || !newSemester) {
        return res.status(400).json({ message: 'Please provide current semester and new semester' });
    }

    // Governance: HOD Restrictions
    if (req.user.role === 'hod') {
        // Force department
        department = req.user.department;
    } else if (!department) {
        // Admin must provide department
        return res.status(400).json({ message: 'Please provide department' });
    }

    try {
        const updateData = { semester: newSemester };
        if (academicYear) {
            updateData.academicYear = academicYear;
        }

        const result = await User.updateMany(
            { role: 'student', department: department, semester: currentSemester, isActive: true }, // Only promote active
            { $set: updateData }
        );

        // Governance: Audit Log
        await createAuditLog('PROMOTE_SEMESTER', req.user.id, null, department, { from: currentSemester, to: newSemester, count: result.modifiedCount });

        res.json({
            message: `Successfully promoted students from Sem ${currentSemester} to Sem ${newSemester}`,
            count: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get staff profile context-aware
// @route   GET /api/users/staff/:id
// @access  Private/Admin/HOD
const getStaffProfile = async (req, res) => {
    try {
        const staff = await User.findById(req.params.id).select('-password');
        if (!staff || staff.role !== 'staff') {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        const Subject = require('../models/Subject');

        // Context-Aware Rendering Check
        const isPrimaryHOD = req.user.role === 'admin' || (req.user.role === 'hod' && req.user.department === staff.department);

        if (isPrimaryHOD) {
            // Full visibility
            const allSubjects = await Subject.find({ staff: staff._id });
            res.json({
                profile: staff,
                subjects: allSubjects,
                visibility: 'FULL'
            });
        } else {
            // Limited visibility (Other Department HOD)
            // They can only see subjects this staff teaches IN THEIR department
            const localSubjects = await Subject.find({ staff: staff._id, department: req.user.department });

            res.json({
                profile: {
                    _id: staff._id,
                    username: staff.username,
                    email: staff.email,
                    department: staff.department, // Primary dept
                    profileImage: staff.profileImage
                },
                subjects: localSubjects,
                visibility: 'LIMITED_CONTEXT'
            });
        }
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
    promoteStudents,
    getStaffProfile,
    bulkUpdateStudents
};
