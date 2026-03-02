import React from 'react';

interface Props {
    formData: any;
    setFormData: (data: any) => void;
}

const HandwrittenBuilder: React.FC<Props> = ({ formData, setFormData }) => {

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

    return (
        <div className="space-y-6">
            <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-1">Handwritten Format Rules</h4>
                <p className="text-sm text-blue-700">Students will answer these questions on paper and upload scanned images (JPG/PNG) or a compiled PDF.</p>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Question Builder</h3>
                <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                >
                    + Add Question
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
                                Q{i + 1}
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
                            placeholder="Enter the question text here..."
                            rows={2}
                            value={q.questionText || ''}
                            onChange={(e) => updateQuestion(i, 'questionText', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-3 resize-none"
                        />

                        <textarea
                            placeholder="Model Answer (Optional - used for AI grading assistance)"
                            rows={2}
                            value={q.modelAnswer || ''}
                            onChange={(e) => updateQuestion(i, 'modelAnswer', e.target.value)}
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>
                ))}
                {(formData.questions?.length === 0 || !formData.questions) && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                        <p className="text-gray-500 text-sm">No questions added yet. Click "+ Add Question" to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HandwrittenBuilder;
