const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Temporary directory for storing student scripts
const TEMP_DIR = path.join(__dirname, '..', 'temp_scripts');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

// Blacklist of dangerous imports/modules
const DANGEROUS_IMPORTS = [
    'os', 'sys', 'subprocess', 'socket', 'urllib', 'requests',
    'http', 'ftplib', 'smtplib', 'pickle', 'shelve', 'eval',
    'exec', '__import__', 'open', 'file', 'input', 'raw_input'
];

/**
 * Validates Python code for dangerous imports/operations
 * @param {string} code - Student's Python code
 * @returns {Object} - { safe: boolean, reason: string }
 */
const validateCode = (code) => {
    const lowerCode = code.toLowerCase();

    // Check for dangerous imports
    for (const danger of DANGEROUS_IMPORTS) {
        // Check for import statements
        if (lowerCode.includes(`import ${danger}`) ||
            lowerCode.includes(`from ${danger}`)) {
            return {
                safe: false,
                reason: `Forbidden import detected: ${danger}. Only standard math and basic operations are allowed.`
            };
        }
    }

    // Check for file operations
    if (lowerCode.includes('open(') || lowerCode.includes('file(')) {
        return {
            safe: false,
            reason: 'File operations are not allowed for security reasons.'
        };
    }

    // Check for eval/exec
    if (lowerCode.includes('eval(') || lowerCode.includes('exec(')) {
        return {
            safe: false,
            reason: 'Dynamic code execution (eval/exec) is not allowed.'
        };
    }

    return { safe: true, reason: '' };
};

/**
 * Executes Python code against a specific input.
 * @param {string} code - Student's Python code
 * @param {string} input - Input string for the test case
 * @returns {Promise<string>} - The stdout of the execution
 */
const executePython = (code, input) => {
    return new Promise((resolve, reject) => {
        // Validate code first
        const validation = validateCode(code);
        if (!validation.safe) {
            return resolve(`Security Error: ${validation.reason}`);
        }

        const timestamp = Date.now();
        const scriptPath = path.join(TEMP_DIR, `script_${timestamp}.py`);
        const inputPath = path.join(TEMP_DIR, `input_${timestamp}.txt`);

        try {
            fs.writeFileSync(scriptPath, code);
            fs.writeFileSync(inputPath, input);

            const runCommand = `python "${scriptPath}" < "${inputPath}"`;

            exec(runCommand, {
                timeout: 3000,
                maxBuffer: 1024 * 1024 // 1MB max output
            }, (error, stdout, stderr) => {
                // Cleanup
                try {
                    fs.unlinkSync(scriptPath);
                    fs.unlinkSync(inputPath);
                } catch (e) {
                    console.error('Error cleaning up temp files', e);
                }

                if (error) {
                    // If it's a timeout
                    if (error.killed) {
                        return resolve('Execution Timed Out (3s limit)');
                    }
                    // Syntax or runtime error
                    return resolve(`Error: ${stderr || error.message}`);
                }

                resolve(stdout.trim());
            });
        } catch (err) {
            // Cleanup on exception
            try {
                if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            } catch (e) { }

            resolve(`System Error: ${err.message}`);
        }
    });
};

/**
 * Runs student code against multiple test cases.
 * @param {string} code 
 * @param {Array} testCases 
 * @returns {Promise<Object>} Results including marks and details
 */
const runAutoGrading = async (code, testCases) => {
    let totalMarks = 0;
    let results = [];

    for (const test of testCases) {
        const actualOutput = await executePython(code, test.input);

        // Normalize outputs (trim whitespace)
        const expected = test.output.trim();
        const actual = actualOutput.trim();

        const passed = expected === actual;

        if (passed) {
            totalMarks += test.marks;
        }

        results.push({
            input: test.input,
            expectedOutput: test.output,
            actualOutput: actual,
            passed
        });
    }

    return { totalMarks, results };
};

module.exports = { runAutoGrading };
