import React from 'react';

interface PPTViewProps {
    config: {
        topicDescription: string;
        minSlides: number;
        rubric: {
            contentMarks: number;
            designMarks: number;
            explanationMarks: number;
            qaMarks: number;
        };
    };
    onFileChange: (file: File | null) => void;
}

const PPTView: React.FC<PPTViewProps> = ({ config, onFileChange }) => {
    return (
        <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Topic Details
                </h3>
                <div className="prose prose-orange max-w-none text-gray-700 whitespace-pre-wrap">
                    {config.topicDescription}
                </div>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-800 rounded-full text-sm font-bold border border-orange-100">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                    Minimum Required Slides: {config.minSlides}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Evaluation Criteria</h4>
                    <div className="space-y-4">
                        {[
                            { label: 'Content Depth', marks: config.rubric?.contentMarks, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                            { label: 'Design & Visuals', marks: config.rubric?.designMarks, icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                            { label: 'Technical Explanation', marks: config.rubric?.explanationMarks, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                            { label: 'Q&A Readiness', marks: config.rubric?.qaMarks, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' }
                        ].map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={c.icon} />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{c.label}</span>
                                </div>
                                <span className="text-sm font-black text-orange-600">{c.marks} Pts</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col justify-center bg-orange-600 rounded-2xl p-8 text-white">
                    <div className="mb-6">
                        <h4 className="text-2xl font-black mb-2">Ready to Submit?</h4>
                        <p className="text-orange-100 opacity-90">Please ensure your PPT follows the slide count and content guidelines mentioned.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <label className="block text-xs font-bold text-orange-200 uppercase tracking-widest mb-3">Upload File</label>
                        <input
                            type="file"
                            accept=".ppt,.pptx"
                            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-orange-50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white file:text-orange-600 hover:file:bg-orange-50 transition-all cursor-pointer"
                        />
                        <p className="mt-3 text-[10px] text-orange-200 italic">*Only .ppt and .pptx files are accepted</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PPTView;
