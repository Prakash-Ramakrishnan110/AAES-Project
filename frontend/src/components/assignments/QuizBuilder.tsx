import React from 'react';
import { Save } from 'lucide-react';

interface Props {
    formData: any;
    setFormData: (data: any) => void;
}

const QuizBuilder: React.FC<Props> = ({ formData, setFormData }) => {

    React.useEffect(() => {
        if (!formData.quizConfig) {
            setFormData({
                ...formData,
                quizConfig: {
                    timeLimitMinutes: 60,
                    randomizeQuestions: false,
                    attemptsAllowed: 1
                },
                quizRubric: {
                    accuracyMarks: 0,
                    conceptMarks: 0,
                    completionMarks: 0
                }
            });
        }
    }, []);

    const updateConfig = (field: string, value: any) => {
        setFormData({
            ...formData,
            quizConfig: { ...formData.quizConfig, [field]: value }
        });
    };

    const addQuestion = (type: string) => {
        const newQ: any = { questionText: '', marks: 1, questionType: type };
        if (type === 'MCQ' || type === 'MultipleCorrect') {
            newQ.options = ['', '', '', ''];
            newQ.correctAnswer = type === 'MCQ' ? '' : [];
        } else if (type === 'True/False') {
            newQ.options = ['True', 'False'];
            newQ.correctAnswer = 'True';
        }

        setFormData({
            ...formData,
            questions: [...(formData.questions || []), newQ]
        });
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQs = [...(formData.questions || [])];
        newQs[index] = { ...newQs[index], [field]: value };
        setFormData({ ...formData, questions: newQs });
    };

    const updateOption = (qIndex: number, optIndex: number, value: string) => {
        const newQs = [...(formData.questions || [])];
        newQs[qIndex].options[optIndex] = value;
        setFormData({ ...formData, questions: newQs });
    };

    const removeQuestion = (index: number) => {
        const newQs = [...(formData.questions || [])];
        newQs.splice(index, 1);
        setFormData({ ...formData, questions: newQs });
    };

    const autoDistributeMarks = () => {
        const questions = formData.questions || [];
        if (questions.length === 0 || !formData.maxMarks) return;

        const qCount = questions.length;
        const baseMarks = Math.floor(formData.maxMarks / qCount);
        const remainder = formData.maxMarks % qCount;

        const newQs = questions.map((q: any, idx: number) => ({
            ...q,
            marks: baseMarks + (idx < remainder ? 1 : 0)
        }));

        setFormData({ ...formData, questions: newQs });
    };

    const updateRubric = (field: string, value: number) => {
        setFormData({
            ...formData,
            quizRubric: { ...(formData.quizRubric || {}), [field]: value }
        });
    };

    const config = formData.quizConfig || {};
    const questions = formData.questions || [];
    const totalQuizMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
    const marksMismatch = formData.maxMarks > 0 && totalQuizMarks !== formData.maxMarks;

    const r = formData.quizRubric || {};
    const totalRubricMarks = (r.accuracyMarks || 0) + (r.conceptMarks || 0) + (r.completionMarks || 0);
    const rubricMismatch = formData.maxMarks > 0 && totalRubricMarks !== formData.maxMarks;

    return (
        <div className="space-y-6">
            <div className="bg-purple-50/50 p-4 border border-purple-100 rounded-xl">
                <h4 className="font-bold text-purple-900 mb-1">Online Quiz Format</h4>
                <p className="text-sm text-purple-700">Configure an online timed test. Grading is auto-calculated from questions, but you can also use the rubric below for meta-evaluation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Time Limit (Minutes)</label>
                    <input
                        type="number"
                        min="1"
                        value={config.timeLimitMinutes || 60}
                        onChange={(e) => updateConfig('timeLimitMinutes', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Attempts Allowed</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={config.attemptsAllowed || 1}
                        onChange={(e) => updateConfig('attemptsAllowed', parseInt(e.target.value) || 1)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-4 mt-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={config.randomizeQuestions || false} onChange={e => updateConfig('randomizeQuestions', e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-bold text-gray-800">Randomize Order</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Quiz Questions</h3>
                <div className="flex gap-2">
                    {marksMismatch && (
                        <button
                            type="button"
                            onClick={autoDistributeMarks}
                            className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition border border-amber-200 flex items-center gap-1.5"
                        >
                            <Save size={14} /> Auto-Fixed
                        </button>
                    )}
                    <button type="button" onClick={() => addQuestion('MCQ')} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">+ Add MCQ</button>
                    <button type="button" onClick={() => addQuestion('True/False')} className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-700 transition">+ Add True/False</button>
                    <button type="button" onClick={() => addQuestion('MultipleCorrect')} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 transition">+ Add Checkboxes</button>
                </div>
            </div>

            {marksMismatch && (
                <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-100 flex items-center gap-2">
                    <span>⚠️ Error: Question marks ({totalQuizMarks}) sum must match Assignment Total ({formData.maxMarks || 0}).</span>
                </div>
            )}

            <div className="space-y-4">
                {questions.map((q: any, i: number) => (
                    <div key={i} className={`p-5 border ${q.questionType === 'True/False' ? 'border-teal-200 bg-teal-50/10' : q.questionType === 'MCQ' ? 'border-indigo-200 bg-indigo-50/10' : 'border-purple-200 bg-purple-50/10'} rounded-xl relative shadow-sm`}>
                        <button type="button" onClick={() => removeQuestion(i)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 px-2 py-1 rounded">Remove</button>
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`font-bold px-3 py-1 rounded-lg text-sm ${q.questionType === 'True/False' ? 'bg-teal-100 text-teal-700' : q.questionType === 'MCQ' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                                Q{i + 1} - {q.questionType}
                            </span>
                            <div className="w-24">
                                <input type="number" min="1" placeholder="Marks" value={q.marks || ''} onChange={(e) => updateQuestion(i, 'marks', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                        <textarea placeholder="Question text..." rows={2} value={q.questionText || ''} onChange={(e) => updateQuestion(i, 'questionText', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-3 resize-none" />

                        {/* Options Logic */}
                        {(q.questionType === 'MCQ' || q.questionType === 'MultipleCorrect') && (
                            <div className="space-y-2 mt-4 pl-4 border-l-2 border-indigo-200">
                                {q.options.map((opt: string, optIdx: number) => (
                                    <div key={optIdx} className="flex items-center gap-3">
                                        <input
                                            type={q.questionType === 'MCQ' ? "radio" : "checkbox"}
                                            name={`q-${i}-correct`}
                                            checked={q.questionType === 'MCQ' ? q.correctAnswer === opt : (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt))}
                                            onChange={(e) => {
                                                if (q.questionType === 'MCQ') updateQuestion(i, 'correctAnswer', opt);
                                                else {
                                                    let arr = Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [];
                                                    if (e.target.checked) arr.push(opt); else arr = arr.filter(a => a !== opt);
                                                    updateQuestion(i, 'correctAnswer', arr);
                                                }
                                            }}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <input type="text" placeholder={`Option ${optIdx + 1}`} value={opt} onChange={(e) => updateOption(i, optIdx, e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {q.questionType === 'True/False' && (
                            <div className="flex items-center gap-6 mt-4 pl-4 border-l-2 border-teal-200">
                                <span className="text-sm font-bold text-gray-700">Correct:</span>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={q.correctAnswer === 'True'} onChange={() => updateQuestion(i, 'correctAnswer', 'True')} /> <span className="text-sm">True</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={q.correctAnswer === 'False'} onChange={() => updateQuestion(i, 'correctAnswer', 'False')} /> <span className="text-sm">False</span></label>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Quiz Grading Rubric (Meta-Evaluation)</h3>
                    <div className={`px-3 py-1 rounded-lg font-bold text-xs ${rubricMismatch ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        Rubric Total: {totalRubricMarks} / {formData.maxMarks || 0}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Accuracy (60%)</label>
                        <input type="number" min="0" value={r.accuracyMarks || ''} onChange={e => updateRubric('accuracyMarks', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Concepts (30%)</label>
                        <input type="number" min="0" value={r.conceptMarks || ''} onChange={e => updateRubric('conceptMarks', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" />
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Completion (10%)</label>
                        <input type="number" min="0" value={r.completionMarks || ''} onChange={e => updateRubric('completionMarks', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizBuilder;
