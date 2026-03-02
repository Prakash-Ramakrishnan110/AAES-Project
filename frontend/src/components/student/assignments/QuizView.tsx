import React, { useState } from 'react';

interface QuizViewProps {
    config: {
        timeLimit: number;
        attemptsAllowed: number;
        randomize: boolean;
        questions: Array<{
            questionText: string;
            options: string[];
            correctAnswer: any;
            marks: number;
            questionType: string;
        }>;
    };
    onAnswersChange: (answers: any) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ config, onAnswersChange }) => {
    const [answers, setAnswers] = useState<Record<number, any>>({});

    const handleOptionChange = (questionIdx: number, option: string) => {
        const newAnswers = { ...answers, [questionIdx]: option };
        setAnswers(newAnswers);
        onAnswersChange(JSON.stringify(newAnswers));
    };

    return (
        <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Time Limit</p>
                        <p className="text-lg font-black text-amber-900">{config.timeLimit} Minutes</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Attempts</p>
                    <p className="text-lg font-black text-amber-900">Max {config.attemptsAllowed}</p>
                </div>
            </div>

            <div className="space-y-8">
                {config.questions?.map((q, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-indigo-200 transition-colors">
                        <div className="flex justify-between items-start gap-4 mb-6">
                            <h4 className="text-lg font-bold text-gray-800 leading-tight">
                                <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                                {q.questionText}
                            </h4>
                            <span className="shrink-0 bg-gray-50 px-3 py-1 rounded-full text-xs font-bold text-gray-500 border border-gray-100">
                                {q.marks} Marks
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options?.map((option, optIdx) => (
                                <button
                                    type="button"
                                    key={optIdx}
                                    onClick={() => handleOptionChange(idx, option)}
                                    className={`p-4 rounded-xl text-left transition-all border-2 flex items-center gap-3
                                        ${answers[idx] === option
                                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-4 ring-indigo-50'
                                            : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                                        ${answers[idx] === option ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                        {answers[idx] === option && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <span className="font-medium">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizView;
