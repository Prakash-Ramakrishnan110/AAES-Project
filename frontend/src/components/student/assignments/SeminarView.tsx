import React from 'react';

interface SeminarViewProps {
    config: {
        presentationDate: string;
        isGroup: boolean;
        rubric: {
            contentMarks: number;
            presentationMarks: number;
            communicationMarks: number;
            qaMarks: number;
        };
    };
    onFileChange: (file: File | null) => void;
}

const SeminarView: React.FC<SeminarViewProps> = ({ config, onFileChange }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scheduled Date</p>
                        <p className="text-lg font-black text-gray-900">{new Date(config.presentationDate).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format</p>
                        <p className="text-lg font-black text-gray-900">{config.isGroup ? 'Group Presentation' : 'Individual Seminar'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-600 uppercase tracking-widest">Grading Rubric</h4>
                </div>
                <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-2xl font-black text-indigo-600">{config.rubric?.contentMarks}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase mt-1">Content</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-2xl font-black text-indigo-600">{config.rubric?.presentationMarks}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase mt-1">Presentation</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-2xl font-black text-indigo-600">{config.rubric?.communicationMarks}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase mt-1">Communication</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-2xl font-black text-indigo-600">{config.rubric?.qaMarks}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase mt-1">Q&A</p>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-2">Upload Presentation Materials</h4>
                    <p className="text-indigo-100 mb-6 text-sm opacity-90">Upload your PPT or PDF for the session. This is required for verification.</p>
                    <input
                        type="file"
                        accept=".ppt,.pptx,.pdf"
                        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-indigo-100 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white file:text-indigo-600 hover:file:bg-indigo-50 transition-all cursor-pointer"
                    />
                </div>
                <div className="absolute top-0 right-0 p-8 transform translate-x-10 translate-y--10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default SeminarView;
