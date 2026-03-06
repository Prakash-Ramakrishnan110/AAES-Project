import React, { useState } from 'react';

interface ProgrammingViewProps {
    assignmentId: string;
    config: {
        problemStatement: string;
        inputFormat: string;
        outputFormat: string;
        sampleInput: string;
        sampleOutput: string;
        timeLimit: number;
        allowedLanguages: string[];
    };
    onCodeChange: (code: string) => void;
    code: string;
}

const ProgrammingView: React.FC<ProgrammingViewProps> = ({ assignmentId, config, onCodeChange, code }) => {
    const [selectedLang, setSelectedLang] = useState(config.allowedLanguages?.[0] || 'python');
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState<any[]>([]);

    const handleRunSamples = async () => {
        setIsRunning(true);
        setTestResults([]);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/submissions/run-samples', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    assignmentId,
                    code,
                    language: selectedLang
                })
            });
            const data = await response.json();
            if (data.results) {
                setTestResults(data.results);
            } else {
                alert(data.message || 'Error running tests');
            }
        } catch (error) {
            console.error('Run Error:', error);
            alert('Failed to connect to execution service');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
            {/* Left Side: Problem Description */}
            <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Problem Statement
                    </h3>
                    <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap">
                        {config.problemStatement}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Input Format</p>
                        <p className="text-sm text-gray-800">{config.inputFormat}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Output Format</p>
                        <p className="text-sm text-gray-800">{config.outputFormat}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-800">
                        <div className="px-4 py-2 bg-gray-800 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sample Input</span>
                        </div>
                        <pre className="p-4 text-green-400 font-mono text-sm overflow-x-auto">{config.sampleInput}</pre>
                    </div>
                    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-800">
                        <div className="px-4 py-2 bg-gray-800 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sample Output</span>
                        </div>
                        <pre className="p-4 text-indigo-400 font-mono text-sm overflow-x-auto">{config.sampleOutput}</pre>
                    </div>
                </div>
            </div>

            {/* Right Side: Editor */}
            <div className="flex flex-col h-full bg-gray-950 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedLang}
                            onChange={(e) => setSelectedLang(e.target.value)}
                            className="bg-gray-800 text-gray-300 text-xs font-bold border-none rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {config.allowedLanguages?.map(lang => (
                                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Compiler Ready</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-gray-600">Time Limit: {config.timeLimit}s</span>
                </div>

                <textarea
                    className="flex-1 w-full p-6 bg-transparent text-indigo-50 font-mono text-sm resize-none focus:outline-none custom-scrollbar"
                    value={code}
                    onChange={e => onCodeChange(e.target.value)}
                    placeholder={`# Write your ${selectedLang} solution here...`}
                    spellCheck={false}
                />

                <div className="px-6 py-3 bg-gray-900/50 border-t border-gray-800 flex flex-col gap-4">
                    {testResults.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Test Results</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {testResults.map((res, i) => (
                                    <div key={i} className={`p-3 rounded-xl border ${res.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} flex items-center justify-between`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${res.passed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                                            <span className="text-xs font-bold text-gray-300">Case {i + 1}</span>
                                        </div>
                                        <div className="flex gap-4 text-[10px] font-mono">
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">EXPECTED</span>
                                                <span className="text-gray-400">{res.expected}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">ACTUAL</span>
                                                <span className={res.passed ? 'text-green-400' : 'text-red-400'}>{res.actual}</span>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${res.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {res.passed ? 'PASSED' : 'FAILED'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            className="px-4 py-1.5 rounded-lg bg-gray-800 text-gray-400 text-xs font-bold hover:bg-gray-700 transition-colors uppercase tracking-widest disabled:opacity-50"
                            onClick={() => { onCodeChange(''); setTestResults([]); }}
                            disabled={isRunning}
                        >
                            Reset
                        </button>
                        <button
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border uppercase tracking-widest flex items-center gap-2 ${isRunning ? 'bg-indigo-600/50 text-indigo-200 border-indigo-500/50' : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'}`}
                            onClick={handleRunSamples}
                            disabled={isRunning}
                        >
                            {isRunning ? (
                                <>
                                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Running...
                                </>
                            ) : 'Run Sample Tests'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgrammingView;
