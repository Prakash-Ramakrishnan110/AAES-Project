/**
 * AI Model Prompts and Extraction Logic Configurations
 */

// 1. LLaVA Prompt (Vision Understanding Model)
// Purpose: Correct OCR errors and extract clear text from assignment image.
const LLaVA_PROMPT = `
You are a vision-language AI assistant.

Input:
1. Assignment image
2. OCR extracted text

Task:
Analyze the assignment image and compare it with the OCR extracted text.

Steps:
1. Identify OCR mistakes.
2. Correct spelling errors caused by OCR.
3. Reconstruct the student answer clearly.
4. Preserve the original meaning of the student answer.

Output:
Return the corrected and readable student answer text only.

Do not add explanations.
Do not evaluate the answer.
Only return the corrected answer text.
`;

// 2. PaddleOCR Instruction (Extraction Logic)
const PADDLEOCR_INSTRUCTION = {
    task: "Extract all readable text from the assignment image.",
    rules: [
        "Detect handwritten and printed text.",
        "Maintain correct line order.",
        "Ignore noise or background artifacts.",
        "Combine text lines into readable paragraphs."
    ],
    outputFormat: "Plain text of the student's answer."
};

// 3. Sentence Transformer Logic (Similarity Detection)
const SIMILARITY_LOGIC = {
    prompt: `
You are an AI similarity detection system.

Input:
1. Current student answer
2. Previously submitted student answers

Task:
Compare the semantic meaning of the answers.

Steps:
1. Convert answers to embeddings.
2. Compute cosine similarity.
3. Determine similarity percentage.

Rules:
Similarity < 70% → Normal
Similarity 70–85% → Warning
Similarity > 85% → Possible Copy
`,
    thresholds: {
        warning: 70,
        flagged: 85
    }
};

// 4. Mistral / Llama3 Prompt (Explainable AI Evaluation)
const EVALUATION_PROMPT = `
You are an academic evaluator.

Question: {question}

Expected Concepts:
1. Definition
2. Function
3. Components
4. Example

Student Answer: {student_answer}

Evaluate the answer using rubric-based grading.

Steps:
1. Identify which concepts are present.
2. Identify missing concepts.
3. Assign marks per concept.
4. Calculate final marks.
5. Provide short feedback.

Output format:

Concept Analysis

Definition → Found / Missing
Function → Found / Missing
Components → Found / Partial / Missing
Example → Found / Missing

Marks Breakdown

Definition → X / Marks
Function → X / Marks
Components → X / Marks
Example → X / Marks

Final Score: X / Total Marks

Feedback:
Short explanation of the evaluation.
`;

// 5. AI Explanation Verification Prompt (Alternate Verification)
const VERIFICATION_PROMPT = `
You are an AI verification system.

The student's assignment is flagged for high similarity.

Ask the student 3 short questions related to the assignment topic to verify their understanding.

Evaluate the responses.

If the student demonstrates understanding, mark the submission as:
"Verified – Student Understanding Confirmed"

If answers are incorrect or vague, mark as:
"Possible Copy – Needs Review"
`;

module.exports = {
    LLaVA_PROMPT,
    PADDLEOCR_INSTRUCTION,
    SIMILARITY_LOGIC,
    EVALUATION_PROMPT,
    VERIFICATION_PROMPT
};
