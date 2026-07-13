const express = require('express');
const router = express.Router();
const axios = require('axios');
const StudyMaterial = require('../models/StudyMaterial');
const Subject = require('../models/Subject');
const { protect: authMiddleware } = require('../middleware/authMiddleware');

// Using basic fetch for local Ollama, avoiding extra heavy langchain dependencies 
// unless user specifies otherwise. Assuming local Ollama running on default 11434.
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const AI_MODEL = 'gemma3:1b'; // Match the installed model in Ollama

/**
 * Utility to chunk long text into overlapping segments for RAG
 */
function chunkText(text, size = 1000, overlap = 200) {
    const chunks = [];
    if (!text) return chunks;
    let start = 0;
    while (start < text.length) {
        let end = start + size;
        chunks.push(text.substring(start, end).trim());
        start += (size - overlap);
    }
    return chunks;
}

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

// @route   POST /api/ai-chat/ask
// @desc    Ask a question about a specific study material
// @access  Private (Student)
router.post('/ask', authMiddleware, async (req, res) => {
    try {
        const { materialId, question } = req.body;

        if (!materialId || !question) {
            return res.status(400).json({ message: 'materialId and question are required' });
        }

        const material = await StudyMaterial.findById(materialId).populate('subjectId');

        if (!material) {
            return res.status(404).json({ message: 'Study material not found' });
        }

        if (req.user.role === 'student' && !material.visible) {
            return res.status(403).json({ message: 'Material is currently not visible' });
        }

        const fullText = material.extractedText;
        if (!fullText || fullText.length < 10) {
            return res.status(400).json({
                message: 'No readable text was extracted from this document.'
            });
        }

        // 1. Chunk the document (RAG)
        const chunks = chunkText(fullText, 1200, 200);

        // 2. Prepare corpus for Python retrieval
        const corpus = chunks.map((c, i) => ({
            text: c,
            metadata: { id: i, source: material.title }
        }));

        // 3. Call Python Retrieval Service
        let retrievedContext = "";
        try {
            const formData = new URLSearchParams();
            formData.append('query', question);
            formData.append('corpus', JSON.stringify(corpus));

            const retrievalRes = await axios.post(`${PYTHON_SERVICE_URL}/retrieve`, formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const topResults = retrievalRes.data.results || [];
            if (topResults.length > 0) {
                // Combine top 4 matching chunks for context
                retrievedContext = topResults.slice(0, 4).map(r => r.text).join("\n\n---\n\n");
            } else {
                // Fallback if RAG score too low: use first chunk
                retrievedContext = chunks[0];
            }

            console.log(`[RAG-DOC] Material: ${material.title}, Chunks: ${chunks.length}, Retrieved: ${retrievedContext.length} chars`);
        } catch (error) {
            console.error("Single-Doc Retrieval Error:", error.message);
            retrievedContext = fullText.substring(0, 5000);
        }

        const systemPrompt = `You are AAES AI Assistant. Help the student with their study material.
Study Material: "${material.title}"
Subject: "${material.subjectId?.name || 'Unknown'}"

INSTRUCTIONS:
- Use the provided context to answer the question.
- If you can't find the answer in the context, use your general knowledge but mention that it's not explicitly in the notes.
- Be academic and helpful.

CONTEXT:
"""
${retrievedContext}
"""
`;

        const response = await axios.post(OLLAMA_URL, {
            model: AI_MODEL,
            prompt: `Question: ${question}`,
            system: systemPrompt,
            stream: false,
            options: {
                temperature: 0.1,
                num_predict: 800
            }
        }, { timeout: 90000 });

        res.json({
            answer: response.data.response,
            materialId: material._id
        });

    } catch (error) {
        console.error("Chat route error:", error);
        res.status(500).json({ message: 'Server error processing request' });
    }
});

// @route   POST /api/ai-chat/global-ask
// @desc    Ask a question across all accessible study materials (RAG)
// @access  Private (Student)
router.post('/global-ask', authMiddleware, async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }

        // 1. Fetch all visible study materials for the student's context
        const materials = await StudyMaterial.find({
            department: req.user.department,
            academicYear: req.user.academicYear,
            semester: req.user.semester,
            visible: true,
            extractedText: { $exists: true, $ne: "" }
        }).select('title extractedText subjectId').populate('subjectId', 'name');

        if (!materials || materials.length === 0) {
            return res.status(404).json({ message: 'No study materials found to search through.' });
        }

        // 2. Prepare corpus for Python retrieval
        // We chunk by material for simplicity
        const corpus = materials.map(m => ({
            text: m.extractedText,
            metadata: {
                title: m.title,
                subject: m.subjectId?.name || 'General',
                materialId: m._id
            }
        }));

        // 3. Call Python Retrieval Service
        let retrievedContext = "";
        let sources = [];

        try {
            const formData = new URLSearchParams();
            formData.append('query', question);
            formData.append('corpus', JSON.stringify(corpus));

            const retrievalRes = await axios.post(`${PYTHON_SERVICE_URL}/retrieve`, formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const topResults = retrievalRes.data.results || [];

            if (topResults.length > 0) {
                retrievedContext = topResults.map(r =>
                    `[Source: ${r.metadata.title} (${r.metadata.subject})]\n${r.text}`
                ).join("\n\n---\n\n");

                sources = topResults.map(r => ({
                    title: r.metadata.title,
                    id: r.metadata.materialId
                }));
            }
        } catch (error) {
            console.error("Retrieval Service Error:", error.message);
            // Fallback: Just use the first material if retrieval fails? 
            // Better to error out if it's a global search
            return res.status(503).json({ message: 'AI Retrieval service is currently down.' });
        }

        if (!retrievedContext) {
            return res.json({
                answer: "I couldn't find any specific information in your study materials related to that question. Could you try rephrasing or asking something else?",
                sources: []
            });
        }

        // 4. Final Generation with Ollama
        const systemPrompt = `You are AAES Global Academic Assistant. 
You help students by answering questions across their entire study resource repository.

SOURCE CONTEXT FROM MULTIPLE MATERIALS:
"""
${retrievedContext}
"""

INSTRUCTIONS:
- Use the provided context to answer the question.
- Explicitly mention which study material(s) you are referencing if it helps.
- If the context doesn't contain the answer, say "I don't have enough information in your current notes to answer this accurately."
- Keep it professional, helpful, and concise.
`;

        try {
            const response = await axios.post(OLLAMA_URL, {
                model: AI_MODEL,
                prompt: `Question: ${question}`,
                system: systemPrompt,
                stream: false,
                options: {
                    temperature: 0.3,
                    num_predict: 800
                }
            }, { timeout: 90000 }); // Longer timeout for global search

            res.json({
                answer: response.data.response,
                sources: sources
            });

        } catch (aiError) {
            console.error("AI Generation Error:", aiError.message);
            res.status(503).json({ message: 'AI Generation service is temporarily unavailable.' });
        }

    } catch (error) {
        console.error("Global Chat route error:", error);
        res.status(500).json({ message: 'Server error processing request' });
    }
});

