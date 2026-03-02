import React from 'react';

interface Props {
    formData: any;
    setFormData: (data: any) => void;
}

const PPTBuilder: React.FC<Props> = ({ formData, setFormData }) => {

    // Initialize default PPT config if it doesn't exist
    React.useEffect(() => {
        if (!formData.pptConfig) {
            setFormData({
                ...formData,
                pptConfig: {
                    topicDescription: '',
                    minSlides: 5,
                    rubric: {
                        contentMarks: 0,
                        designMarks: 0,
                        explanationMarks: 0,
                        qaMarks: 0
                    }
                }
            });
        }
    }, []);

    const updateConfig = (field: string, value: any) => {
        setFormData({
            ...formData,
            pptConfig: { ...formData.pptConfig, [field]: value }
        });
    };

    const updateRubric = (field: string, value: number) => {
        setFormData({
            ...formData,
            pptConfig: {
                ...formData.pptConfig,
                rubric: { ...formData.pptConfig?.rubric, [field]: value }
            }
        });
    };

    const config = formData.pptConfig || { rubric: {} };
    const r = config.rubric || {};

    const totalRubricMarks = (r.contentMarks || 0) + (r.designMarks || 0) + (r.explanationMarks || 0) + (r.qaMarks || 0);
    const marksMismatch = formData.maxMarks > 0 && totalRubricMarks !== formData.maxMarks;

    return (
        <div className="space-y-6">
            <div className="bg-orange-50/50 p-4 border border-orange-100 rounded-xl">
                <h4 className="font-bold text-orange-900 mb-1">Presentation (PPT) Format</h4>
                <p className="text-sm text-orange-700">Students will upload a PowerPoint presentation (.ppt, .pptx). You can define the required slide count and a specific grading rubric.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Topic Details / Expected Output</label>
                    <textarea
                        rows={3}
                        value={config.topicDescription || ''}
                        onChange={(e) => updateConfig('topicDescription', e.target.value)}
                        placeholder="Detail exactly what the presentation should cover..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Minimum Slides Required</label>
                    <input
                        type="number"
                        min="1"
                        value={config.minSlides || 5}
                        onChange={(e) => updateConfig('minSlides', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Evaluation Rubric</h3>
                {marksMismatch && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-100 flex items-center gap-2">
                        <span>⚠️ Error: Rubric total ({totalRubricMarks}) must exactly match the Assignment Total Marks ({formData.maxMarks || 0}).</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Content Marks</label>
                        <input
                            type="number"
                            min="0"
                            value={r.contentMarks || ''}
                            onChange={e => updateRubric('contentMarks', parseInt(e.target.value) || 0)}
                            className={`w-full border ${marksMismatch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-lg px-3 py-2 text-sm outline-none`}
                        />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Design Marks</label>
                        <input
                            type="number"
                            min="0"
                            value={r.designMarks || ''}
                            onChange={e => updateRubric('designMarks', parseInt(e.target.value) || 0)}
                            className={`w-full border ${marksMismatch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-lg px-3 py-2 text-sm outline-none`}
                        />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Explanation Marks</label>
                        <input
                            type="number"
                            min="0"
                            value={r.explanationMarks || ''}
                            onChange={e => updateRubric('explanationMarks', parseInt(e.target.value) || 0)}
                            className={`w-full border ${marksMismatch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-lg px-3 py-2 text-sm outline-none`}
                        />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Q&A Marks</label>
                        <input
                            type="number"
                            min="0"
                            value={r.qaMarks || ''}
                            onChange={e => updateRubric('qaMarks', parseInt(e.target.value) || 0)}
                            className={`w-full border ${marksMismatch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-lg px-3 py-2 text-sm outline-none`}
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <div className={`px-4 py-2 rounded-lg font-bold text-sm ${marksMismatch ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        Rubric Total: {totalRubricMarks} / {formData.maxMarks || 0}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PPTBuilder;
