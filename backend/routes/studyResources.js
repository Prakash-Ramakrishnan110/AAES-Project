const express = require('express');
const router = express.Router();
const StudyResource = require('../models/StudyResource');
const Subject = require('../models/Subject');
const { protect: auth } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const { createDynamicUpload } = require('../middleware/uploadMiddleware');

// Use middleware factory for organized storage
const uploadMiddleware = createDynamicUpload('resources');

// @route   POST /api/study-resources
// @desc    Upload a new study resource
// @access  Private (Staff only)
router.post('/', auth, uploadMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'staff' && req.user.role !== 'admin' && req.user.role !== 'hod') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { subjectId, title, unit, type, academicYear, semester } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const identifier = req.user?.registerNumber || req.user?._id?.toString() || 'anonymous';
        const fileUrl = `/uploads/${identifier}/resources/${req.file.filename}`;

        const newResource = new StudyResource({
            subjectId,
            title,
            unit,
            type,
            academicYear,
            semester,
            fileUrl,
            uploadedBy: req.user.id,
            visible: true
        });

        await newResource.save();

        // Trigger OCR/Text extraction asynchronously
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.file.path));

            const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
            axios.post(`${pythonApiUrl}/extract_text`, formData, {
                headers: formData.getHeaders()
            }).then(async (response) => {
                if (response.data && response.data.text) {
                    newResource.extractedText = response.data.text;
                    await newResource.save();
                    console.log(`Text extracted for resource ${newResource._id}`);
                }
            }).catch(err => {
                console.error('Error extracting text from Python service:', err.message);
            });
        } catch (err) {
            console.error('Failed to initiate text extraction:', err);
        }

        res.status(201).json(newResource);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/study-resources
// @desc    Get all visible resources meant for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let query = { visible: true };

        if (req.user.role === 'student') {
            // Student should only see resources for their semester, academicYear, and department
            // Let's find subjects that match the student's context
            const studentSubjects = await Subject.find({
                department: new RegExp(`^${req.user.department}$`, 'i'),
                semester: req.user.semester
            }).select('_id');
            const subjectIds = studentSubjects.map(s => s._id);

            query.subjectId = { $in: subjectIds };
        } else if (req.user.role === 'staff') {
            // Staff should only see resources for subjects they teach
            const staffSubjects = await Subject.find({ staff: req.user.id }).select('_id');
            const subjectIds = staffSubjects.map(s => s._id);

            query.subjectId = { $in: subjectIds };
        } else if (req.user.role === 'hod') {
            // HOD sees all resources in their department
            const deptSubjects = await Subject.find({ department: req.user.department }).select('_id');
            const subjectIds = deptSubjects.map(s => s._id);

            query.subjectId = { $in: subjectIds };
        }

        const resources = await StudyResource.find(query)
            .sort({ createdAt: -1 })
            .populate('subjectId', 'name code semester')
            .populate('uploadedBy', 'username fullName');

        res.json(resources);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/study-resources/subject/:subjectId
// @desc    Get resources by subject
// @access  Private
router.get('/subject/:subjectId', auth, async (req, res) => {
    try {
        const resources = await StudyResource.find({
            subjectId: req.params.subjectId,
            visible: true
        }).sort({ createdAt: -1 }).populate('uploadedBy', 'username fullName');

        res.json(resources);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/study-resources/resource/:id
// @desc    Get single resource
// @access  Private
router.get('/resource/:id', auth, async (req, res) => {
    try {
        const resource = await StudyResource.findById(req.params.id)
            .populate('subjectId', 'name code')
            .populate('uploadedBy', 'username fullName');

        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        res.json(resource);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/study-resources/:id
// @desc    Delete a resource
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const resource = await StudyResource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'hod') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await resource.deleteOne();

        // Optionally delete the file
        const filePath = path.join(__dirname, '../', resource.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: 'Resource removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/study-resources/:id/ask-ai
// @desc    Ask AI doubt assistant about a resource
// @access  Private
router.post('/:id/ask-ai', auth, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ message: 'Question is required' });
        if (question.length > 500) return res.status(400).json({ message: 'Question is too long' });

        const resource = await StudyResource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        if (!resource.visible) return res.status(403).json({ message: 'Resource is not available' });
        if (!resource.extractedText) return res.status(400).json({ message: 'AI processing is not available for this resource yet. Please wait for OCR to complete.' });

        const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
        const aiResponse = await axios.post(`${pythonApiUrl}/ask_doubt`, {
            question,
            context: resource.extractedText
        });

        res.json({ answer: aiResponse.data.answer });
    } catch (err) {
        console.error('AI Error:', err.message);
        res.status(500).json({ message: 'Failed to process AI request' });
    }
});

module.exports = router;
