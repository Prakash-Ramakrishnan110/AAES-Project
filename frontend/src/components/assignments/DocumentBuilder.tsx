import React from 'react';

interface Props {
    formData: any;
    setFormData: (data: any) => void;
}

const DocumentBuilder: React.FC<Props> = ({ formData, setFormData }) => {

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [...(formData.questions || []), { questionText: '', marks: 0, modelAnswer: '' }]
        });
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQs = [...(formData.questions || [])];
        newQs[index] = { ...newQs[index], [field]: value };
        setFormData({ ...formData, questions: newQs });
    };

    const removeQuestion = (index: number) => {
        const newQs = [...(formData.questions || [])];
        newQs.splice(index, 1);
        setFormData({ ...formData, questions: newQs });
    };

    const updateRubric = (field: string, value: number) => {
        setFormData({
            ...formData,
            assignmentRubric: { ...(formData.assignmentRubric || {}), [field]: value }
        });
    };

    const r = formData.assignmentRubric || {};
    const totalRubricMarks = (r.understandingMarks || 0) + (r.contentMarks || 0) + (r.organizationMarks || 0) + (r.presentationMarks || 0) + (r.originalityMarks || 0);
    const marksMismatch = formData.maxMarks > 0 && totalRubricMarks !== formData.maxMarks;

    return (
        <div className="space-y-6">
            <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl">
                <h4 className="font-bold text-indigo-900 mb-1">Document Format Rules</h4>
                <p className="text-sm text-indigo-700">Students will upload a typed Document (.docx, .pdf) containing their responses to the questions below.</p>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Research & Question Prompts</h3>
                <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                >
                    + Add Prompt
                </button>
            </div>

            <div className="space-y-4">
                {(formData.questions || []).map((q: any, i: number) => (
                    <div key={i} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm relative">
                        <button
                            type="button"
                            onClick={() => removeQuestion(i)}
                            className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 px-2 py-1 rounded"
                        >
                            Remove
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">
                                Prompt {i + 1}
                            </span>
                            <div className="w-32">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Marks"
                                    value={q.marks || ''}
                                    onChange={(e) => updateQuestion(i, 'marks', parseInt(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <textarea
                            placeholder="Enter the document prompt or question here..."
                            rows={3}
                            value={q.questionText || ''}
                            onChange={(e) => updateQuestion(i, 'questionText', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-3 resize-none"
                        />

                        <textarea
                            placeholder="Grading Rubric / Ideal Answer Summary (Optional)"
                            rows={2}
                            value={q.modelAnswer || ''}
                            onChange={(e) => updateQuestion(i, 'modelAnswer', e.target.value)}
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>
                ))}
                {(formData.questions?.length === 0 || !formData.questions) && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                        <p className="text-gray-500 text-sm">No prompts added yet. Click "+ Add Prompt" to begin.</p>
                    </div>
                )}
            </div>

            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Assignment Evaluation Rubric</h3>
                    <div className={`px-3 py-1 rounded-lg font-bold text-xs ${marksMismatch ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        Rubric Total: {totalRubricMarks} / {formData.maxMarks || 0}
                    </div>
                </div>

                {marksMismatch && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-100">
                        ⚠️ Rubric total ({totalRubricMarks}) must match Assignment Total Marks ({formData.maxMarks || 0}).
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Understanding (25%)</label>
                        <input type="number" min="0" value={r.understandingMarks || ''} onChange={e => updateRubric('understandingMarks', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Content Quality (25%)</label>
                        <input type="number" min="0" value={r.contentMarks || ''} onChange={e => updateRubric('contentMarks', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Organization (20%)</label>
                        <input type="number" min="0" value={r.organizationMarks || ''} onChange={e => updateRubric('organizationMarks', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Presentation (15%)</label>
                        <input type="number" min="0" value={r.presentationMarks || ''} onChange={e => updateRubric('presentationMarks', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Originality (15%)</label>
                        <input type="number" min="0" value={r.originalityMarks || ''} onChange={e => updateRubric('originalityMarks', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentBuilder;
