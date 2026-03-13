import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';

// Specialized Views
import QuizView from '../../components/student/assignments/QuizView';
import ProgrammingView from '../../components/student/assignments/ProgrammingView';
import SeminarView from '../../components/student/assignments/SeminarView';
import PPTView from '../../components/student/assignments/PPTView';
import HandwrittenView from '../../components/student/assignments/HandwrittenView';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentAssignmentView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext)!;

    const [assignment, setAssignment] = useState<any>(null);
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Dynamic State for different format types
    const [answerText, setAnswerText] = useState('');
    const [code, setCode] = useState('');
    const [quizAnswers, setQuizAnswers] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);

    // New Loading States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingText, setLoadingText] = useState('Initializing Secure Upload...');

    // Resubmission Request State
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestReason, setRequestReason] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);

    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleDownloadQuestions = () => {
        if (!assignment) return;

        let content = `ASSIGNMENT: ${assignment.title}\n`;
        content += `SUBJECT: ${assignment.subject?.name} (${assignment.subject?.code})\n`;
        content += `MAX MARKS: ${assignment.maxMarks}\n`;
        content += `DEADLINE: ${new Date(assignment.deadline).toLocaleString()}\n\n`;
        content += `DESCRIPTION:\n${assignment.description}\n\n`;
        content += `QUESTIONS:\n`;

        const config = assignment.formatConfig || {};

        // Try getting questions from multiple locations
        const questions = config.questions || assignment.questions || [];

        questions.forEach((q: any, i: number) => {
            if (typeof q === 'string') {
                content += `${i + 1}. ${q}\n`;
            } else {
                content += `${i + 1}. ${q.questionText || q.question} (${q.marks} Marks)\n`;
                if (q.options) {
                    q.options.forEach((opt: string, optIdx: number) => {
                        content += `   ${String.fromCharCode(97 + optIdx)}) ${opt}\n`;
                    });
                }
            }
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${assignment.title.replace(/\s+/g, '_')}_Questions.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Get Assignment Details
            const assRes = await axios.get(`${API}/api/assignments/${id}`, config);
            setAssignment(assRes.data);

            // Get Existing Submission (if any)
            const subRes = await axios.get(`${API}/api/submissions/my`, config);
            const mySub = subRes.data.find((s: any) => s.assignment._id === id);

            if (mySub) {
                setSubmission(mySub);
                setAnswerText(mySub.answers || '');
                setCode(mySub.code || '');
                // Note: For Quiz, we might want to populate existing answers if allowed
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // VALIDATION
        const type = assignment.submissionType || assignment.type;
        if (type === 'code' && !code.trim()) {
            setToastMessage({ text: 'Please write some code before submitting.', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }
        if (['handwritten', 'document', 'ppt', 'seminar'].includes(type)) {
            if (!file && !answerText.trim()) {
                setToastMessage({ text: 'Please upload a file or type your answer before submitting.', type: 'error' });
                setTimeout(() => setToastMessage(null), 4000);
                return;
            }
        }
        if (type === 'quiz' && !quizAnswers) {
            setToastMessage({ text: 'Please complete the quiz before submitting.', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        setIsSubmitting(true);
        setLoadingText('Initializing Secure Upload...');

        const loadingTexts = [
            'Analyzing Submission Data...',
            'Evaluating Answers...',
            'Running AI Algorithms...',
            'Cross-Checking with Model Answers...',
            'Generating Feedback...',
            'Finalizing Scores...'
        ];

        let textIndex = 0;
        const textInterval = setInterval(() => {
            if (textIndex < loadingTexts.length) {
                setLoadingText(loadingTexts[textIndex]);
                textIndex++;
            }
        }, 3000);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const formData = new FormData();
            formData.append('assignmentId', id || '');

            // Map structured answers to basic fields for existing submission model
            // In a full refactor, the submission model would also have a structured 'data' field
            if (quizAnswers) formData.append('answers', quizAnswers);
            else if (answerText) formData.append('answers', answerText);

            if (code) formData.append('code', code);

            if (file) {
                formData.append('file', file);
            }

            await axios.post(`${API}/api/submissions`, formData, config);
            setToastMessage({ text: 'Assignment Submitted!', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
            fetchData(); // Refresh to show status
        } catch (error: any) {
            console.error(error);
            setToastMessage({ text: error.response?.data?.message || 'Error submitting', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
        } finally {
            clearInterval(textInterval);
            setIsSubmitting(false);
        }
    };

    const handleRequestResubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestReason.trim() || !submission) return;

        setIsRequesting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Ensure API URL is formatted correctly
            const endpoint = `${API}/api/submissions/${submission._id}/request-resubmit`;
            await axios.post(endpoint, { reason: requestReason }, config);

            setToastMessage({ text: 'Resubmission request sent!', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
            setShowRequestForm(false);
            fetchData(); // Refresh to get updated status
        } catch (error: any) {
            console.error('Resubmission Error:', error);
            setToastMessage({ text: error.response?.data?.message || 'Error sending request. Please try again.', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
        } finally {
            setIsRequesting(false);
        }
    };

    const renderFormatView = () => {
        const type = assignment.submissionType || assignment.type;
        const rawConfig = assignment.formatConfig || {};

        // Normalize config to include questions from legacy locations if missing
        const config = {
            ...rawConfig,
            questions: rawConfig.questions || (assignment.questions || []).map((q: any) => {
                if (typeof q === 'string') return { questionText: q, marks: Math.round(assignment.maxMarks / (assignment.questions?.length || 1)) };
                return q;
            })
        };

        switch (type) {
            case 'quiz':
                return <QuizView config={config} onAnswersChange={setQuizAnswers} />;
            case 'code':
                return <ProgrammingView assignmentId={id || ''} config={config} onCodeChange={setCode} code={code} />;
            case 'seminar':
                return <SeminarView config={config} onFileChange={setFile} />;
            case 'ppt':
                return <PPTView config={config} onFileChange={setFile} />;
            case 'handwritten':
            case 'document':
                return (
                    <HandwrittenView
                        config={config}
                        onFileChange={setFile}
                        onTextChange={setAnswerText}
                        answerText={answerText}
                    />
                );
            default:
                return (
                    <div className="p-6 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                        <p className="font-bold flex items-center gap-2 mb-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Legacy Assignment Details
                        </p>
                        <p className="text-sm">This assignment uses an older format. Please contact your instructor if you cannot complete it.</p>
                        <div className="mt-4 p-3 bg-white/50 rounded-md text-xs font-mono">
                            Type ID: {type || 'unknown'}
                        </div>
                    </div>
                );
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
    );

    if (!assignment) return (
        <div className="max-w-4xl mx-auto mt-12 p-12 bg-white rounded-md shadow-sm border border-slate-200 text-center">
            <h2 className="text-xl font-bold text-slate-800">Assignment not found</h2>
            <button onClick={() => navigate(-1)} className="mt-4 text-slate-600 font-bold hover:text-slate-900">Go Back</button>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
                {/* Custom Toast Notification */}
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-md shadow-sm font-medium border text-sm flex items-center gap-2
                        ${toastMessage.type === 'success'
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'}`}
                    >
                        {toastMessage.text}
                    </motion.div>
                )}

                {/* Header */}
                <div className="relative bg-white rounded-md p-6 shadow-sm border border-slate-200 mb-6 overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                                    {assignment.submissionType || assignment.type}
                                </span>
                                <span className="text-slate-300 text-xs">•</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{assignment.subject?.name}</span>
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight mb-1 tracking-tight">{assignment.title}</h1>
                            <p className="text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">{assignment.description}</p>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</p>
                                <p className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                                    {new Date(assignment.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDownloadQuestions}
                                    className="px-3 py-2 bg-white text-slate-600 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 group shadow-sm"
                                >
                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span className="text-xs font-bold uppercase tracking-wider">Download Questions</span>
                                </button>
                                <div className="px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none mb-1">Max Marks</span>
                                    <span className="text-lg font-bold text-slate-900 leading-none">{assignment.maxMarks}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submission Status for Graded Assignments */}
                {submission && (
                    <div className="mb-6 space-y-4">
                        <div className={`p-5 rounded-md border flex items-center justify-between shadow-sm
                        ${submission.status === 'graded'
                                ? 'bg-green-50 border-green-200 text-green-900'
                                : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-md ${submission.status === 'graded' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    {submission.status === 'graded' ? (
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Status</p>
                                    <p className="text-base font-bold capitalize">{submission.status}</p>
                                </div>
                            </div>
                            {submission.marks !== undefined && submission.marks !== null && (
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Score</p>
                                    <p className="text-lg font-bold">{submission.marks} <span className="text-xs opacity-50 font-medium">/ {assignment.maxMarks}</span></p>
                                </div>
                            )}
                        </div>
                        {submission.feedback && (
                            <div className="p-5 bg-white rounded-md border border-slate-200 shadow-sm relative overflow-hidden">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Evaluation Feedback
                                </h3>
                                <div className="prose prose-sm max-w-none text-slate-600">
                                    <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-100">{submission.feedback}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* View Switching Logic based on Submission State */}
                {submission && submission.resubmissionStatus !== 'approved' ? (
                    <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-md flex items-center justify-center mb-4 border border-slate-200">
                            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Assignment Submitted</h3>
                        <p className="text-slate-500 mb-6 max-w-md text-sm font-medium">You have already submitted this assignment. You cannot make another submission unless your instructor grants permission.</p>

                        {submission.resubmissionStatus === 'requested' ? (
                            <div className="px-5 py-3 bg-amber-50 rounded-md border border-amber-200 text-amber-800 font-medium flex items-center gap-3 text-sm">
                                <svg className="animate-spin w-4 h-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Your request to resubmit is pending instructor approval.
                            </div>
                        ) : submission.resubmissionStatus === 'rejected' ? (
                            <div className="px-5 py-3 bg-red-50 rounded-md border border-red-200 text-red-800 font-medium flex items-center gap-3 text-sm">
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Your request to resubmit was declined.
                            </div>
                        ) : (
                            showRequestForm ? (
                                <form onSubmit={handleRequestResubmit} className="w-full max-w-lg mt-4 text-left">
                                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Reason for Resubmission</label>
                                    <textarea
                                        className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors min-h-[100px] mb-4 text-sm font-medium"
                                        placeholder="Explain why you need to resubmit..."
                                        value={requestReason}
                                        onChange={(e) => setRequestReason(e.target.value)}
                                        required
                                    />
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowRequestForm(false)} className="px-4 py-2 rounded-md font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                                        <button type="submit" disabled={isRequesting} className="px-4 py-2 rounded-md font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50">  
                                            {isRequesting ? 'Sending...' : 'Send Request'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setShowRequestForm(true)}
                                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-md font-bold text-sm transition-colors shadow-sm"
                                >
                                    Request Resubmission
                                </button>
                            )
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {renderFormatView()}

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`group relative px-8 py-3 rounded-md font-bold text-sm shadow-sm transition-colors flex items-center gap-2 overflow-hidden ${isSubmitting
                                    ? 'bg-slate-400 text-white cursor-not-allowed shadow-none'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{submission ? 'Submit Approved Update' : 'Complete Submission'}</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Premium Full-Screen Processing Overlay */}
                {isSubmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                className="absolute -inset-3 rounded-full border-[3px] border-t-slate-700 border-r-transparent border-b-slate-400 border-l-transparent opacity-70"
                            />
                            <div className="w-16 h-16 bg-slate-900 rounded-md flex items-center justify-center shadow-sm">
                                <svg className="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                        </div>

                        <motion.div
                            key={loadingText}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="mt-8 text-center"
                        >
                            <h2 className="text-xl font-bold text-slate-900 mb-1">
                                {loadingText}
                            </h2>
                            <p className="text-slate-500 font-medium text-sm">Please do not close this window.</p>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default StudentAssignmentView;