const fs = require('fs');
const path = require('path');

// @route   POST /api/ai-chat/system-ask
// @desc    Ask a question about the AAES system using project documentation (RAG)
// @access  Private
router.post('/system-ask', authMiddleware, async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }

        // 1. Read Project Documentation (PROJECT_REPORT.md)
        // Path is root of project, assuming backend is in /backend
        const docPath = path.join(__dirname, '../../PROJECT_REPORT.md');

        if (!fs.existsSync(docPath)) {
            console.warn("PROJECT_REPORT.md not found at:", docPath);
            return res.status(404).json({ message: 'System documentation not found.' });
        }

        const docContent = fs.readFileSync(docPath, 'utf8');

        // 2. Simple Chunking (by double newlines/headers for small-scale RAG)
        const chunks = docContent.split(/\n(?=## )/).map(c => c.trim()).filter(c => c.length > 50);

        // 3. Prepare corpus for Python retrieval
        const corpus = chunks.map((text, idx) => ({
            text: text,
            metadata: {
                id: `system-doc-${idx}`,
                title: 'AAES System Documentation'
            }
        }));

        // 4. Call Python Retrieval Service
        let retrievedContext = "";

        try {
            const formData = new URLSearchParams();
            formData.append('query', question);
            formData.append('corpus', JSON.stringify(corpus));

            const retrievalRes = await axios.post(`${PYTHON_SERVICE_URL}/retrieve`, formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const topResults = retrievalRes.data.results || [];

            if (topResults.length > 0) {
                retrievedContext = topResults.map(r => r.text).join("\n\n---\n\n");
            }
        } catch (error) {
            console.error("System Retrieval Service Error:", error.message);
            return res.status(503).json({ message: 'AI Retrieval service is currently down.' });
        }

        if (!retrievedContext) {
            return res.json({
                answer: "I couldn't find any specific information in the system documentation related to that. Can you ask something about the features or design?",
            });
        }

        // 5. Final Generation with Ollama
        const systemPrompt = `You are AAES System Guide. 
You help users understand the architecture, features, and usage of the Advanced Academic Evaluation System.

SOURCE SYSTEM DOCUMENTATION:
"""
${retrievedContext}
"""

INSTRUCTIONS:
- Use the provided context to answer questions about the app's features, tools (Ollama, OCR, Python etc), or design.
- If the answer isn't in the provided text, say "I don't have detailed info on that system aspect in my currently indexed manual."
- Keep it professional and technical yet clear.
`;

        try {
            const response = await axios.post(OLLAMA_URL, {
                model: AI_MODEL,
                prompt: `Question: ${question}`,
                system: systemPrompt,
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 600
                }
            }, { timeout: 90000 });

            res.json({
                answer: response.data.response
            });

        } catch (aiError) {
            console.error("AI System Generation Error:", aiError.message);
            res.status(503).json({ message: 'AI service is temporarily unavailable.' });
        }

    } catch (error) {
        console.error("System Chat route error:", error);
        res.status(500).json({ message: 'Server error processing system help request' });
    }
});

module.exports = router;
