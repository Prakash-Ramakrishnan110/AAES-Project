import React from 'react';

interface Props {
    formData: any;
    setFormData: (data: any) => void;
}

const SeminarBuilder: React.FC<Props> = ({ formData, setFormData }) => {

    React.useEffect(() => {
        if (!formData.seminarConfig) {
            setFormData({
                ...formData,
                seminarConfig: {
                    presentationDate: '',
                    isGroup: false,
                    rubric: {
                        topicSelectionMarks: 0,
                        technicalContentMarks: 0,
                        presentationSkillsMarks: 0,
                        visualQualityMarks: 0,
                        timeManagementMarks: 0,
                        responseToQuestionsMarks: 0
                    }
                }
            });
        }
    }, []);

    const updateConfig = (field: string, value: any) => {
        setFormData({
            ...formData,
            seminarConfig: { ...formData.seminarConfig, [field]: value }
        });
    };

    const updateRubric = (field: string, value: number) => {
        setFormData({
            ...formData,
            seminarConfig: {
                ...formData.seminarConfig,
                rubric: { ...formData.seminarConfig?.rubric, [field]: value }
            }
        });
    };

    const config = formData.seminarConfig || {};
    const r = config.rubric || {};
    const totalRubricMarks = (r.topicSelectionMarks || 0) + (r.technicalContentMarks || 0) + (r.presentationSkillsMarks || 0) +
        (r.visualQualityMarks || 0) + (r.timeManagementMarks || 0) + (r.responseToQuestionsMarks || 0);
    const marksMismatch = formData.maxMarks > 0 && totalRubricMarks !== formData.maxMarks;

    return (
        <div className="space-y-6">
            <div className="bg-pink-50/50 p-4 border border-pink-100 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-pink-900">Seminar / Live Presentation Format</h4>
                    <span className="text-[9px] font-black text-pink-600 uppercase tracking-widest bg-white/50 border border-pink-100 px-1.5 py-0.5 rounded shadow-sm">Advanced AI Brain</span>
                </div>
                <p className="text-sm text-pink-700">Track live presentations that occur in class. Topic generation uses our most advanced reasoning model.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Scheduled Presentation Date</label>
                    <input
                        type="date"
                        value={config.presentationDate || ''}
                        onChange={(e) => updateConfig('presentationDate', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-4 mt-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={config.isGroup || false} onChange={e => updateConfig('isGroup', e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-bold text-gray-800">Is this a Group Presentation?</span>
                    </label>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Seminar Grading Rubric</h3>
                {marksMismatch && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-100 flex items-center gap-2">
                        <span>⚠️ Error: Rubric total ({totalRubricMarks}) must exactly match the Assignment Total Marks ({formData.maxMarks || 0}).</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Topic Selection (15%)</label>
                        <input
                            type="number" min="0" value={r.topicSelectionMarks || ''}
                            onChange={e => updateRubric('topicSelectionMarks', parseInt(e.target.value) || 0)}
                            className={`w-full border ${marksMismatch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-lg px-3 py-2 text-sm outline-none`}
                        />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Technical Content (25%)</label>
                        <input
                            type="number" min="0" value={r.technicalContentMarks || ''}
                            onChange={e => updateRubric('technicalContentMarks', parseInt(e.target.value) || 0)}
                            className={`w-full border ${marksMismatch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-lg px-3 py-2 text-sm outline-none`}
                        />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Presentation Skills (20%)</label>
                        <input
                            type="number" min="0" value={r.presentationSkillsMarks || ''}
                            onChange={e => updateRubric('presentationSkillsMarks', parseInt(e.target.value) || 0)}
                            className={`w-full border ${marksMismatch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-lg px-3 py-2 text-sm outline-none`}
                        />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">PPT / Visual Quality (15%)</label>
                        <input
                            type="number" min="0" value={r.visualQualityMarks || ''}
                            onChange={e => updateRubric('visualQualityMarks', parseInt(e.target.value) || 0)}
                            className={`w-full border ${marksMismatch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-lg px-3 py-2 text-sm outline-none`}
                        />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Time Management (10%)</label>
                        <input
                            type="number" min="0" value={r.timeManagementMarks || ''}
                            onChange={e => updateRubric('timeManagementMarks', parseInt(e.target.value) || 0)}
                            className={`w-full border ${marksMismatch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-lg px-3 py-2 text-sm outline-none`}
                        />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Response to Q&A (15%)</label>
                        <input
                            type="number" min="0" value={r.responseToQuestionsMarks || ''}
                            onChange={e => updateRubric('responseToQuestionsMarks', parseInt(e.target.value) || 0)}
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

export default SeminarBuilder;
