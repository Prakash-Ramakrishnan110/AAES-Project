const StudentDocument = require('../models/StudentDocument');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ClassAdvisor = require('../models/ClassAdvisor');

// @desc    Upload document
// @route   POST /api/student-documents
// @access  Private/Student
exports.uploadDocument = async (req, res) => {
    console.log('UPLOAD REQUEST BODY:', req.body);
    console.log('UPLOAD REQUEST FILE:', req.file);
    console.log('UPLOAD REQUEST USER:', req.user ? { _id: req.user._id, role: req.user.role, dept: req.user.department } : 'MISSING');

    try {
        const { category, documentType, semester, academicYear } = req.body;
        
        let fileUrl = req.body.fileUrl; 
        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        console.log('Final File URL:', fileUrl);

        if (!fileUrl) {
            return res.status(400).json({ success: false, message: 'File is required. No file received by server.' });
        }

        const doc = new StudentDocument({
            studentId: req.user._id,
            department: req.user.department || 'General',
            category: category || 'Personal',
            documentType,
            semester: parseInt(semester) || 0,
            academicYear: academicYear || req.user.academicYear || '2023-2024',
            fileUrl
        });

        await doc.save();
        res.status(201).json({ success: true, data: doc });
    } catch (error) {
        console.error('CRITICAL UPLOAD ERROR:', error);
        res.status(500).json({ 
            success: false, 
            message: `Server error: ${error.message}`,
            debug: error.stack,
            body: req.body,
            file: req.file ? 'Received' : 'Missing'
        });
    }
};

// @desc    Get student's own documents
// @route   GET /api/student-documents/me
// @access  Private/Student
exports.getMyDocuments = async (req, res) => {
    try {
        console.log('GET MY DOCUMENTS FOR:', req.user?._id);
        const docs = await StudentDocument.find({ studentId: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: docs.length, data: docs });
    } catch (error) {
        console.error('GET MY DOCUMENTS ERROR:', error);
        res.status(500).json({ 
            success: false, 
            message: `Server error: ${error.message}`,
            debug: error.stack 
        });
    }
};

// @desc    Get all department documents pending verification
// @route   GET /api/student-documents/department
// @access  Private/HOD/Admin
exports.getDepartmentDocuments = async (req, res) => {
    try {
        const statusFilter = req.query.status || 'Pending';
        const dept = req.user.department?.toString().trim();

        let query = {};
        
        if (req.user.role === 'hod' || req.user.role === 'admin') {
            query.department = dept;
        } else if (req.user.role === 'staff') {
            // 1. Find explicit students (where this staff is directly set as classAdvisor)
            const explicitStudents = await User.find({ classAdvisor: req.user._id }).select('_id');
            const explicitStudentIds = explicitStudents.map(s => s._id);
            
            // 2. Find students by Dept/Year via ClassAdvisor record (Official Mapping)
            // Note: req.user might have department/academicYear but ClassAdvisor is the source of truth for assignments
            const advisorRecord = await ClassAdvisor.findOne({ staff: req.user._id });
            let deptYearStudentIds = [];
            
            if (advisorRecord) {
                const studentsByDeptYear = await User.find({ 
                    role: 'student', 
                    department: advisorRecord.department, 
                    academicYear: advisorRecord.academicYear 
                }).select('_id');
                deptYearStudentIds = studentsByDeptYear.map(s => s._id);
            }
            
            // Combine both sets (Set handles duplicates)
            const allStudentIds = [...new Set([...explicitStudentIds.map(id => id.toString()), ...deptYearStudentIds.map(id => id.toString())])];
            query = { studentId: { $in: allStudentIds } };
        }

        if (statusFilter !== 'All') {
            query.status = statusFilter;
        }

        const docs = await StudentDocument.find(query)
            .populate({ path: 'studentId', select: 'fullName registerNumber email', options: { strictPopulate: false } })
            .populate({ path: 'verifiedBy', select: 'fullName username', options: { strictPopulate: false } })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ success: true, count: docs.length, data: docs || [] });
    } catch (error) {
        console.error('Get department documents error:', error.message, error.stack);
        res.status(500).json({ success: false, message: 'Server error fetching documents.', error: error.message });
    }
};

// @desc    Verify/Reject Document
// @route   PUT /api/student-documents/:id/verify
// @access  Private/HOD/Admin
exports.verifyDocument = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        const doc = await StudentDocument.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        // HODs can only verify documents from their department
        if (req.user.role === 'HOD' && doc.department?.toString() !== req.user.department?.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized for this department.' });
        }

        doc.status = status;
        doc.verifiedBy = req.user._id;

        if (status === 'Rejected' && rejectionReason) {
            doc.rejectionReason = rejectionReason;
        }

        await doc.save();

        // Notify Student
        try {
            await Notification.create({
                user: doc.studentId,
                type: 'Info',
                title: `Document ${status}`,
                message: `Your uploaded ${doc.documentType} has been ${status.toLowerCase()} by administration.`
            });
        } catch (notifErr) {
            console.error('Notification error:', notifErr.message);
        }

        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.error('Verify document error:', error);
        res.status(500).json({ success: false, message: 'Server error verifying document.' });
    }
};
