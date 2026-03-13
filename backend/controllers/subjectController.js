const Subject = require('../models/Subject');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const AuditLog = require('../models/AuditLog');
const StaffAssignmentRequest = require('../models/StaffAssignmentRequest');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin/HOD
const createSubject = async (req, res) => {
    let { name, code, department, semester, academicYear } = req.body;

    // Governance: HOD Restrictions
    if (req.user.role === 'hod') {
        // Force department to be HODs department
        department = req.user.department;
    } else if (!department && req.user.role === 'admin') {
        return res.status(400).json({ message: 'Please provide department' });
    }

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
    const queryFilters = [];
    if (semester) queryFilters.push({ semester });
    if (academicYear) queryFilters.push({ academicYear });

    if (department && staffId) {
        queryFilters.push({ $or: [{ department }, { staff: staffId }] });
    } else if (department) {
        queryFilters.push({ department });
    } else if (staffId) {
        queryFilters.push({ staff: staffId });
    }

    const query = queryFilters.length > 0 ? { $and: queryFilters } : {};

    console.log("getSubjects Query:", query);
    const subjects = await Subject.find(query).populate('staff', 'username email');
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

        // Cross-Department Workflow Logic
        if (req.user.role === 'hod' && staffUser.department !== req.user.department) {
            // Check if there is an existing pending request for this staff and subject
            const existingRequest = await StaffAssignmentRequest.findOne({
                subject: subject._id,
                staff: staffId,
                status: 'PENDING'
            });

            if (existingRequest) {
                return res.status(400).json({ message: 'An assignment request is already pending for this staff and subject' });
            }

            // Create a pending request
            await StaffAssignmentRequest.create({
                subject: subject._id,
                staff: staffId,
                requestedBy: req.user.id,
                requestingDepartment: req.user.department,
                staffPrimaryDepartment: staffUser.department,
                academicYear: subject.academicYear,
                status: 'PENDING'
            });

            // Log Audit
            try {
                await AuditLog.create({
                    action: 'CREATE_ASSIGNMENT_REQUEST',
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
            } catch (err) { console.error('Audit log failed during request creation:', err); }

            return res.status(202).json({ message: 'Assignment request sent to staff\'s primary department HOD for approval.', status: 'pending' });
        }

        // Direct Assignment (Admin or HOD within own department)
        if (!subject.staff.includes(staffId)) {
            subject.staff.push(staffId);
            await subject.save();

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
        }

        res.json({ subject, status: 'assigned' });
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
                    evaluationCompletionRate
                }
            };
        }));

        res.json(intelligenceData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Errors computing intelligence' });
    }
};

const getPendingAssignmentRequests = async (req, res) => {
    try {
        const requests = await StaffAssignmentRequest.find({
            staffPrimaryDepartment: req.user.department,
            status: 'PENDING'
        })
            .populate('subject', 'name code semester')
            .populate('staff', 'username email department')
            .populate('requestedBy', 'username email department')
            .sort({ createdAt: -1 });

        // Calculate Workload Intelligence for each staff in the requests
        const intelligenceData = await Promise.all(requests.map(async (request) => {
            const staffId = request.staff._id;

            // 1. Subjects Assigned
            const assignedSubjects = await Subject.find({ staff: staffId });
            const totalSubjectsAssigned = assignedSubjects.length;

            // 2. Pending Evaluations
            let pendingEvaluations = 0;
            const assignments = await Assignment.find({ createdBy: staffId });
            if (assignments.length > 0) {
                const assignmentIds = assignments.map(a => a._id);
                pendingEvaluations = await Submission.countDocuments({
                    assignment: { $in: assignmentIds },
                    status: 'submitted'
                });
            }

            // 3. Total Students Load (estimate based on enrolled students in subjects)
            let totalStudentsLoad = 0;
            for (const subj of assignedSubjects) {
                const enrolled = await User.countDocuments({
                    role: 'student',
                    department: subj.department,
                    semester: subj.semester,
                    academicYear: subj.academicYear
                });
                totalStudentsLoad += enrolled;
            }

            return {
                ...request.toObject(),
                workload: {
                    totalSubjectsAssigned,
                    totalStudentsLoad,
                    pendingEvaluations
                }
            };
        }));

        res.json(intelligenceData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve staff assignment request
// @route   PUT /api/subjects/assignment-requests/:id/approve
// @access  Private/HOD
const approveAssignmentRequest = async (req, res) => {
    try {
        const request = await StaffAssignmentRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request is already processed' });
        }

        if (req.user.department !== request.staffPrimaryDepartment) {
            return res.status(403).json({ message: 'Not authorized to approve for this department' });
        }

        const subject = await Subject.findById(request.subject);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Apply mapping
        if (!subject.staff.includes(request.staff)) {
            subject.staff.push(request.staff);
            await subject.save();
        }

        // Update Request
        request.status = 'APPROVED';
        await request.save();

        // Audit Log
        await AuditLog.create({
            action: 'APPROVE_ASSIGNMENT_REQUEST',
            performedBy: req.user.id,
            targetId: request._id,
            targetModel: 'StaffAssignmentRequest',
            department: req.user.department,
            details: { staffId: request.staff, subjectId: request.subject }
        });

        res.json({ message: 'Request approved successfully', request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject staff assignment request
// @route   PUT /api/subjects/assignment-requests/:id/reject
// @access  Private/HOD
const rejectAssignmentRequest = async (req, res) => {
    try {
        const request = await StaffAssignmentRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request is already processed' });
        }

        if (req.user.department !== request.staffPrimaryDepartment) {
            return res.status(403).json({ message: 'Not authorized to reject for this department' });
        }

        request.status = 'REJECTED';
        await request.save();

        // Audit Log
        await AuditLog.create({
            action: 'REJECT_ASSIGNMENT_REQUEST',
            performedBy: req.user.id,
            targetId: request._id,
            targetModel: 'StaffAssignmentRequest',
            department: req.user.department,
            details: { staffId: request.staff, subjectId: request.subject }
        });

        res.json({ message: 'Request rejected successfully', request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSubject,
    getSubjects,
    assignStaff,
    deleteSubject,
    getEligibleStaffForSubject,
    getPendingAssignmentRequests,
    approveAssignmentRequest,
    rejectAssignmentRequest
};
