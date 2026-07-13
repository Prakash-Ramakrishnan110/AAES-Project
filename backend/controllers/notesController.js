const Note = require('../models/Note');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const AI_SERVICE = 'http://127.0.0.1:8000';

// @desc    Upload notes and extract text
const uploadNote = async (req, res) => {
    try {
        const { subjectId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // The file is saved dynamically in uploads/identifier/notes/filename
        const filePath = req.file.path;
        
        // Convert backslashes to forward slashes and extract the relative path
        const normalizedPath = filePath.replace(/\\/g, '/');
        const uploadIndex = normalizedPath.indexOf('/uploads/');
        const fileUrl = uploadIndex !== -1 ? normalizedPath.substring(uploadIndex) : `/uploads/notes/${file.filename}`;

        // 1. Send to AI Service for OCR/Extraction and RAG indexing
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath), {
            filename: file.originalname,
            contentType: file.mimetype
        });
        formData.append('subject_id', subjectId);

        let extractedText = '';
        try {
            const aiRes = await axios.post(`${AI_SERVICE}/notes/upload`, formData, {
                headers: formData.getHeaders()
            });
            extractedText = aiRes.data.extracted_text;
        } catch (aiErr) {
            console.error('AI Service Error:', aiErr.message);
            // We still save the note even if AI fails, but with empty text
        }

        const note = await Note.create({
            subjectId,
            staffId: req.user.id,
            fileUrl,
            extractedText
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notes for a subject (Student)
const getNotesForSubject = async (req, res) => {
    try {
        const notes = await Note.find({ subjectId: req.params.subjectId })
            .populate('staffId', 'fullName');
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all study materials for current student based on department & semester
const getStudentStudyMaterials = async (req, res) => {
    try {
        const User = require('../models/User');
        const Subject = require('../models/Subject');
        const student = await User.findById(req.user.id);
        const subjects = await Subject.find({
            department: { $regex: new RegExp(`^${student.department}$`, 'i') },
            semester: student.semester
        });
        const subjectIds = subjects.map(s => s._id);

        const notes = await Note.find({ subjectId: { $in: subjectIds } })
            .populate('subjectId', 'name')
            .populate('staffId', 'fullName')
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notes created by staff
const getMyNotes = async (req, res) => {
    try {
        const notes = await Note.find({ staffId: req.user.id })
            .populate('subjectId', 'name');
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete note
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        
        if (note.staffId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await note.deleteOne();
        res.json({ message: 'Note removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Ask AI about notes
const askAi = async (req, res) => {
    try {
        const { subjectId, question } = req.body;
        
        // Fetch all notes for this subject to dynamically populate AI cache if it was cleared
        const notes = await Note.find({ subjectId });
        const concatenatedNotes = notes.map(n => n.extractedText).filter(Boolean).join('\n');

        const aiRes = await axios.post(`${AI_SERVICE}/notes/ask`, {
            subject_id: subjectId,
            question,
            notes: concatenatedNotes
        });

        res.json({ answer: aiRes.data.answer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadNote,
    getNotesForSubject,
    getStudentStudyMaterials,
    getMyNotes,
    deleteNote,
    askAi
};
