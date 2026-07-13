const Subject = require('../models/Subject');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const AuditLog = require('../models/AuditLog');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin/HOD
const createSubject = async (req, res) => {
    let { name, code, department, semester, academicYear, credits, type, contactHours } = req.body;

    // Default contact hours based on type if not provided
    if (!contactHours) {
        if (type === 'Lab') contactHours = 4;
        else if (type === 'Theory') contactHours = 3;
        else if (type === 'Project') contactHours = 2;
    }

    // Governance: HOD Restrictions
    if (req.user.role === 'hod') {
        department = req.user.department;
    } else if (!department && req.user.role === 'admin') {
        return res.status(400).json({ message: 'Please provide department' });
    }

    const subject = await Subject.create({
        name,
        code,
        department,
        semester,
        academicYear,
        credits: credits || 3,
        type: type || 'Theory',
        contactHours: contactHours || 3
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
    const queryFilters = [];
    if (semester) queryFilters.push({ semester });
    if (academicYear) queryFilters.push({ academicYear });

    if (department && staffId) {
        queryFilters.push({ $or: [{ department }, { staff: staffId }, { staffId: staffId }] });
    } else if (department) {
        queryFilters.push({ department });
    } else if (staffId) {
        queryFilters.push({ $or: [{ staff: staffId }, { staffId: staffId }] });
    }

    const query = queryFilters.length > 0 ? { $and: queryFilters } : {};

    console.log("getSubjects Query:", query);
    const subjects = await Subject.find(query).populate('staff', 'username fullName email');
    console.log(`Found ${subjects.length} subjects for query`);
    res.json(subjects);
};

// @desc    Assign staff to subject
// @route   PUT /api/subjects/:id/assign
// @access  Private/Admin/HOD
const assignStaff = async (req, res) => {
    const { staffId } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (subject) {
        // Governance: Check if user is HOD, they can only assign within their department
        if (req.user.role === 'hod' && subject.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to assign staff for other departments' });
        }

        // Check if staff exists and is actually a staff member
        const staffUser = await User.findById(staffId);
        if (!staffUser || staffUser.role !== 'staff' || !staffUser.isActive) {
            return res.status(400).json({ message: 'Invalid or inactive staff user' });
        }


        console.log(`Assigning staff ${staffId} to subject ${subject.code}`);
        // Standardize: Set both legacy and array fields for backward compatibility
        subject.staffId = staffId;
        if (!subject.staff.some(id => id.toString() === staffId.toString())) {
            subject.staff.push(staffId);
        }

        await subject.save();
        console.log(`Saved subject ${subject.code} with staff ${staffId}`);

        // Create Immutable Audit Log
        try {
            await AuditLog.create({
                action: 'ASSIGN_SUBJECT_STAFF',
                performedBy: req.user.id,
                targetId: subject._id,
                targetModel: 'Subject',
                department: subject.department,
                details: {
                    staffId: staffId,
                    staffName: staffUser.username,
                    staffDepartment: staffUser.department,
                    academicYear: subject.academicYear,
                    assignedByRole: req.user.role
                }
            });
        } catch (err) {
            console.error('Audit log failed during subject assignment:', err);
        }

        res.json({ subject, status: 'assigned' });
    } else {
        res.status(404).json({ message: 'Subject not found' });
    }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin/HOD
const updateSubject = async (req, res) => {
    const { name, code, semester, academicYear, credits, type, contactHours } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (subject) {
        // Governance: Check if user is HOD, they can only update within their department
        if (req.user.role === 'hod' && subject.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to update subject for other departments' });
        }

        subject.name = name || subject.name;
        subject.code = code || subject.code;
        subject.semester = semester || subject.semester;
        subject.academicYear = academicYear || subject.academicYear;
        subject.credits = credits || subject.credits;
        subject.type = type || subject.type;
        subject.contactHours = contactHours || subject.contactHours;

        const updatedSubject = await subject.save();

        // Audit Log
        try {
            await AuditLog.create({
                action: 'UPDATE_SUBJECT',
                performedBy: req.user.id,
                targetId: subject._id,
                targetModel: 'Subject',
                department: subject.department,
                details: {
                    updatedFields: Object.keys(req.body),
                    semester: subject.semester,
                    academicYear: subject.academicYear
                }
            });
        } catch (e) {}

        res.json(updatedSubject);
    } else {
        res.status(404).json({ message: 'Subject not found' });
    }
};

// @desc    Delete a subject (Soft Delete)
// @route   DELETE /api/subjects/:id
// @access  Private/Admin/HOD
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        // Governance check
        if (req.user.role === 'hod' && subject.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to delete subject for other departments' });
        }

        // We use soft delete (archiving) rather than permanent delete to preserve historical data
        subject.isArchived = true;
        await subject.save();

        // Audit Log
        try {
            await AuditLog.create({
                action: 'DELETE_SUBJECT',
                performedBy: req.user.id,
                targetId: subject._id,
                targetModel: 'Subject',
                department: subject.department || req.user.department,
                details: { name: subject.name, code: subject.code }
            });
        } catch (e) {}

        res.json({ message: 'Subject archived successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get eligible staff for subject with intelligence metrics
// @route   GET /api/subjects/:id/eligible-staff
// @access  Private/Admin/HOD
const getEligibleStaffForSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        // query for all eligible active staff
        const staffQuery = { role: 'staff', isActive: true };
        const eligibleStaff = await User.find(staffQuery).select('-password');

        const intelligenceData = await Promise.all(eligibleStaff.map(async (staff) => {
            // 1. Workload Metrics
            const staffSubjects = await Subject.find({ staff: staff._id });
            const totalSubjectsAssigned = staffSubjects.length;
            const currentSemesterSubjects = staffSubjects.filter(s => s.semester === subject.semester).length;

            // Calculate active students load (approx: count students in the same department and semester as their assigned subjects)
            let totalStudentsLoad = 0;
            const subjectFilters = staffSubjects.map(s => ({ department: s.department, semester: s.semester, role: 'student', isActive: true }));
            if (subjectFilters.length > 0) {
                // Find unique students
                const students = await User.find({ $or: subjectFilters }).select('_id');
                totalStudentsLoad = students.length;
            }

            // Pending evaluations
            const staffAssignments = await Assignment.find({ createdBy: staff._id }).select('_id');
            const assignmentIds = staffAssignments.map(a => a._id);
            const pendingEvaluations = await Submission.countDocuments({ assignment: { $in: assignmentIds }, status: 'submitted' });

            // Total evaluations (for rate)
            const totalSubmissions = await Submission.countDocuments({ assignment: { $in: assignmentIds } });
            const gradedSubmissions = await Submission.countDocuments({ assignment: { $in: assignmentIds }, status: { $in: ['graded'] } });
            const evaluationCompletionRate = totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 100;

            // Average Performance
            const submissionsWithMarks = await Submission.find({ assignment: { $in: assignmentIds }, status: 'graded', marks: { $exists: true } }).populate('assignment', 'maxMarks');
            let totalPercentage = 0;
            let passCount = 0;

            submissionsWithMarks.forEach(sub => {
                const max = sub.assignment ? sub.assignment.maxMarks : 100;
                const pct = max > 0 ? (sub.marks / max) * 100 : 0;
                totalPercentage += pct;
                if (pct >= 40) passCount++; // Assuming 40% is pass
            });

            const averagePerformance = submissionsWithMarks.length > 0 ? totalPercentage / submissionsWithMarks.length : 0;
            const passPercentage = submissionsWithMarks.length > 0 ? (passCount / submissionsWithMarks.length) * 100 : 0;

            return {
                staff: {
                    _id: staff._id,
                    username: staff.username,
                    email: staff.email,
                    department: staff.department
                },
                metrics: {
                    totalSubjectsAssigned,
                    currentSemesterSubjects,
                    totalStudentsLoad,
                    pendingEvaluations,
                    averagePerformance,
                    passPercentage,
                    evaluationCompletionRate,
                    weeklyHours: staffSubjects.reduce((acc, s) => acc + (s.contactHours || 0), 0),
                    utilization: Math.round((staffSubjects.reduce((acc, s) => acc + (s.contactHours || 0), 0) / 18) * 100)
                }
            };
        }));

        res.json(intelligenceData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Errors computing intelligence' });
    }
};


// @desc    Get workload statistics for all staff in department
// @route   GET /api/subjects/workload/stats
// @access  Private/HOD
const getStaffWorkload = async (req, res) => {
    try {
        const department = req.user.role === 'admin' ? req.query.department : req.user.department;
        if (!department) return res.status(400).json({ message: 'Department is required' });

        const staffList = await User.find({ role: 'staff', department, isActive: true }).select('username fullName email');
        const subjects = await Subject.find({ department });

        const MAX_HOURS = 18; // Standard max hours per week

        const workloadStats = staffList.map(staff => {
            const assignedSubjects = subjects.filter(s => s.staff.some(id => id.toString() === staff._id.toString()));
            const totalHours = assignedSubjects.reduce((acc, s) => acc + (s.contactHours || 0), 0);
            const totalCredits = assignedSubjects.reduce((acc, s) => acc + (s.credits || 0), 0);

            let status = 'Low';
            let color = 'emerald'; // Green
            if (totalHours > MAX_HOURS) {
                status = 'Overloaded';
                color = 'red';
            } else if (totalHours >= 14) {
                status = 'High';
                color = 'orange';
            } else if (totalHours >= 8) {
                status = 'Medium';
                color = 'amber';
            }

            return {
                staffId: staff._id,
                name: staff.fullName || staff.username,
                email: staff.email,
                totalSubjects: assignedSubjects.length,
                totalHours,
                totalCredits,
                utilization: Math.round((totalHours / MAX_HOURS) * 100),
                status,
                color,
                subjects: assignedSubjects.map(s => ({ name: s.name, code: s.code, hours: s.contactHours }))
            };
        });

        res.json(workloadStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get subjects for currently logged in student based on dept/sem
// @route   GET /api/subjects/my-enrolled
// @access  Private/Student
const getMyEnrolledSubjects = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can view enrolled subjects' });
        }

        const subjects = await Subject.find({
            department: req.user.department,
            semester: req.user.semester,
            isArchived: false
        }).populate('staff', 'username fullName profileImage');

        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get subjects assigned to currently logged in staff
// @route   GET /api/subjects/my-assigned
// @access  Private/Staff
const getMyAssignedSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({
            staff: req.user.id,
            isArchived: false
        }).populate('staff', 'username fullName profileImage');

        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSubject,
    getSubjects,
    updateSubject,
    assignStaff,
    deleteSubject,
    getEligibleStaffForSubject,
    getStaffWorkload,
    getMyEnrolledSubjects,
    getMyAssignedSubjects
};
