const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const StudyMaterial = require('../models/StudyMaterial');
const Subject = require('../models/Subject');
const { protect: authMiddleware } = require('../middleware/authMiddleware'); // Verify path

// Ensure uploads/study_materials directory exists
const uploadDir = path.join(__dirname, '../uploads/study_materials');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer generic config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed!'));
        }
    }
});

const axios = require('axios');
const FormData = require('form-data');

// Helper Function for File Processing
const extractTextFromFile = async (filePath, mimetype) => {
    let extractedText = '';

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
        const response = await axios.post(`${pythonApiUrl}/extract_text`, formData, {
            headers: formData.getHeaders()
        });

        if (response.data && response.data.text) {
            extractedText = response.data.text;
        } else {
            extractedText = 'Failed to extract text from this document. It may still be downloaded.';
        }
    } catch (error) {
        console.error("Text extraction failed:", error);
        extractedText = "Failed to extract text from this document. It may still be downloaded.";
    }

    // Basic cleaning to reduce LLM token bloat
    if (extractedText) {
        extractedText = extractedText.replace(/\s+/g, ' ').trim();
    }

    return extractedText;
};


// @route   POST /api/study-materials/upload
// @desc    Upload study material (Staff/HOD/Admin)
// @access  Private
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { subjectId, title, unit, type, academicYear, semester } = req.body;

        if (!subjectId || !title || !unit || !type || !academicYear || !semester) {
            // Clean up uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate subject exists
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Extract Text for AI Prompt injection
        const rawText = await extractTextFromFile(req.file.path, req.file.mimetype);

        // Limit extracted text to prevent massive token injections (e.g. ~50k chars max)
        const maxTextLength = 50000;
        const extractedText = rawText.length > maxTextLength
            ? rawText.substring(0, maxTextLength) + "\n\n[TEXT TRUNCATED DUE TO LENGTH LIMIT]"
            : rawText;

        const fileUrl = `/uploads/study_materials/${req.file.filename}`;

        const newMaterial = new StudyMaterial({
            subjectId,
            title,
            unit,
            type,
            academicYear,
            semester,
            fileUrl,
            extractedText,
            uploadedBy: req.user._id
        });

        await newMaterial.save();

        res.status(201).json({
            message: 'Study material uploaded and processed successfully',
            material: newMaterial
        });

    } catch (error) {
        console.error("Upload error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: error.message || 'Server error during upload' });
    }
});

// @route   GET /api/study-materials
// @desc    Get all materials for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        let filters = { visible: true };

        if (req.user.role === 'student') {
            const Subject = require('../models/Subject');
            const studentSubjects = await Subject.find({
                department: new RegExp(`^${req.user.department}$`, 'i'),
                semester: req.user.semester
            }).select('_id');
            const subjectIds = studentSubjects.map(s => s._id);

            filters.subjectId = { $in: subjectIds };
        } else if (req.user.role === 'staff') {
            const Subject = require('../models/Subject');
            const staffSubjects = await Subject.find({ staff: req.user._id }).select('_id');
            const subjectIds = staffSubjects.map(s => s._id);

            filters.subjectId = { $in: subjectIds };
        } else if (req.user.role === 'hod') {
            const Subject = require('../models/Subject');
            const deptSubjects = await Subject.find({ department: req.user.department }).select('_id');
            const subjectIds = deptSubjects.map(s => s._id);

            filters.subjectId = { $in: subjectIds };
        }

        const materials = await StudyMaterial.find(filters)
            .select('-extractedText')
            .populate('subjectId', 'name code semester')
            .populate('uploadedBy', 'fullName username')
            .sort({ createdAt: -1 });

        res.json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching materials' });
    }
});

// @route   GET /api/study-materials/subject/:subjectId
// @desc    Get materials for a specific subject
// @access  Private (Students + Staff)
router.get('/subject/:subjectId', authMiddleware, async (req, res) => {
    try {
        const filters = { subjectId: req.params.subjectId };

        // If student, only see visible ones
        if (req.user.role === 'student') {
            filters.visible = true;
        }

        // Exclude extractedText in general listings to save bandwidth
        const materials = await StudyMaterial.find(filters)
            .select('-extractedText')
            .populate('uploadedBy', 'fullName username')
            .sort({ createdAt: -1 });

        res.json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching materials' });
    }
});

// @route   GET /api/study-materials/:id
// @desc    Get single material with text (for AI Context)
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id)
            .populate('subjectId', 'name code')
            .populate('uploadedBy', 'fullName');

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Optional: Add visibility check for students
        if (req.user.role === 'student' && !material.visible) {
            return res.status(403).json({ message: 'Not authorized to view this material' });
        }

        res.json(material);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching material details' });
    }
});

// @route   DELETE /api/study-materials/:id
// @desc    Delete material (Staff only for their own, or HOD/Admin)
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Auth check... staff can only delete their own, unless admin/hod
        if (req.user.role === 'staff' && material.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this material' });
        }

        // Delete physical file
        const filePath = path.join(__dirname, '../', material.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await material.deleteOne();
        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting material' });
    }
});

module.exports = router;
