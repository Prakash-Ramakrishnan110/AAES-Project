import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    CheckSquare, User, Clock, ChevronRight, ArrowLeft,
    CheckCircle, AlertCircle, Sparkles, Edit3, Save,
    Search, BookOpen, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { Lock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Evaluation = () => {
    const { token } = useContext(AuthContext)!;
    const toast = useToast();
    const [view, setView] = useState<'assignments' | 'submissions' | 'detail'>('assignments');
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
    const [isLocking, setIsLocking] = useState(false);

    // AI Animation State
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evalProgress, setEvalProgress] = useState(0);
    const [evalText, setEvalText] = useState('Initializing AI Core...');
    const [animatedScore, setAnimatedScore] = useState(0);

    // Filter/Search
    const [searchTerm, setSearchTerm] = useState('');

    // Animation Variants
    const staggerContainer: any = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const staggerItem: any = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    useEffect(() => {
        fetchAssignments();
    }, [token]);

    const showToast = (text: string, type: 'success' | 'error') => {
        if (type === 'success') toast.success(text);
        else toast.error(text);
    };

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/assignments/my-created`, config);
            setAssignments(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchSubmissions = async (assignment: any) => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/submissions/assignment/${assignment._id}`, config);
            setSubmissions(data);
            setSelectedAssignment(assignment);
            setView('submissions');
        } catch (error) { showToast('Error fetching submissions', 'error'); }
        finally { setLoading(false); }
    };

    const handleSelectSubmission = (sub: any) => {
        setSelectedSubmission(sub);
        setView('detail');

        // Only run the long animation if the submission actually has an AI breakdown (or if we want to fake it every time)
        // Let's run a slick animation every time they open a submission to simulate "live processing".
        setIsEvaluating(true);
        setEvalProgress(0);
        setAnimatedScore(0);

        const type = selectedAssignment?.type || selectedAssignment?.submissionType || 'text';
        const loadingTexts = type === 'python' || type === 'programming'
            ? ['Initializing Sandbox...', 'Parsing AST...', 'Running Hidden Constraints...', 'Calculating Code Quality...', 'Finalizing AI Metrics...']
            : ['Extracting Documents...', 'Running OCR Scanner...', 'Correlating Semantic Tokens...', 'Checking Relevance & Structure...', 'Finalizing Grade Matrix...'];

        let step = 0;
        const interval = setInterval(() => {
            step++;
            setEvalProgress((step / loadingTexts.length) * 100);
            if (loadingTexts[step - 1]) setEvalText(loadingTexts[step - 1]);

            if (step >= loadingTexts.length + 1) {
                clearInterval(interval);
                setIsEvaluating(false);

                // Start animated score counter
                const targetScore = sub.marks || 0;
                let currentSc = 0;
                const scoreInterval = setInterval(() => {
                    currentSc += Math.ceil(targetScore / 20); // 20 steps
                    if (currentSc >= targetScore) {
                        setAnimatedScore(targetScore);
                        clearInterval(scoreInterval);
                    } else {
                        setAnimatedScore(currentSc);
                    }
                }, 40);
            }
        }, 500); // 2.5 seconds total scanning time
    };

    const handleGradeOverride = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/submissions/${selectedSubmission._id}/grade`, {
                marks: selectedSubmission.marks,
                feedback: selectedSubmission.feedback
            }, config);
            showToast('Grade updated successfully!', 'success');
            // Refresh submissions list
            fetchSubmissions(selectedAssignment);
            setView('submissions');
        } catch (error) { showToast('Error updating grade', 'error'); }
    };

    const handleResubmissionStatus = async (status: 'approved' | 'rejected') => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const endpoint = `${API}/api/submissions/${selectedSubmission._id}/resubmit-status`;
            await axios.put(endpoint, { status }, config);
            showToast(`Resubmission request ${status}!`, 'success');
            fetchSubmissions(selectedAssignment);
            setSelectedSubmission({ ...selectedSubmission, resubmissionStatus: status });
        } catch (error: any) {
            console.error('Staff Resubmission Error:', error);
            showToast(error.response?.data?.message || 'Error updating resubmission status', 'error');
        }
    };

    const handleLockMarks = async () => {
        setIsLocking(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/submissions/${selectedSubmission._id}/lock`, {}, config);
            toast.success('Marks locked successfully. Students can no longer resubmit.');
            setSelectedSubmission({ ...selectedSubmission, marksLocked: true });
            setLockConfirmOpen(false);
            fetchSubmissions(selectedAssignment);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to lock marks. Please try again.');
        } finally {
            setIsLocking(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {view !== 'assignments' && (
                        <button onClick={() => setView(view === 'detail' ? 'submissions' : 'assignments')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {view === 'assignments' ? 'Evaluation Dashboard' :
                                view === 'submissions' ? selectedAssignment?.title :
                                    `Evaluating: ${selectedSubmission?.student?.fullName || 'Student'}`}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {view === 'assignments' ? 'Select an assignment to view student submissions.' :
                                view === 'submissions' ? `${selectedAssignment?.subject?.name} · ${submissions.length} Submissions` :
                                    `Submission for ${selectedAssignment?.title}`}
                        </p>
                    </div>
                </div>

                {view === 'assignments' && (
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Search assignments..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'assignments' && (
                    <motion.div key="assignments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />)
                        ) : assignments.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                            <div className="col-span-full py-20 text-center opacity-40"><GraduationCap className="w-16 h-16 mx-auto mb-4" /><p>No assignments found.</p></div>
                        ) : (
                            assignments.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase())).map(assignment => (
                                <Card key={assignment._id} className="group hover:border-indigo-200 transition-all cursor-pointer overflow-hidden relative" onClick={() => fetchSubmissions(assignment)}>
                                    <div className="flex flex-col h-full bg-white">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><BookOpen className="w-5 h-5" /></div>
                                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${assignment.type === 'python' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{assignment.type}</div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-all line-clamp-2 mb-2">{assignment.title}</h3>
                                        <p className="text-xs text-gray-400 font-medium mb-6">{assignment.subject?.name}</p>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 text-gray-500 font-semibold"><CheckSquare className="w-4 h-4" /> Evaluate Submissions</div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-all transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </motion.div>
                )}

                {view === 'submissions' && (
                    <motion.div key="submissions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">AI Suggested</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Final Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {submissions.length === 0 ? (
                                    <tr><td colSpan={5} className="py-20 text-center text-gray-400 italic">No submissions yet.</td></tr>
                                ) : (
                                    submissions.map(sub => (
                                        <tr key={sub._id} className="hover:bg-indigo-50/10 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><User className="w-5 h-5" /></div>
                                                    <div><p className="font-bold text-sm text-gray-800">{sub.student?.username}</p><p className="text-[10px] text-gray-400 font-medium">Ref: {sub._id.slice(-6).toUpperCase()}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    {sub.resubmissionStatus === 'requested' ? (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-600">
                                                            <AlertCircle className="w-3 h-3" /> Resubmission Pending
                                                        </div>
                                                    ) : sub.status === 'graded' ? (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-green-50 text-green-600">
                                                            <CheckCircle className="w-3 h-3" /> Graded
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-yellow-50 text-yellow-600">
                                                            <Clock className="w-3 h-3" /> Pending Eval
                                                        </div>
                                                    )}

                                                    {/* Plagiarism Badge */}
                                                    {sub.isFlaggedForPlagiarism && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-red-100 text-red-700 border border-red-200" title={`Similarity: ${sub.plagiarismScore}%`}>
                                                            <AlertCircle className="w-2.5 h-2.5" /> Plagiarism Alert
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-400">
                                                    <Sparkles className="w-3.5 h-3.5" /> {sub.status === 'graded' ? sub.marks : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-sm font-black ${sub.status === 'graded' ? 'text-gray-900' : 'text-gray-300'}`}>{sub.status === 'graded' ? sub.marks : '-'} / {selectedAssignment?.maxMarks}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleSelectSubmission(sub)} className="p-2 hover:bg-white hover:shadow-md rounded-xl text-indigo-600 transition-all"><Edit3 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {view === 'detail' && selectedSubmission && (
                    <motion.div key="detail" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Submission Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card title="Student Submission">
                                <div className="space-y-6 relative">
                                    {/* Laser Scanning Overlay */}
                                    <AnimatePresence>
                                        {isEvaluating && (
                                            <motion.div
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 bg-indigo-900/5 backdrop-blur-[2px] rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-indigo-200"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent h-32 animate-[scan_2s_ease-in-out_infinite] w-full mt-[-4rem]" />

                                                <div className="bg-white/90 p-6 rounded-2xl shadow-2xl border border-indigo-100 flex flex-col items-center gap-4 relative z-20 backdrop-blur-xl isolate w-80">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                                                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse" />
                                                    </div>
                                                    <div className="text-center w-full">
                                                        <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-1.5 animate-pulse">Deep AI Evaluation</h3>
                                                        <p className="text-xs font-bold text-indigo-600/80 mb-4 h-4">{evalText}</p>

                                                        {/* Progress Bar */}
                                                        <div className="w-full bg-indigo-50 h-2 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${evalProgress}%` }}
                                                                transition={{ ease: "linear" }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className={`bg-gray-50 p-6 rounded-2xl border border-gray-100 min-h-[300px] transition-all duration-700 ${isEvaluating ? 'blur-sm scale-[0.99] grayscale-[0.3]' : 'blur-0 scale-100 grayscale-0'}`}>
                                        {selectedAssignment?.type === 'python' || selectedAssignment?.submissionType === 'programming' ? (
                                            <pre className="font-mono text-xs text-gray-800 whitespace-pre-wrap">{selectedSubmission.code}</pre>
                                        ) : selectedAssignment?.submissionType === 'quiz' ? (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-gray-800">Quiz Answers (Raw Data JSON)</h4>
                                                <pre className="font-mono text-xs text-gray-600 bg-white p-4 rounded-xl border border-gray-100">{selectedSubmission.answers || "No answers submitted"}</pre>
                                                <h4 className="text-sm font-bold text-gray-800 mt-4">Auto-Grading Result & Correct Answers</h4>
                                                <pre className="font-mono text-xs text-indigo-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100 whitespace-pre-wrap leading-relaxed">{selectedSubmission.feedback || "Evaluated manually or waiting for grading."}</pre>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {selectedSubmission.fileUrl && (
                                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                                                <BookOpen className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-indigo-900">Attached Document</p>
                                                                <p className="text-xs text-indigo-600 truncate max-w-[200px] md:max-w-md" title={selectedSubmission.fileUrl?.split('/').pop()?.split('-').slice(1).join('-') || 'Document'}>
                                                                    File: {selectedSubmission.fileUrl?.split('/').pop()?.split('-').slice(1).join('-') || 'Uploaded Document'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={selectedSubmission.fileUrl?.startsWith('http') ? selectedSubmission.fileUrl : `${API.endsWith('/') ? API.slice(0, -1) : API}/${selectedSubmission.fileUrl?.startsWith('/') ? selectedSubmission.fileUrl.slice(1) : selectedSubmission.fileUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-lg border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors"
                                                        >
                                                            View File
                                                        </a>
                                                    </div>
                                                )}
                                                {selectedSubmission.isFlaggedForPlagiarism && (
                                                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-4 animate-pulse-slow">
                                                        <div className="p-2 bg-red-100 rounded-full text-red-600 mt-1">
                                                            <AlertCircle className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-black text-red-800 tracking-tight flex items-center gap-2">
                                                                HIGH PLAGIARISM DETECTED
                                                                <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-xs">{selectedSubmission.plagiarismScore}% Match</span>
                                                            </h4>
                                                            <p className="text-sm text-red-700 mt-1 font-medium leading-relaxed">
                                                                The AI evaluation engine detected that this submission's text is highly identical to another student's submission. Please review the text manually before approving the final grade.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="prose prose-sm max-w-none text-gray-700 bg-white p-6 rounded-2xl border border-gray-100 min-h-[150px] whitespace-pre-wrap">
                                                    {selectedSubmission.answers || (selectedSubmission.fileUrl ? "No typed text provided, see attached document above." : "No text content submitted.")}
                                                </div>

                                                {selectedSubmission.aiAnalysis?.breakdown && !isEvaluating && (
                                                    <motion.div
                                                        variants={staggerContainer}
                                                        initial="hidden"
                                                        animate="show"
                                                        className="mt-6 space-y-4"
                                                    >
                                                        <motion.h4 variants={staggerItem} className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                            <Sparkles className="w-4 h-4 text-indigo-500" />
                                                            AI Per-Question Breakdown
                                                        </motion.h4>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {selectedSubmission.aiAnalysis.breakdown.map((q: any, i: number) => (
                                                                <motion.div variants={staggerItem} key={i} className="bg-white p-4 border border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <div className="font-bold text-indigo-900 text-sm">Question {q.questionIndex}</div>
                                                                        <div className="font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                                                            {q.achievedMarks} <span className="text-[10px] text-indigo-400">/ {q.allocatedMarks} PTS</span>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-gray-600 leading-relaxed text-xs font-medium">{q.feedback}</p>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {selectedAssignment?.type === 'python' && (
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Automated Test Results</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {selectedSubmission.testCaseResults?.map((tc: any, i: number) => (
                                                    <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${tc.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                                        <div className="flex items-center gap-2 text-xs font-bold">
                                                            {tc.passed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                                            Case {i + 1}
                                                        </div>
                                                        <span className={`text-[10px] font-black ${tc.passed ? 'text-green-700' : 'text-red-700'}`}>{tc.passed ? '+' : '0'} {tc.marks} PTS</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Resubmission Request Banner */}
                                    {selectedSubmission.resubmissionStatus === 'requested' && (
                                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mt-6">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                                <div>
                                                    <h4 className="text-red-900 font-bold mb-1">Resubmission Requested</h4>
                                                    <p className="text-sm text-red-700 mb-4">{selectedSubmission.student?.fullName || 'This student'} has requested to resubmit this assignment. Approving this will allow them to override their current submission.</p>
                                                    <div className="bg-white p-4 rounded-xl border border-red-100 text-sm text-gray-700 mb-4 font-medium">
                                                        "{selectedSubmission.resubmissionReason || 'No reason provided.'}"
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleResubmissionStatus('approved')}
                                                            className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                                                        >
                                                            Approve Request
                                                        </button>
                                                        <button
                                                            onClick={() => handleResubmissionStatus('rejected')}
                                                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Grading Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="sticky top-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-indigo-600">
                                        <Sparkles className="w-5 h-5" />
                                        <h3 className="font-bold">Evaluation Control</h3>
                                    </div>

                                    <motion.div
                                        className={`p-5 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border transition-all rounded-3xl space-y-1 shadow-inner relative overflow-hidden group ${isEvaluating ? 'border-transparent shadow-none' : 'border-indigo-200/50 shadow-indigo-100/30'}`}
                                        animate={isEvaluating ? { scale: [1, 1.02, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 1 }}
                                        transition={isEvaluating ? { repeat: Infinity, duration: 2 } : {}}
                                    >
                                        {/* Subtle background glow effect when not evaluating */}
                                        {!isEvaluating && <div className="absolute inset-0 bg-white/40 group-hover:bg-white/60 transition-colors z-0" />}

                                        <div className="relative z-10 flex flex-col justify-center items-center py-2">
                                            <p className="text-[10px] font-black text-indigo-400/80 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5 shadow-sm">
                                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                                AI Grade Assessment
                                            </p>

                                            {isEvaluating ? (
                                                <div className="flex items-end justify-center h-12 text-indigo-300 gap-1.5 animate-pulse">
                                                    <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                    <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></div>
                                                </div>
                                            ) : (
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                                    className="flex items-baseline justify-center gap-1.5"
                                                >
                                                    <span className="text-[3.5rem] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm">
                                                        {selectedSubmission.status === 'graded' ? animatedScore : '-'}
                                                    </span>
                                                    <span className="text-sm font-black text-indigo-300/80 mb-2 tracking-widest uppercase">
                                                        / {selectedAssignment?.maxMarks} pts
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>

                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <Input label="Manual Override Score" type="number" value={selectedSubmission.marks}
                                            onChange={e => setSelectedSubmission({ ...selectedSubmission, marks: Number(e.target.value) })} />

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Feedback to Student</label>
                                            <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all outline-none min-h-[120px] text-sm"
                                                placeholder="Enter constructive feedback..."
                                                value={selectedSubmission.feedback}
                                                onChange={e => setSelectedSubmission({ ...selectedSubmission, feedback: e.target.value })}
                                            />
                                        </div>

                                        <Button className="w-full shadow-lg shadow-indigo-100" onClick={handleGradeOverride} icon={<Save className="w-4 h-4" />}
                                            disabled={selectedSubmission.marksLocked}
                                        >
                                            Publish Marks
                                        </Button>

                                        {/* Lock Marks Button */}
                                        {selectedSubmission.marksLocked ? (
                                            <div className="flex items-center gap-2 justify-center p-3 bg-red-50 rounded-2xl border border-red-100">
                                                <Lock className="w-4 h-4 text-red-500" />
                                                <span className="text-xs font-bold text-red-600">Marks Locked — HOD can unlock</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setLockConfirmOpen(true)}
                                                className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 rounded-2xl text-sm font-bold transition-all"
                                            >
                                                <Lock className="w-4 h-4" />
                                                Lock Marks
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lock Marks Confirmation Modal */}
            <ConfirmModal
                isOpen={lockConfirmOpen}
                title="Lock Marks?"
                message="Locking marks will prevent further edits and stop the student from resubmitting. Only the HOD can unlock marks after this action."
                confirmLabel="Yes, Lock Marks"
                isDanger={false}
                isLoading={isLocking}
                onConfirm={handleLockMarks}
                onCancel={() => setLockConfirmOpen(false)}
            />
        </div>
    );
};

export default Evaluation;
