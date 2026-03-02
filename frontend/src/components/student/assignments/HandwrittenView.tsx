import React from 'react';

interface HandwrittenViewProps {
    config: {
        questions: Array<{ questionText: string, marks: number }>;
        allowedFormats: string[];
    };
    onFileChange: (file: File | null) => void;
    onTextChange: (text: string) => void;
    answerText: string;
}

const HandwrittenView: React.FC<HandwrittenViewProps> = ({ config, onFileChange, onTextChange, answerText }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Questions
                </h3>
                <div className="space-y-4">
                    {config.questions?.map((q, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-start gap-4">
                                <p className="text-gray-700 font-medium"><span className="text-indigo-600 font-bold mr-2">{idx + 1}.</span>{q.questionText}</p>
                                <span className="shrink-0 bg-white px-2 py-1 rounded text-xs font-bold text-gray-500 border border-gray-200">
                                    {q.marks} Marks
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                <label className="block text-sm font-bold text-indigo-900 mb-2">Upload Submission</label>
                <div className="flex flex-col gap-4">
                    <input
                        type="file"
                        accept={config.allowedFormats?.map(f => `.${f}`).join(',')}
                        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                    />
                    <p className="text-xs text-indigo-600 font-medium">
                        Allowed Formats: {config.allowedFormats?.join(', ').toUpperCase()}
                    </p>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-bold text-indigo-900 mb-2">Additional Notes / Answer Text</label>
                    <textarea
                        className="w-full p-4 border border-indigo-200 rounded-xl h-32 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800"
                        value={answerText}
                        onChange={e => onTextChange(e.target.value)}
                        placeholder="Type any additional notes or your answer directly here..."
                    />
                </div>
            </div>
        </div>
    );
};

export default HandwrittenView;
