const express = require('express');
const router = express.Router();
const axios = require('axios');
const StudyMaterial = require('../models/StudyMaterial');
const Subject = require('../models/Subject');
const { protect: authMiddleware } = require('../middleware/authMiddleware');

// Using basic fetch for local Ollama, avoiding extra heavy langchain dependencies 
// unless user specifies otherwise. Assuming local Ollama running on default 11434.
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const AI_MODEL = 'gemma3:1b'; // Match the installed model in Ollama

// @route   POST /api/ai-chat/ask
// @desc    Ask a question about a specific study material
// @access  Private (Student)
router.post('/ask', authMiddleware, async (req, res) => {
    try {
        const { materialId, question } = req.body;

        if (!materialId || !question) {
            return res.status(400).json({ message: 'materialId and question are required' });
        }

        if (question.length > 3000) {
            return res.status(400).json({ message: 'Question exceeds maximum length of 3000 characters' });
        }

        const material = await StudyMaterial.findById(materialId).populate('subjectId');

        if (!material) {
            return res.status(404).json({ message: 'Study material not found' });
        }

        // Students can only access visible notes
        if (req.user.role === 'student' && !material.visible) {
            return res.status(403).json({ message: 'Material is currently not visible' });
        }

        let contextText = material.extractedText;

        if (!contextText || contextText.length < 10) {
            return res.status(400).json({
                message: 'No readable text was extracted from this document. The AI cannot answer questions about it.'
            });
        }

        // Truncate context for small local models (approx 2000-3000 tokens max)
        const MAX_CONTEXT_LENGTH = 7000;
        if (contextText.length > MAX_CONTEXT_LENGTH) {
            contextText = contextText.substring(0, MAX_CONTEXT_LENGTH) + "... [TEXT TRUNCATED FOR PROCESSING]";
        }

        // Simpler Prompt for small 1b/2b models
        const systemPrompt = `You are AAES AI Assistant. You help students understand their study materials.
Study Material: "${material.title}"
Subject: "${material.subjectId?.name || 'Unknown'}"

INSTRUCTIONS:
- Use the following SOURCE TEXT to answer the user's question.
- If you don't know the answer or it's not in the text, say "I cannot find the exact answer in these notes, but I can try to help generally if you want."
- Keep your answer clear and academic.

SOURCE TEXT:
"""
${contextText}
"""
`;

        // Send to Local Ollama
        try {
            console.log(`[AI-CHAT] Material: ${material.title} (${material._id})`);
            console.log(`[AI-CHAT] Question: "${question}"`);
            console.log(`[AI-CHAT] Context Length: ${contextText.length}`);
            console.log(`[AI-CHAT] System Prompt Length: ${systemPrompt.length}`);

            const response = await axios.post(OLLAMA_URL, {
                model: AI_MODEL,
                prompt: `Question: ${question}`,
                system: systemPrompt,
                stream: false,
                options: {
                    temperature: 0.2, // Slightly higher temp for more flexibility
                    top_p: 0.9,
                    num_predict: 500 // Limit response length
                }
            }, { timeout: 60000 }); // Increase timeout to 60s

            const aiResponse = response.data.response;

            res.json({
                answer: aiResponse,
                materialId: material._id
            });

        } catch (aiError) {
            console.error("AI Service Error:", aiError.message);
            res.status(503).json({
                message: 'AI service temporarily unavailable. Please try again later.',
                error: aiError.message
            });
        }

    } catch (error) {
        console.error("Chat route error:", error);
        res.status(500).json({ message: 'Server error processing request' });
    }
});

module.exports = router;
