const StudentDocument = require('../models/StudentDocument');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ClassAdvisor = require('../models/ClassAdvisor');
const fs = require('fs');
const path = require('path');

// @desc    Upload document
// @route   POST /api/student-documents
// @access  Private/Student
exports.uploadDocument = async (req, res) => {
    console.log('UPLOAD REQUEST BODY:', req.body);
    console.log('UPLOAD REQUEST FILE:', req.file);

    try {
        const { category, documentType, semester, academicYear } = req.body;
        
        let fileUrl = req.body.fileUrl; 
        if (req.file) {
            const namePart = req.user?.fullName ? req.user.fullName.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Student';
            const regPart = req.user?.registerNumber || req.user?._id?.toString() || 'ID';
            const identifier = `${namePart}_${regPart}`.toLowerCase();
            const bodyCategory = req.body?.category ? req.body.category.toString().trim() : '';
            
            // Build consistent path including category subfolder
            fileUrl = `/uploads/${identifier}/${bodyCategory}/${req.file.filename}`;
            console.log(`[DocumentController] Document assigned path: ${fileUrl} (Category: ${bodyCategory})`);
        }

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

// @desc    Delete Document
// @route   DELETE /api/student-documents/:id
// @access  Private/HOD/Admin/Staff
exports.deleteDocument = async (req, res) => {
    try {
        const doc = await StudentDocument.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        // Authorization check
        if (req.user.role === 'hod' && doc.department?.toString() !== req.user.department?.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized for this department.' });
        }

        // Delete physical file
        if (doc.fileUrl) {
            const filePath = path.join(__dirname, '..', doc.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await StudentDocument.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Document deleted successfully.' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting document.' });
    }
};

const archiver = require('archiver');

// @desc    Download all student documents as ZIP
// @route   GET /api/student-documents/download-all/:studentId
// @access  Private/HOD/Admin/Staff
exports.downloadAllDocuments = async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log(`[ZIP] Requesting ZIP for Student: ${studentId}`);

        let student = await User.findById(studentId);
        
        // Fallback: If not found by ID, maybe it's a register number?
        if (!student) {
            student = await User.findOne({ registerNumber: studentId });
        }

        if (!student) {
            console.error(`[ZIP] Student NOT found: ${studentId}`);
            return res.status(404).json({ success: false, message: 'Student not found in database.' });
        }

        const namePart = (student.fullName || 'Student').trim().replace(/[^a-zA-Z0-9]/g, '_');
        const regPart = (student.registerNumber || student._id.toString()).trim();
        const identifier = `${namePart}_${regPart}`.toLowerCase();
        
        const uploadBase = path.resolve(process.cwd(), 'uploads');
        let studentFolder = path.join(uploadBase, identifier);
        const oldIdentifier = regPart.toLowerCase();
        const oldFolder = path.join(uploadBase, oldIdentifier);

        console.log(`[ZIP] Base Path: ${uploadBase}`);
        console.log(`[ZIP] Checking Folders: Primary(${studentFolder}), Legacy(${oldFolder})`);

        if (!fs.existsSync(studentFolder)) {
            if (fs.existsSync(oldFolder)) {
                console.log(`[ZIP] Found Legacy folder: ${oldFolder}`);
                studentFolder = oldFolder;
            } else {
                console.warn(`[ZIP] Directory not found for ${identifier} at ${studentFolder}`);
                return res.status(404).json({ 
                    success: false, 
                    message: `No document directory found for student. Please ensure documents are uploaded.`,
                    debug: { path: studentFolder, identifier }
                });
            }
        }

        const files = fs.readdirSync(studentFolder);
        console.log(`[ZIP] Directory contents for ${identifier}:`, files);
        
        if (files.length === 0) {
            console.warn(`[ZIP] Directory is EMPTY: ${studentFolder}`);
            return res.status(400).json({ success: false, message: `Student directory exists but is empty.` });
        }

        // Set attachment headers
        res.attachment(`${identifier}_Documents.zip`);

        const archive = archiver('zip', { zlib: { level: 9 } });

        // Pipe the archive to the response
        archive.pipe(res);

        // Listen for warnings (like stat failures)
        archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                console.warn('[ZIP] Archiver warning:', err);
            } else {
                throw err;
            }
        });

        archive.on('error', function(err) {
            console.error('[ZIP] Archiver error:', err);
            throw err;
        });

        // Add the directory
        archive.directory(studentFolder, false);

        // Finalize
        console.log(`[ZIP] Finalizing archive for ${identifier}...`);
        await archive.finalize();
        console.log(`[ZIP] Archive sent successfully for ${identifier}`);

    } catch (error) {
        console.error('[ZIP] Critical failure:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Server error generating ZIP archive.' });
        }
    }
};

