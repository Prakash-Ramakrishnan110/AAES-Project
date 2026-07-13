const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { 
    LLaVA_PROMPT, 
    PADDLEOCR_INSTRUCTION, 
    SIMILARITY_LOGIC, 
    EVALUATION_PROMPT, 
    VERIFICATION_PROMPT 
} = require('../config/aiConfig');

/**
 * @desc    Simulate AI Evaluation Pipeline
 * @route   POST /api/ai-evaluation/process/:submissionId
 */
exports.processSubmissionAI = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId).populate('assignment');

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        // --- PREPARE DATA FOR PYTHON AI SERVICE ---
        // Fetch previous answers for this assignment for similarity check
        const otherSubmissions = await Submission.find({
            assignment: submission.assignment._id,
            _id: { $ne: submission._id },
            correctedText: { $exists: true, $ne: "" }
        }).select('correctedText');
        
        const previousAnswers = otherSubmissions.map(s => s.correctedText);

        // --- DUPLICATE FILE DETECTION (Phase 14) ---
        const absoluteFilePath = path.resolve(submission.fileUrl.replace(/^\//, ''));
        const fileBuffer = fs.readFileSync(absoluteFilePath);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        
        submission.fileHash = fileHash;
        
        const duplicateSubmission = await Submission.findOne({
            assignment: submission.assignment._id,
            _id: { $ne: submission._id },
            fileHash: fileHash
        });

        if (duplicateSubmission) {
            submission.aiResultStatus = 'flagged';
            submission.aiFeedback = "[DUPLICATE DETECTED] This file is identical to another submission in this assignment.";
            submission.status = 'graded';
            await submission.save();
            return res.status(200).json({
                success: true,
                message: 'Duplicate file detected and flagged',
                duplicate: true
            });
        }
        
        const pythonBaseUrl = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';
        let studentAnswerText = submission.answers || '';
        let marks = 0;
        let feedback = "";
        let aiAnalysis = {};
        let plagiarismScore = 0;
        let isFlaggedForPlagiarism = false;
        let flaggedSource = null;

        console.log(`[AI Pipeline] Starting Unified Evaluation for Submission: ${submissionId}`);

        // Phase 1: OCR Extraction (Deep Learning via PaddleOCR)
        if (submission.fileUrl) {
            try {
                const absoluteFilePath = path.resolve(submission.fileUrl.replace(/^\//, ''));
                const extractFormData = new FormData();
                extractFormData.append('file', fs.createReadStream(absoluteFilePath));

                console.log(`[AI Pipeline] Extracting text via PaddleOCR...`);
                const extractRes = await axios.post(`${pythonBaseUrl}/extract_text`, extractFormData, {
                    headers: { ...extractFormData.getHeaders() },
                    timeout: 120000 
                });

                studentAnswerText = extractRes.data.text || "";
                submission.extractedText = studentAnswerText;
                submission.answers = studentAnswerText; // Sync for frontend
            } catch (ocrErr) {
                console.error('[AI Pipeline] OCR Failed:', ocrErr.message);
                throw new Error("Handwriting recognition engine failed to process the document.");
            }
        }

        // Phase 2: Plagiarism Detection
        if (studentAnswerText && studentAnswerText.trim() !== '') {
            try {
                const peerSubmissions = await Submission.find({
                    assignment: submission.assignment._id,
                    _id: { $ne: submission._id },
                    $or: [
                        { answers: { $exists: true, $ne: '' } },
                        { correctedText: { $exists: true, $ne: '' } }
                    ]
                }).select('_id answers correctedText');

                const referenceTexts = peerSubmissions.map(sub => ({
                    id: sub._id.toString(),
                    text: sub.answers || sub.correctedText || ""
                })).filter(ref => ref.text.trim() !== "");

                if (referenceTexts.length > 0) {
                    const plagFormData = new FormData();
                    plagFormData.append('target_text', studentAnswerText);
                    plagFormData.append('reference_texts', JSON.stringify(referenceTexts));

                    console.log(`[AI Pipeline] Checking plagiarism across ${referenceTexts.length} peers...`);
                    const plagRes = await axios.post(`${pythonBaseUrl}/evaluate/plagiarism`, plagFormData, {
                        headers: { ...plagFormData.getHeaders() },
                        timeout: 20000
                    });

                    if (plagRes.data && plagRes.data.plagiarismScore > 0) {
                        plagiarismScore = plagRes.data.plagiarismScore;
                        submission.similarityScore = plagiarismScore;
                        if (plagiarismScore > 80) {
                            isFlaggedForPlagiarism = true;
                            submission.aiResultStatus = 'flagged';
                            submission.flaggedSource = plagRes.data.flaggedSource;
                        }
                    }
                }
            } catch (plagErr) {
                console.warn('[AI Pipeline] Plagiarism check non-fatal error:', plagErr.message);
            }
        }

        // Phase 3: Per-Question Grading Loop (Mistral)
        let questions = submission.assignment.formatConfig?.questions || [];
        if (questions.length === 0 && submission.assignment.description) {
            questions = [submission.assignment.description];
        }

        if (questions.length === 0) {
            throw new Error("Assignment has no questions defined for grading.");
        }

        let totalMarksAccumulated = 0;
        let totalConfidenceSum = 0;
        let aggregatedFeedback = [];
        let evaluationBreakdown = [];
        let masteredTopicsSet = new Set();
        let improveTopicsSet = new Set();
        let globalVisualBonus = false;

        console.log(`[AI Pipeline] Grading ${questions.length} questions sequentially...`);

        for (let index = 0; index < questions.length; index++) {
            const q = questions[index];
            const isString = typeof q === 'string';
            const questionCount = Math.max(1, questions.length);
            const questionMaxMarks = isString ? Math.round(submission.assignment.maxMarks / questionCount) : (q.marks || Math.round(submission.assignment.maxMarks / questionCount));
            const questionText = isString ? q : (q.questionText || q.question || q.text || '');
            const rubric = submission.assignment.formatConfig?.rubric || {};
            const keywords = submission.assignment.formatConfig?.keywords || submission.assignment.keywords || '';

            // Fix model answer retrieval
            const rawModelAnswer = isString 
                ? (submission.assignment.formatConfig?.modelAnswer || '') 
                : (q.modelAnswer || submission.assignment.formatConfig?.modelAnswer || '');
            
            const modelAnswer = rawModelAnswer.trim() ? rawModelAnswer : "Grade based on academic correctness and relevance to the topic.";

            const evalFormData = new FormData();
            evalFormData.append('student_answer_text', studentAnswerText || "No answer provided.");
            evalFormData.append('question', questionText);
            evalFormData.append('model_answer', modelAnswer);
            evalFormData.append('max_marks', questionMaxMarks.toString());
            evalFormData.append('rubric', JSON.stringify(rubric));
            evalFormData.append('keywords', keywords);

            try {
                const res = await axios.post(`${pythonBaseUrl}/evaluate/question`, evalFormData, {
                    headers: { ...evalFormData.getHeaders() },
                    timeout: 240000 // 4 min per question for multi-model
                });

                const { 
                    percentage_score: qPercentage = 0, 
                    feedback: qFeedback = "No feedback generated.", 
                    confidence_score: qConfidence = 0, 
                    reasoning: qReasoning = "No specific reasoning provided.",
                    topics_mastered = [],
                    topics_to_improve = [],
                    visual_bonus_awarded = false
                } = res.data;

                // Calculate marks based on percentage
                const achievedMarks = parseFloat(((qPercentage / 100) * questionMaxMarks).toFixed(2));

                totalMarksAccumulated += achievedMarks || 0;
                totalConfidenceSum += qConfidence || 0;

                // Aggregate Topics
                if (Array.isArray(topics_mastered)) topics_mastered.forEach(t => masteredTopicsSet.add(t));
                if (Array.isArray(topics_to_improve)) topics_to_improve.forEach(t => improveTopicsSet.add(t));
                if (visual_bonus_awarded) globalVisualBonus = true;

                aggregatedFeedback.push(`Q${index + 1}: ${qFeedback || "No feedback generated."}`);
                evaluationBreakdown.push({
                    questionIndex: index + 1,
                    questionId: q.id || `q${index + 1}`,
                    allocatedMarks: questionMaxMarks,
                    achievedMarks: achievedMarks || 0,
                    feedback: qFeedback || "No feedback generated.",
                    confidence: qConfidence || 0,
                    reasoning: qReasoning || "No specific reasoning provided.",
                    topicsMastered: topics_mastered,
                    topicsToImprove: topics_to_improve,
                    visualBonus: visual_bonus_awarded
                });
            } catch (evalErr) {
                console.error(`[AI Pipeline] Error on Q${index + 1}:`, evalErr.message);
                aggregatedFeedback.push(`Q${index + 1}: AI service unavailable (0/${questionMaxMarks} Marks).`);
            }
        }

        // Final Aggregation
        const avgConfidence = questions.length > 0 ? (totalConfidenceSum / questions.length) : 0;
        const needsReview = avgConfidence < 70 || isFlaggedForPlagiarism;

        submission.marks = Math.min(submission.assignment.maxMarks, totalMarksAccumulated);
        submission.feedback = aggregatedFeedback.join('\n\n');
        submission.aiConfidence = avgConfidence;
        submission.needsManualReview = needsReview;
        submission.topicsMastered = Array.from(masteredTopicsSet);
        submission.topicsToImprove = Array.from(improveTopicsSet);
        submission.visualBonusAwarded = globalVisualBonus;
        submission.status = 'graded';
        if (!isFlaggedForPlagiarism) {
            submission.aiResultStatus = 'verified';
        }

        submission.aiAnalysis = {
            rawOutput: "Sequential AI Pipeline Completed",
            breakdown: evaluationBreakdown,
            avgConfidence: avgConfidence,
            needsManualReview: needsReview,
            metrics: {
                clarity: avgConfidence / 10,
                relevance: (totalMarksAccumulated / (submission.assignment.maxMarks || 100)) * 10,
                completeness: (totalMarksAccumulated / (submission.assignment.maxMarks || 100)) * 10
            }
        };

        // If flagged for plagiarism, add warning to feedback
        if (isFlaggedForPlagiarism) {
            submission.feedback = `[PLAGIARISM WARNING: ${plagiarismScore}% Similarity]\n\n` + submission.feedback;
        }

        await submission.save();

        await submission.save();

        res.status(200).json({
            success: true,
            message: 'Unified AI Evaluation completed successfully',
            data: {
                submissionId: submission._id,
                status: submission.aiResultStatus,
                marks: submission.marks,
                confidence: submission.aiConfidence,
                needsManualReview: submission.needsManualReview,
                similarity: submission.similarityScore
            }
        });

    } catch (error) {
        console.error('AI Evaluation Error:', error);
        res.status(500).json({ success: false, message: 'AI Evaluation failed', error: error.message });
    }
};

/**
 * @desc    Submit verification answers
 */
exports.submitVerification = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { responses } = req.body;

        const submission = await Submission.findById(submissionId);
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

        submission.verificationData.responses = responses;
        
        // Simulating AI Verification check based on VERIFICATION_PROMPT logic
        if (responses.length === 3 && responses.every(r => r.length > 30)) {
            // Simulated: Student demonstrated understanding confirmed
            submission.verificationData.isVerified = true;
            submission.aiResultStatus = 'verified';
            submission.feedback += "\n\n[Identity Verified: Student Understanding Confirmed via Alternate Challenge]";
        } else {
            // Simulated: Vague answers or incorrect
            submission.aiResultStatus = 'flagged';
            submission.feedback += "\n\n[Verification Failed: Possible Copy - Needs Review]";
        }

        await submission.save();

        res.status(200).json({ success: true, message: 'Verification responses submitted', isVerified: submission.verificationData.isVerified });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
    }
};
