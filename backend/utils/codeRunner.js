const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Temporary directory for storing student scripts
const TEMP_DIR = path.join(__dirname, '..', 'temp_scripts');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Security validations
const BLACKLIST = {
    python: ['os', 'sys', 'subprocess', 'socket', 'urllib', 'requests', 'import', 'eval', 'exec', 'open', 'input'],
    c: ['system(', 'fork(', 'exec', 'socket', 'file', 'fopen', 'remove'],
    java: ['java.io', 'java.net', 'java.lang.reflect', 'System.exit', 'Runtime.getRuntime']
};

const validateCode = (language, code) => {
    const lowerCode = code.toLowerCase();
    const checks = BLACKLIST[language] || [];

    for (const danger of checks) {
        if (lowerCode.includes(danger)) {
            return {
                safe: false,
                reason: `Forbidden operation or import detected: "${danger}".`
            };
        }
    }
    return { safe: true };
};

/**
 * Executes code in various languages
 */
const executeCode = (language, code, input) => {
    return new Promise((resolve) => {
        const validation = validateCode(language, code);
        if (!validation.safe) {
            return resolve(`Security Error: ${validation.reason}`);
        }

        const timestamp = Date.now() + Math.floor(Math.random() * 1000);
        let scriptFile, compileCmd, runCmd;

        if (language === 'python') {
            scriptFile = path.join(TEMP_DIR, `script_${timestamp}.py`);
            runCmd = `python "${scriptFile}"`;
        } else if (language === 'c') {
            scriptFile = path.join(TEMP_DIR, `program_${timestamp}.c`);
            const exeFile = path.join(TEMP_DIR, `program_${timestamp}.exe`);
            compileCmd = `gcc "${scriptFile}" -o "${exeFile}"`;
            runCmd = `"${exeFile}"`;
        } else if (language === 'java') {
            // Java requires class name to match file name. We'll use a wrapper or assume 'Main'
            // For simplicity in a multi-student environment, we'll name the file Main_{timestamp}.java
            // but Java is tricky with class names. 
            // Better: Replace 'public class Main' with 'public class Main_{timestamp}' in student code
            const className = `Main_${timestamp}`;
            const modifiedCode = code.replace(/public\s+class\s+MainResource/g, `public class ${className}`)
                .replace(/public\s+class\s+Main/g, `public class ${className}`);
            scriptFile = path.join(TEMP_DIR, `${className}.java`);
            compileCmd = `javac "${scriptFile}"`;
            runCmd = `java -cp "${TEMP_DIR}" ${className}`;
        } else {
            return resolve(`Error: Language ${language} not supported.`);
        }

        const inputFile = path.join(TEMP_DIR, `input_${timestamp}.txt`);

        try {
            fs.writeFileSync(scriptFile, language === 'java' ? (code.includes(`Main_${timestamp}`) ? code : code.replace(/public\s+class\s+Main/g, `public class Main_${timestamp}`)) : code);
            fs.writeFileSync(inputFile, input || '');

            const execute = () => {
                exec(`${runCmd} < "${inputFile}"`, { timeout: 5000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
                    // Cleanup
                    cleanup();
                    if (err) return resolve(`Error: ${stderr || err.message}`);
                    resolve(stdout.trim());
                });
            };

            const cleanup = () => {
                try {
                    if (fs.existsSync(scriptFile)) fs.unlinkSync(scriptFile);
                    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
                    if (language === 'c') {
                        const exe = scriptFile.replace('.c', '.exe');
                        if (fs.existsSync(exe)) fs.unlinkSync(exe);
                    }
                    if (language === 'java') {
                        const classFile = scriptFile.replace('.java', '.class');
                        if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
                    }
                } catch (e) { console.error('Cleanup error:', e); }
            };

            if (compileCmd) {
                exec(compileCmd, (err, stdout, stderr) => {
                    if (err) {
                        cleanup();
                        return resolve(`Compilation Error: ${stderr || err.message}`);
                    }
                    execute();
                });
            } else {
                execute();
            }
        } catch (err) {
            resolve(`System Error: ${err.message}`);
        }
    });
};

const runAutoGrading = async (language, code, testCases) => {
    let totalMarks = 0;
    let results = [];

    for (const test of testCases) {
        const actualOutput = await executeCode(language, code, test.input);
        const expected = (test.output || test.expectedOutput || '').trim();
        const actual = actualOutput.trim();
        const passed = expected === actual;

        if (passed) totalMarks += (test.marks || 0);

        results.push({
            input: test.input,
            expectedOutput: expected,
            actualOutput: actual,
            passed
        });
    }

    return { totalMarks, results };
};

module.exports = { runAutoGrading, executeCode };