// @desc    Download multiple documents as ZIP
// @route   POST /api/student-documents/bulk-download
// @access  Private/HOD/Admin/Staff
exports.bulkDownloadDocuments = async (req, res) => {
    try {
        const { documentIds } = req.body;
        console.log('[BULK ZIP] Received request for IDs:', documentIds);

        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
            console.log('[BULK ZIP] No valid document IDs provided');
            return res.status(400).json({ success: false, message: 'No documents selected for download.' });
        }

        const docs = await StudentDocument.find({ _id: { $in: documentIds } })
            .populate({ path: 'studentId', select: 'fullName registerNumber' });
        
        console.log(`[BULK ZIP] Found ${docs.length} documents in database`);

        if (docs.length === 0) {
            return res.status(404).json({ success: false, message: 'No matching documents found in database.' });
        }

        // Set attachment headers
        const zipName = `Bulk_Documents_${new Date().toISOString().split('T')[0]}.zip`;
        res.attachment(zipName);
        res.setHeader('Content-Type', 'application/zip');

        const archive = archiver('zip', { zlib: { level: 9 } });
        
        // Handle archive errors
        archive.on('error', (err) => {
            console.error('[BULK ZIP] Archiver error:', err);
            if (!res.headersSent) {
                res.status(500).send({ error: err.message });
            }
        });

        archive.pipe(res);

        let addedCount = 0;
        for (const doc of docs) {
            if (doc.fileUrl) {
                // Ensure we resolve the path correctly relative to the backend root
                const cleanPath = doc.fileUrl.startsWith('/') ? doc.fileUrl.substring(1) : doc.fileUrl;
                const filePath = path.resolve(process.cwd(), cleanPath);
                
                console.log(`[BULK ZIP] Checking file: ${filePath}`);

                if (fs.existsSync(filePath)) {
                    const student = doc.studentId;
                    const regNumber = student?.registerNumber || 'Unknown';
                    const fileExt = path.extname(filePath);
                    const fileNameInZip = `${regNumber}_${doc.documentType.replace(/\s+/g, '_')}_${doc._id.toString().slice(-4)}${fileExt}`;
                    
                    archive.file(filePath, { name: fileNameInZip });
                    addedCount++;
                    console.log(`[BULK ZIP] Added: ${fileNameInZip}`);
                } else {
                    console.warn(`[BULK ZIP] File MISSING on disk: ${filePath}`);
                }
            }
        }

        if (addedCount === 0) {
            console.warn('[BULK ZIP] No files were successfully added to archive');
            return res.status(404).json({ success: false, message: 'None of the selected documents were found on the server disk.' });
        }

        console.log(`[BULK ZIP] Finalizing archive with ${addedCount} files...`);
        await archive.finalize();
        console.log('[BULK ZIP] Archive sent successfully');


    } catch (error) {
        console.error('[BULK ZIP] Critical failure:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Server error generating bulk ZIP archive.' });
        }
    }
};

module.exports = {
    uploadDocument: exports.uploadDocument,
    getMyDocuments: exports.getMyDocuments,
    getDepartmentDocuments: exports.getDepartmentDocuments,
    verifyDocument: exports.verifyDocument,
    deleteDocument: exports.deleteDocument,
    downloadAllDocuments: exports.downloadAllDocuments,
    bulkDownloadDocuments: exports.bulkDownloadDocuments
};
