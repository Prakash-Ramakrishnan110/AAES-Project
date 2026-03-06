import React from 'react';

interface Props {
    formData: any;
    setFormData: (data: any) => void;
}

const ProgrammingBuilder: React.FC<Props> = ({ formData, setFormData }) => {

    React.useEffect(() => {
        if (!formData.programmingConfig) {
            setFormData({
                ...formData,
                programmingConfig: {
                    problemStatement: '',
                    inputFormat: '',
                    outputFormat: '',
                    sampleInput: '',
                    sampleOutput: '',
                    timeLimit: 2,
                    allowedLanguages: ['python', 'c', 'java'],
                    language: 'python' // Default specific language
                },
                testCases: []
            });
        }
    }, []);

    const updateConfig = (field: string, value: any) => {
        setFormData({
            ...formData,
            programmingConfig: { ...formData.programmingConfig, [field]: value }
        });
    };

    const addTestCase = () => {
        setFormData({
            ...formData,
            testCases: [...(formData.testCases || []), { input: '', expectedOutput: '', marks: 10, isHidden: false }]
        });
    };

    const updateTestCase = (index: number, field: string, value: any) => {
        const newCases = [...(formData.testCases || [])];
        newCases[index] = { ...newCases[index], [field]: value };
        setFormData({ ...formData, testCases: newCases });
    };

    const removeTestCase = (index: number) => {
        const newCases = [...(formData.testCases || [])];
        newCases.splice(index, 1);
        setFormData({ ...formData, testCases: newCases });
    };


    const config = formData.programmingConfig || { allowedLanguages: [] };
    const cases = formData.testCases || [];

    const totalTestCaseMarks = cases.reduce((sum: number, tc: any) => sum + (tc.marks || 0), 0);
    const marksMismatch = formData.maxMarks > 0 && totalTestCaseMarks !== formData.maxMarks;

    return (
        <div className="space-y-6">
            <div className="bg-sky-50/50 p-4 border border-sky-100 rounded-xl">
                <h4 className="font-bold text-sky-900 mb-1">Programming Algorithm Test</h4>
                <p className="text-sm text-sky-700">Define a coding problem with sample inputs/outputs. Students will code their solutions in the browser IDE. Your test cases will auto-grade their code.</p>
            </div>

            <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Problem Statement</label>
                    <textarea
                        rows={5}
                        value={config.problemStatement || ''}
                        onChange={(e) => updateConfig('problemStatement', e.target.value)}
                        placeholder="Define the coding challenge clearly..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-gray-800"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Input Format Description</label>
                        <textarea
                            rows={2}
                            value={config.inputFormat || ''}
                            onChange={(e) => updateConfig('inputFormat', e.target.value)}
                            placeholder="e.g. The first line contains an integer T..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Output Format Description</label>
                        <textarea
                            rows={2}
                            value={config.outputFormat || ''}
                            onChange={(e) => updateConfig('outputFormat', e.target.value)}
                            placeholder="e.g. Print exactly N lines containing..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Sample Input (Visible to Student)</label>
                        <textarea
                            rows={3}
                            value={config.sampleInput || ''}
                            onChange={(e) => updateConfig('sampleInput', e.target.value)}
                            placeholder="Example input block"
                            className="w-full bg-gray-900 text-green-400 font-mono rounded-lg px-3 py-2 text-sm outline-none resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Sample Expected Output</label>
                        <textarea
                            rows={3}
                            value={config.sampleOutput || ''}
                            onChange={(e) => updateConfig('sampleOutput', e.target.value)}
                            placeholder="Example output block"
                            className="w-full bg-gray-900 text-green-400 font-mono rounded-lg px-3 py-2 text-sm outline-none resize-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Primary Programming Language</label>
                        <div className="flex gap-2 flex-wrap">
                            {['python', 'c', 'java'].map(lang => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => updateConfig('language', lang)}
                                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${config.language === lang ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 italic">* This language will be used for auto-grading and AI generation.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Execution Time Limit (Seconds)</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={config.timeLimit || 2}
                            onChange={(e) => updateConfig('timeLimit', parseInt(e.target.value) || 2)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-8">
                <h3 className="text-lg font-bold text-gray-900">Grading Test Cases</h3>
                <button
                    type="button"
                    onClick={addTestCase}
                    className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-sky-700 transition"
                >
                    + Add Test Case
                </button>
            </div>

            {marksMismatch && (
                <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-100 flex items-center gap-2">
                    <span>⚠️ Error: The sum of marks across all Test Cases ({totalTestCaseMarks}) must equal the Assignment Total Marks ({formData.maxMarks || 0}).</span>
                </div>
            )}

            <div className="space-y-4">
                {cases.map((tc: any, i: number) => (
                    <div key={i} className="bg-white p-5 border border-sky-200 rounded-xl relative shadow-sm">
                        <button type="button" onClick={() => removeTestCase(i)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 px-2 py-1 rounded">Remove</button>

                        <div className="flex justify-between items-center mb-4 pr-16">
                            <h4 className="font-bold text-sky-800 text-sm bg-sky-100 px-3 py-1 rounded-lg">Test Case {i + 1}</h4>
                            <div className="flex gap-4 items-center">
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg">
                                    <input type="checkbox" checked={tc.isHidden} onChange={(e) => updateTestCase(i, 'isHidden', e.target.checked)} className="w-4 h-4 text-sky-600 rounded" />
                                    <span className="text-xs font-bold text-gray-600">Hidden from Student?</span>
                                </label>
                                <div className="w-24">
                                    <input type="number" min="0" placeholder="Marks" value={tc.marks || ''} onChange={(e) => updateTestCase(i, 'marks', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Exact Input</label>
                                <textarea rows={2} value={tc.input || ''} onChange={(e) => updateTestCase(i, 'input', e.target.value)} className="w-full bg-gray-900 text-green-400 font-mono text-sm rounded-lg px-3 py-2 outline-none resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Exact Expected Output</label>
                                <textarea rows={2} value={tc.expectedOutput || ''} onChange={(e) => updateTestCase(i, 'expectedOutput', e.target.value)} className="w-full bg-gray-900 text-green-400 font-mono text-sm rounded-lg px-3 py-2 outline-none resize-none" />
                            </div>
                        </div>
                    </div>
                ))}

                {cases.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                        <p className="text-gray-500 text-sm">No test cases have been added. An algorithm test must have at least one test case to calculate grading.</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <div className={`px-4 py-2 rounded-lg font-bold text-sm ${marksMismatch ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    Test Cases Total: {totalTestCaseMarks} / {formData.maxMarks || 0}
                </div>
            </div>
        </div>
    );
};

export default ProgrammingBuilder;
