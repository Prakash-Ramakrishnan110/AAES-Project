import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    Trash2, BookOpen, Clock, ChevronRight, ChevronLeft, Bot,
    Save, Eye, Library, FileEdit, CheckCircle, AlertCircle, X, Download, Settings, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

// Builders
import BaseConfig from '../../components/assignments/BaseConfig';
import HandwrittenBuilder from '../../components/assignments/HandwrittenBuilder';
import DocumentBuilder from '../../components/assignments/DocumentBuilder';
import PPTBuilder from '../../components/assignments/PPTBuilder';
import QuizBuilder from '../../components/assignments/QuizBuilder';
import ProgrammingBuilder from '../../components/assignments/ProgrammingBuilder';
import SeminarBuilder from '../../components/assignments/SeminarBuilder';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ML_API = 'http://localhost:8000';

interface Subject {
    _id: string;
    name: string;
    code: string;
    department: string;
    academicYear: string;
    semester: string;
}

const UnifiedAssignments = () => {
    const { user, token } = useContext(AuthContext)!;
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
    const [selectedAssignmentGradebook, setSelectedAssignmentGradebook] = useState<any | null>(null);
    const [gradebookData, setGradebookData] = useState<any[]>([]);
    const [isGradebookLoading, setIsGradebookLoading] = useState(false);
    const [mySubjects, setMySubjects] = useState<Subject[]>([]);
    const [toast, setToast] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        deadline: '',
        submissionsEnabled: true
    });

    const [activeTab, setActiveTab] = useState<'publish' | 'reevaluation'>('publish');
    const [reEvalRequests, setReEvalRequests] = useState<any[]>([]);
    const [reEvalCount, setReEvalCount] = useState(0);
    const [isReEvalLoading, setIsReEvalLoading] = useState(false);

    // Re-evaluation Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewingRequest, setReviewingRequest] = useState<any>(null);
    const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected' | null>(null);
    const [reviewFormData, setReviewFormData] = useState({ updatedScore: 0, comment: '' });

    // Form Data
    const [formData, setFormData] = useState({
        // Step 1: Context
        department: '',
        academicYear: '',
        semester: '',

        // Step 2: Config
        title: '',
        description: '',
        subjectId: '',
        section: 'All',
        maxMarks: 10,
        deadline: '',
        submissionType: 'Handwritten', // Handwritten / Document / PPT / Quiz / Programming / Seminar

        // Format Specific Configs
        quizConfig: {
            timeLimitMinutes: 60,
            randomizeQuestions: false,
            attemptsAllowed: 1
        },
        quizRubric: {
            accuracyMarks: 60,
            conceptMarks: 30,
            completionMarks: 10
        },
        programmingConfig: {
            problemStatement: '',
            inputFormat: '',
            outputFormat: '',
            sampleInput: '',
            sampleOutput: '',
            timeLimit: 2,
            allowedLanguages: ['python', 'c', 'java'],
            language: 'python'
        },
        seminarConfig: {
            presentationDate: '',
            isGroup: false,
            rubric: {
                topicSelectionMarks: 15,
                technicalContentMarks: 25,
                presentationSkillsMarks: 20,
                visualQualityMarks: 15,
                timeManagementMarks: 10,
                responseToQuestionsMarks: 15
            }
        },
        assignmentRubric: {
            understandingMarks: 25,
            contentMarks: 25,
            organizationMarks: 20,
            presentationMarks: 15,
            originalityMarks: 15
        },
        pptConfig: {
            topicDescription: '',
            minSlides: 10,
            rubric: {
                contentMarks: 25,
                designMarks: 25,
                explanationMarks: 25,
                qaMarks: 25
            }
        },

        // Questions / Content
        questions: [] as any[],
        testCases: [] as any[],
        modelAnswer: '',

        // Step 3: Question Mode (Used by AI helper)
        creationMode: 'manual', // manual / ai
        aiConfig: {
            units: '',
            difficulty: 'Medium',
            markSplit: 'Equal',
            questionCount: 5,
            keywords: '',
            slideCount: 10
        },

        // Rules
        rules: {
            lateAllowed: false,
            resubmissionAllowed: false,
            latePenalty: 10
        }
    });

    const fetchGradebook = async (id: string) => {
        setIsGradebookLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API}/api/assignments/${id}/gradebook`, config);
            setGradebookData(res.data.gradebook);
            setSelectedAssignmentGradebook({ ...res.data, id });
        } catch (error) {
            showToast('Error fetching gradebook', 'error');
        } finally {
            setIsGradebookLoading(false);
        }
    };

    const fetchReEvaluationRequests = async () => {
        setIsReEvalLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API}/api/re-evaluation`, config);
            setReEvalRequests(res.data);
            // Update re-evaluation count for badge
            const pendingCount = res.data.filter((r: any) => r.status === 'Pending').length;
            setReEvalCount(pendingCount);
        } catch (error) {
            console.error('Error fetching re-evaluations:', error);
        } finally {
            setIsReEvalLoading(false);
        }
    };

    const handleUpdateReEval = async (id: string, status: 'Approved' | 'Rejected', updatedScore?: number, comment?: string) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/re-evaluation/${id}`, {
                status,
                updatedScore,
                reviewerComment: comment
            }, config);
            showToast(`Request ${status.toLowerCase()} successfully`, 'success');
            fetchReEvaluationRequests();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error updating request', 'error');
        }
    };

    const handleExportAdvanced = (type: 'excel' | 'pdf') => {
        if (!selectedAssignmentGradebook || !gradebookData.length) return;

        const fileName = `${selectedAssignmentGradebook.assignmentTitle.replace(/\s+/g, '_')}_Gradebook`;
        const title = `${selectedAssignmentGradebook.assignmentTitle} - Gradebook`;

        const dataToExport = gradebookData.map(row => ({
            'Student Name': row.fullName,
            'Register Number': row.registerNumber,
            'Section': row.section,
            'Status': row.status,
            'Marks': row.marks,
            'Submitted At': row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '—'
        }));

        if (type === 'excel') {
            exportToExcel(dataToExport, fileName);
        } else {
            const columns = [
                { header: 'Student Name', dataKey: 'Student Name' },
                { header: 'Reg No', dataKey: 'Register Number' },
                { header: 'Sec', dataKey: 'Section' },
                { header: 'Status', dataKey: 'Status' },
                { header: 'Marks', dataKey: 'Marks' },
                { header: 'Submitted At', dataKey: 'Submitted At' }
            ];
            exportToPDF(columns, dataToExport, fileName, title);
        }
    };

    const fetchMySubjects = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/subjects?staffId=${user?._id || user?.id}`, config);
            setMySubjects(data);
        } catch { /* error handled in console or ignored for quiet load */ }
    }, [token, user?._id, user?.id]);

    const fetchRecentAssignments = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/assignments/my-created`, config);
            setRecentAssignments(Array.isArray(data) ? data : []);
        } catch { /* error handled in console or ignored for quiet load */ }
    }, [token]);

    useEffect(() => {
        fetchMySubjects();
        fetchRecentAssignments();
        fetchReEvaluationRequests();
    }, [fetchMySubjects, fetchRecentAssignments]);

    // Proportional Rubric Scaling Logic
    useEffect(() => {
        const mm = formData.maxMarks || 0;
        if (mm <= 0) return;

        setFormData(prev => {
            // Calculate current rubric totals to check if scaling is needed 
            // (prevents infinite loops if some field updates)
            const arTotal = (prev.assignmentRubric?.understandingMarks || 0) +
                (prev.assignmentRubric?.contentMarks || 0) +
                (prev.assignmentRubric?.organizationMarks || 0) +
                (prev.assignmentRubric?.presentationMarks || 0) +
                (prev.assignmentRubric?.originalityMarks || 0);

            if (arTotal === mm) return prev; // Already scaled

            const updates: any = {};

            // 1. Assignment Rubric (25, 25, 20, 15, 15 %)
            const ar_u = Math.round(mm * 0.25);
            const ar_c = Math.round(mm * 0.25);
            const ar_o = Math.round(mm * 0.20);
            const ar_p = Math.round(mm * 0.15);
            updates.assignmentRubric = {
                understandingMarks: ar_u,
                contentMarks: ar_c,
                organizationMarks: ar_o,
                presentationMarks: ar_p,
                originalityMarks: Math.max(0, mm - (ar_u + ar_c + ar_o + ar_p))
            };

            // 2. Seminar Rubric (15, 25, 20, 15, 10, 15 %)
            const s_1 = Math.round(mm * 0.15);
            const s_2 = Math.round(mm * 0.25);
            const s_3 = Math.round(mm * 0.20);
            const s_4 = Math.round(mm * 0.15);
            const s_5 = Math.round(mm * 0.10);
            updates.seminarConfig = {
                ...prev.seminarConfig,
                rubric: {
                    topicSelectionMarks: s_1,
                    technicalContentMarks: s_2,
                    presentationSkillsMarks: s_3,
                    visualQualityMarks: s_4,
                    timeManagementMarks: s_5,
                    responseToQuestionsMarks: Math.max(0, mm - (s_1 + s_2 + s_3 + s_4 + s_5))
                }
            };

            // 3. Quiz Rubric (60, 30, 10 %)
            const q_1 = Math.round(mm * 0.60);
            const q_2 = Math.round(mm * 0.30);
            updates.quizRubric = {
                accuracyMarks: q_1,
                conceptMarks: q_2,
                completionMarks: Math.max(0, mm - (q_1 + q_2))
            };

            // 4. PPT Rubric (25, 25, 25, 25 %)
            const p_1 = Math.round(mm * 0.25);
            const p_2 = Math.round(mm * 0.25);
            const p_3 = Math.round(mm * 0.25);
            updates.pptConfig = {
                ...prev.pptConfig,
                rubric: {
                    contentMarks: p_1,
                    designMarks: p_2,
                    explanationMarks: p_3,
                    qaMarks: Math.max(0, mm - (p_1 + p_2 + p_3))
                }
            };

            return { ...prev, ...updates };
        });
    }, [formData.maxMarks]);

    const showToast = (text: string, type: 'success' | 'error') => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 5000);
    };



    const handleNext = () => setStep(s => Math.min(s + 1, 5));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const handleAIGenerate = async () => {
        setIsLoading(true);
        try {
            const subType = formData.submissionType as string;
            const basePayload = {
                department: formData.department,
                semester: formData.semester,
                subject: mySubjects.find(s => s._id === formData.subjectId)?.name || '',
                topic: formData.aiConfig.units,
            };

            let endpoint = `${ML_API}/generate/assignment`;
            let payload: any = {};

            const getRelevantRubric = () => {
                if (subType === 'Quiz') return formData.quizRubric;
                if (subType === 'Seminar') return formData.seminarConfig.rubric;
                if (subType === 'PPT') return formData.pptConfig.rubric;
                return formData.assignmentRubric;
            };

            if (subType === 'Quiz') {
                endpoint = `${ML_API}/generate/quiz`;
                payload = {
                    ...basePayload,
                    count: formData.aiConfig.questionCount,
                    type: 'MCQ',
                    rubric: getRelevantRubric()
                };
            } else if (subType === 'PPT') {
                endpoint = `${ML_API}/generate/ppt`;
                payload = {
                    ...basePayload,
                    slide_count: formData.aiConfig.slideCount,
                    level: formData.aiConfig.difficulty,
                    rubric: getRelevantRubric()
                };
            } else {
                let requestType = 'Theory';
                if (subType === 'Programming') {
                    requestType = formData.programmingConfig?.language || 'Python';
                } else if (subType === 'Seminar') {
                    requestType = 'Seminar';
                }

                payload = {
                    ...basePayload,
                    academic_year: formData.academicYear,
                    type: requestType,
                    difficulty: formData.aiConfig.difficulty,
                    marks: formData.maxMarks,
                    keywords: formData.aiConfig.keywords,
                    question_count: formData.aiConfig.questionCount,
                    rubric: getRelevantRubric()
                };
            }

            const res = await axios.post(endpoint, payload);
            if (res.data.error) throw new Error(res.data.error);

            // Format handling based on what each endpoint returns
            if (subType === 'Quiz') {
                // Returns { questions: [{question, options, correct_answer, explanation}] }
                const qCount = res.data.questions?.length || 1;
                const baseMarks = Math.floor(formData.maxMarks / qCount);
                const remainder = formData.maxMarks % qCount;

                const formattedQs = (res.data.questions || []).map((q: any, idx: number) => ({
                    questionText: q.question || 'Untitled Question',
                    questionType: 'MCQ',
                    options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctAnswer: q.correct_answer || q.correctAnswer || '',
                    marks: baseMarks + (idx < remainder ? 1 : 0)
                }));
                setFormData({ ...formData, questions: formattedQs });
            } else if (subType === 'Programming') {
                // Returns problem_statement, constraints, sample_input, sample_output
                setFormData({
                    ...formData,
                    programmingConfig: {
                        ...formData.programmingConfig,
                        problemStatement: res.data.problem_statement || res.data.description,
                        inputFormat: res.data.input_format || '',
                        outputFormat: res.data.output_format || '',
                        sampleInput: res.data.sample_input || '',
                        sampleOutput: res.data.sample_output || ''
                    }
                });
            } else {
                // Standard theory
                const qCount = res.data.questions?.length || 1;
                const baseMarks = Math.floor(formData.maxMarks / qCount);
                const remainder = formData.maxMarks % qCount;

                const formattedQs = (res.data.questions || []).map((q: any, idx: number) => {
                    const text = typeof q === 'string' ? q : (q.question || q.text || 'Untitled Question');
                    // Robustly strip prefixes like "1.", "1)", "Q1:", "Question 1:", etc.
                    const cleanText = String(text).replace(/^(\d+[.:)]|Q\d+[.:)]|Question\s*\d+[.:)])\s*/i, '').trim();
                    return {
                        questionText: cleanText,
                        marks: baseMarks + (idx < remainder ? 1 : 0),
                        modelAnswer: q.model_answer || q.modelAnswer || ''
                    };
                });

                if (formattedQs.length !== formData.aiConfig.questionCount) {
                    showToast(`AI generated ${formattedQs.length} items. Adjusted to match your request.`, 'success');
                }

                // Enforce count client-side
                const finalQs = formattedQs.slice(0, formData.aiConfig.questionCount);

                setFormData({ ...formData, questions: finalQs, title: res.data.title || formData.title });
            }

            showToast('Content generated by AI!', 'success');
        } catch (err: any) {
            console.error("AI Generation Error: ", err);
            const errMsg = err.response?.data?.error || err.response?.data?.detail;

            if (err.message === 'Network Error') {
                showToast('Python AI Service is currently offline (Port 8000).', 'error');
            } else if (errMsg) {
                showToast(`AI Error: ${errMsg}`, 'error');
            } else {
                showToast('AI response generation or parsing failed. Try again.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAssignment = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this assignment? This will also remove all student submissions.')) return;

        try {
            console.log("Preparing to delete assignment:", id);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.delete(`${API}/api/assignments/${id}`, config);
            console.log("Delete Response:", response.data);
            showToast('Assignment deleted successfully', 'success');
            fetchRecentAssignments();
        } catch (error: any) {
            console.error('Delete Assignment Error:', error.response?.data || error.message);
            showToast(error.response?.data?.message || 'Error deleting assignment', 'error');
        }
    };

    const handleOpenEditModal = (ass: any) => {
        setEditingAssignment(ass);

        // Format the ISO UTC date into local YYYY-MM-DDThh:mm
        let localDeadline = '';
        if (ass.deadline) {
            const d = new Date(ass.deadline);
            const pad = (n: number) => n.toString().padStart(2, '0');
            localDeadline = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }

        setEditFormData({
            deadline: localDeadline,
            submissionsEnabled: ass.submissionsEnabled !== undefined ? ass.submissionsEnabled : true
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingAssignment) return;
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/assignments/${editingAssignment._id}`, editFormData, config);
            showToast('Assignment settings updated successfully', 'success');
            setEditModalOpen(false);
            fetchRecentAssignments();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error updating assignment', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!formData.title || !formData.subjectId || !formData.deadline || !formData.maxMarks) {
            showToast('Please ensure Title, Subject, Deadline, and Marks are filled.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const subType = formData.submissionType;
            let formatConfig: any = {
                rules: formData.rules,
            };

            // Unified Structure based on type
            if (subType === 'Handwritten' || subType === 'Document') {
                formatConfig = {
                    ...formatConfig,
                    questions: formData.questions,
                    rubric: formData.assignmentRubric,
                    allowedFormats: subType === 'Handwritten' ? ["jpg", "png", "pdf"] : ["doc", "docx", "pdf"]
                };
            } else if (subType === 'Quiz') {
                formatConfig = {
                    ...formatConfig,
                    timeLimit: formData.quizConfig.timeLimitMinutes,
                    attemptsAllowed: formData.quizConfig.attemptsAllowed,
                    randomize: formData.quizConfig.randomizeQuestions,
                    questions: formData.questions,
                    rubric: formData.quizRubric
                };
            } else if (subType === 'Programming') {
                formatConfig = {
                    ...formatConfig,
                    ...formData.programmingConfig,
                    testCases: formData.testCases
                };
            } else if (subType === 'Seminar') {
                formatConfig = {
                    ...formatConfig,
                    ...formData.seminarConfig
                };
            } else if (subType === 'PPT') {
                formatConfig = {
                    ...formatConfig,
                    ...formData.pptConfig
                };
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                subjectId: formData.subjectId,
                section: formData.section,
                maxMarks: formData.maxMarks,
                deadline: formData.deadline,
                submissionType: subType.toLowerCase(),
                department: formData.department,
                semester: formData.semester,
                questions: (formData.questions || []).map((q: any) => ({
                    ...q,
                    text: q.text || q.questionText || q.question || 'Untitled Question',
                    questionText: q.questionText || q.text || q.question || 'Untitled Question',
                    marks: q.marks || 0
                })),
                formatConfig
            };

            await axios.post(`${API}/api/assignments`, payload, config);
            showToast('Assignment published successfully!', 'success');
            setStep(1);
            fetchRecentAssignments();
            // Reset form
            setFormData({
                ...formData,
                title: '',
                description: '',
                questions: [],
                testCases: [],
                subjectId: '',
                section: 'All'
            });
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error publishing assignment', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Toast — large & prominent */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -60, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -40, x: '-50%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed top-6 left-1/2 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border text-sm font-bold min-w-[320px] max-w-md"
                        style={{
                            background: toast.type === 'success' ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)',
                            borderColor: toast.type === 'success' ? '#86efac' : '#fca5a5',
                            color: toast.type === 'success' ? '#15803d' : '#dc2626',
                            boxShadow: toast.type === 'success' ? '0 8px 32px rgba(34,197,94,0.3)' : '0 8px 32px rgba(239,68,68,0.3)'
                        }}
                    >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex-1">
                            <p className="font-extrabold text-base">{toast.type === 'success' ? 'Success!' : 'Error'}</p>
                            <p className="font-medium text-sm opacity-80">{toast.text}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="opacity-40 hover:opacity-100 ml-2">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assignment Management</h1>
                    <p className="text-gray-500 text-sm">Create unified academic assessments with integrated AI assistance.</p>
                </div>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                    ))}
                </div>
            </div>

            <div className="flex border-b border-gray-200 gap-8 mb-2">
                <button
                    onClick={() => setActiveTab('publish')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'publish' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
                >
                    Create & Manage
                </button>
                <button
                    onClick={() => {
                        setActiveTab('reevaluation');
                        fetchReEvaluationRequests();
                    }}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'reevaluation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
                >
                    Re-evaluation Requests
                    {reEvalCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm shadow-red-200">
                            {reEvalCount}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === 'publish' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Wizard */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="min-h-[500px] flex flex-col">
                            <div className="flex-1">
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><BookOpen className="w-5 h-5" /></div>
                                                <h2 className="text-lg font-bold text-gray-800">Step 1: Select Subject & Context</h2>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Select Subject</label>
                                                    <select
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all outline-none"
                                                        value={formData.subjectId}
                                                        onChange={e => {
                                                            const sub = mySubjects.find(s => s._id === e.target.value);
                                                            setFormData({
                                                                ...formData,
                                                                subjectId: e.target.value,
                                                                department: sub?.department || '',
                                                                academicYear: sub?.academicYear || '',
                                                                semester: sub?.semester || ''
                                                            });
                                                        }}
                                                    >
                                                        <option value="">Select a subject...</option>
                                                        {mySubjects.map(sub => (
                                                            <option key={sub._id} value={sub._id}>
                                                                {sub.name} ({sub.code}) - {sub.department} [Sem {sub.semester}]
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <p className="mt-2 text-xs text-gray-500 ml-1 italic">
                                                        Note: Academic context (Dept, Year, Sem) is automatically derived from the selected subject.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="opacity-75">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Department</label>
                                                        <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 text-sm">
                                                            {formData.department || '—'}
                                                        </div>
                                                    </div>
                                                    <div className="opacity-75">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Academic Year</label>
                                                        <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 text-sm">
                                                            {formData.academicYear || '—'}
                                                        </div>
                                                    </div>
                                                    <div className="opacity-75">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Semester</label>
                                                        <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 text-sm">
                                                            {formData.semester || '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                            <BaseConfig formData={formData} setFormData={setFormData} mySubjects={mySubjects} />
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FileEdit className="w-5 h-5" /></div>
                                                    <h2 className="text-lg font-bold text-gray-800">Step 3: Build {formData.submissionType} Format</h2>
                                                </div>
                                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                                    <button onClick={() => setFormData({ ...formData, creationMode: 'manual' })}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.creationMode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Manual Builder</button>
                                                    <button onClick={() => setFormData({ ...formData, creationMode: 'ai' })}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.creationMode === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>AI Assistant</button>
                                                </div>
                                            </div>

                                            {formData.creationMode === 'ai' ? (
                                                <div className="space-y-6 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 mb-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <div className="lg:col-span-full">
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Topic / Keywords</label>
                                                            <Input placeholder="e.g. Binary Search Trees" value={formData.aiConfig.units} onChange={e => setFormData({ ...formData, aiConfig: { ...formData.aiConfig, units: e.target.value } })} />
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between items-center mb-1.5 ml-1">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase">Difficulty</label>
                                                                {formData.aiConfig.difficulty === 'Hard' && (
                                                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded animate-pulse">Advanced AI</span>
                                                                )}
                                                            </div>
                                                            <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white outline-none text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                                                                value={formData.aiConfig.difficulty} onChange={e => setFormData({ ...formData, aiConfig: { ...formData.aiConfig, difficulty: e.target.value } })}>
                                                                <option>Easy</option><option>Medium</option><option>Hard</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Question Count</label>
                                                            <Input type="number" min="1" max="20" value={formData.aiConfig.questionCount} onChange={e => setFormData({ ...formData, aiConfig: { ...formData.aiConfig, questionCount: Number(e.target.value) } })} />
                                                        </div>
                                                        <div className="flex items-end">
                                                            <Button className="w-full" onClick={handleAIGenerate} isLoading={isLoading}>
                                                                <Bot className="w-4 h-4 mr-2" />
                                                                Generate
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {formData.submissionType === 'Handwritten' && <HandwrittenBuilder formData={formData} setFormData={setFormData} />}
                                                    {formData.submissionType === 'Document' && <DocumentBuilder formData={formData} setFormData={setFormData} />}
                                                    {formData.submissionType === 'PPT' && <PPTBuilder formData={formData} setFormData={setFormData} />}
                                                    {formData.submissionType === 'Quiz' && <QuizBuilder formData={formData} setFormData={setFormData} />}
                                                    {formData.submissionType === 'Programming' && <ProgrammingBuilder formData={formData} setFormData={setFormData} />}
                                                    {formData.submissionType === 'Seminar' && <SeminarBuilder formData={formData} setFormData={setFormData} />}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {step === 4 && (
                                        <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Eye className="w-5 h-5" /></div>
                                                <h2 className="text-lg font-bold text-gray-800">Step 5: Preview & Publish</h2>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900">{formData.title || 'Untitled Assignment'}</h3>
                                                        <p className="text-sm text-indigo-600 font-medium">{mySubjects.find(s => s._id === formData.subjectId)?.name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-gray-900">{formData.maxMarks}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Points</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-y border-gray-200/50">
                                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Type</p><p className="text-sm font-semibold text-gray-700">{formData.submissionType}</p></div>
                                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Due Date</p><p className="text-sm font-semibold text-gray-700">{formData.deadline}</p></div>
                                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Late Policy</p><p className="text-sm font-semibold text-gray-700">{formData.rules.lateAllowed ? `${formData.rules.latePenalty}% Penalty` : 'No Late Sub.'}</p></div>
                                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Resubmission</p><p className="text-sm font-semibold text-gray-700">{formData.rules.resubmissionAllowed ? 'Allowed' : 'Not Allowed'}</p></div>
                                                    {formData.submissionType === 'Seminar' && (
                                                        <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Format</p><p className="text-sm font-semibold text-gray-700">{formData.seminarConfig.isGroup ? 'Group' : 'Indiv.'}</p></div>
                                                    )}

                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase underline decoration-indigo-200 underline-offset-4">Academic Review</p>
                                                    <div className="space-y-3">
                                                        {(formData.questions || []).map((q, i) => (
                                                            <div key={i} className="flex flex-col gap-1 text-sm text-gray-600">
                                                                <div className="flex gap-3">
                                                                    <span className="font-bold text-indigo-300">{i + 1}.</span>
                                                                    <p className="leading-relaxed">{typeof q === 'string' ? q : (q.questionText || q.question)}</p>
                                                                </div>
                                                                {formData.submissionType === 'Quiz' && q.options && (
                                                                    <div className="pl-6 pt-1 space-y-1">
                                                                        {q.options.map((opt: string, idx: number) => (
                                                                            <div key={idx} className={`text-xs px-2 py-1 rounded-md inline-block w-full border ${q.correctAnswer === opt || (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt)) ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                                                                {String.fromCharCode(65 + idx)}. {opt}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {formData.submissionType === 'Programming' && (
                                                            <div className="text-sm text-gray-600 italic">
                                                                Programming problem details and {formData.testCases?.length || 0} test cases configured.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div >

                            {/* Navigation Buttons */}
                            <div className="pt-8 flex justify-between border-t border-gray-100 mt-auto" >
                                <Button variant="outline" onClick={handlePrev} disabled={step === 1}>
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>
                                {
                                    step < 4 ? (
                                        <Button onClick={handleNext} disabled={!formData.subjectId && step === 1}>
                                            Next Step
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button onClick={handlePublish} isLoading={isLoading}>
                                            <Save className="w-4 h-4 mr-2" />
                                            Publish Now
                                        </Button>
                                    )
                                }
                            </div >
                        </Card >
                    </div >

                    {/* Sidebar: Recent Assignments */}
                    < div className="lg:col-span-1" >
                        <Card title="Recent Assignments" className="h-full">
                            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                {recentAssignments.length === 0 ? (
                                    <div className="text-center py-10 opacity-50"><Library className="w-10 h-10 mx-auto mb-2" /><p className="text-xs">No assignments yet</p></div>
                                ) : (
                                    recentAssignments.map(ass => (
                                        <div
                                            key={ass._id}
                                            onClick={() => fetchGradebook(ass._id)}
                                            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-200 transition-all group cursor-pointer shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{ass.title}</h4>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenEditModal(ass);
                                                        }}
                                                        className="text-gray-300 hover:text-indigo-600 p-1 rounded-md hover:bg-indigo-50"
                                                        title="Edit Settings"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAssignment(ass._id);
                                                        }}
                                                        className="text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50"
                                                        title="Delete Assignment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold mb-3">
                                                <div className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">{ass.type || ass.submissionType}</div>
                                                <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ass.deadline).toLocaleDateString()}</div>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${ass.submissionsEnabled !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className={ass.submissionsEnabled !== false ? 'text-gray-600' : 'text-red-500'}>
                                                        {ass.submissionsEnabled !== false ? 'Active' : 'Disabled'}
                                                    </span>
                                                </div>
                                                <span className="font-black text-gray-600">{ass.maxMarks} PTS</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <Card
                        title="Re-evaluation Requests"
                        action={
                            <button
                                onClick={fetchReEvaluationRequests}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-all"
                                title="Refresh"
                            >
                                <Zap className={`w-4 h-4 ${isReEvalLoading ? 'animate-spin' : ''}`} />
                            </button>
                        }
                    >
                        {isReEvalLoading ? (
                            <div className="py-20 text-center uppercase tracking-widest text-gray-400 font-bold animate-pulse">Loading requests...</div>
                        ) : reEvalRequests.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <AlertCircle className="w-12 h-12 text-gray-300" />
                                <div className="text-gray-400 font-medium">No re-evaluation requests found for your assigned subjects.</div>
                                <p className="text-xs text-gray-300 max-w-xs">Verify your subject assignments if you expect to see requests here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                                        <tr>
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4">Assignment</th>
                                            <th className="px-6 py-4">Original Score</th>
                                            <th className="px-6 py-4">Reason</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reEvalRequests.map((req) => (
                                            <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{req.student?.fullName || req.student?.username || 'Unknown Student'}</span>
                                                        <span className="text-[10px] text-gray-500">{req.student?.registerNumber || '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-700">{req.assignment?.title || 'Unknown Assignment'}</div>
                                                </td>
                                                <td className="px-6 py-4 font-black text-gray-900">{req.originalScore}</td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <p className="text-xs text-gray-600 italic line-clamp-2" title={req.reason}>"{req.reason}"</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {req.status === 'Pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setReviewingRequest(req);
                                                                    setReviewAction('Approved');
                                                                    setReviewFormData({ updatedScore: req.originalScore, comment: 'Score updated after review' });
                                                                    setReviewModalOpen(true);
                                                                }}
                                                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-green-700 transition"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setReviewingRequest(req);
                                                                    setReviewAction('Rejected');
                                                                    setReviewFormData({ updatedScore: req.originalScore, comment: '' });
                                                                    setReviewModalOpen(true);
                                                                }}
                                                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-red-700 transition"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            )}
            {/* Gradebook Modal */}
            <AnimatePresence>
                {selectedAssignmentGradebook && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedAssignmentGradebook(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h2 className="text-lg font-bold text-gray-900 truncate">{selectedAssignmentGradebook.assignmentTitle}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">Gradebook</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{gradebookData.length} Students Total</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleExportAdvanced('excel')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Excel
                                    </button>
                                    <button
                                        onClick={() => handleExportAdvanced('pdf')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => setSelectedAssignmentGradebook(null)}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {isGradebookLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading student data...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden border border-gray-100 rounded-2xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-3">Student</th>
                                                    <th className="px-6 py-3">Reg. Number</th>
                                                    <th className="px-6 py-3 text-center">Section</th>
                                                    <th className="px-6 py-3">Status</th>
                                                    <th className="px-6 py-3 text-right">Marks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {gradebookData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic text-sm">No students matched the assignment criteria.</td>
                                                    </tr>
                                                ) : (
                                                    gradebookData.map((row, i) => (
                                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors text-sm">
                                                            <td className="px-6 py-3 font-bold text-gray-900">{row.fullName}</td>
                                                            <td className="px-6 py-3 text-gray-500 font-mono text-xs">{row.registerNumber}</td>
                                                            <td className="px-6 py-3 text-center text-gray-400 font-bold uppercase text-[10px]">{row.section || '—'}</td>
                                                            <td className="px-6 py-3 text-xs">
                                                                <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter border
                                                                    ${row.status === 'graded'
                                                                        ? 'bg-green-50 border-green-100 text-green-600'
                                                                        : row.status === 'submitted'
                                                                            ? 'bg-blue-50 border-blue-100 text-blue-600'
                                                                            : 'bg-red-50 border-red-100 text-red-400'}`}>
                                                                    {row.status === 'pending' ? 'Not Submitted' : row.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-3 text-right">
                                                                <span className={`font-black ${row.marks !== null && row.marks >= 0 ? 'text-indigo-600' : 'text-gray-200'}`}>
                                                                    {row.marks !== null ? row.marks : '—'}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-300 ml-0.5">/{selectedAssignmentGradebook.maxMarks}</span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Settings Modal */}
            <AnimatePresence>
                {editModalOpen && editingAssignment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setEditModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-indigo-600" /> Edit Settings
                                </h3>
                                <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">{editingAssignment.title}</h4>
                                    <p className="text-xs text-gray-500">Update deadline or toggle submissions.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Extended Deadline</label>
                                    <Input
                                        type="datetime-local"
                                        value={editFormData.deadline}
                                        onChange={e => setEditFormData({ ...editFormData, deadline: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                                    <div>
                                        <label className="text-sm font-bold text-gray-800">Enable Submissions</label>
                                        <p className="text-[10px] text-gray-500">Allow students to submit work</p>
                                    </div>
                                    <button
                                        onClick={() => setEditFormData({ ...editFormData, submissionsEnabled: !editFormData.submissionsEnabled })}
                                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${editFormData.submissionsEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-transform ${editFormData.submissionsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleSaveEdit} isLoading={isLoading}>Save Changes</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Re-evaluation Review Modal */}
            <AnimatePresence>
                {reviewModalOpen && reviewingRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setReviewModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md overflow-hidden transform"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className={`text-xl font-bold ${reviewAction === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                                        {reviewAction === 'Approved' ? 'Approve Re-evaluation' : 'Reject Re-evaluation'}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{reviewingRequest.assignment?.title}</p>
                                </div>
                                <button onClick={() => setReviewModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Original Score:</span>
                                    <span className="text-gray-900 font-black text-lg">{reviewingRequest.originalScore}</span>
                                </div>

                                {reviewAction === 'Approved' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Manually Updated Score</label>
                                        <Input
                                            type="number"
                                            value={reviewFormData.updatedScore}
                                            onChange={e => setReviewFormData({ ...reviewFormData, updatedScore: Number(e.target.value) })}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Reviewer Comment / Feedback</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none text-sm"
                                        placeholder="Explain your decision..."
                                        value={reviewFormData.comment}
                                        onChange={e => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
                                    <Button
                                        className={`flex-1 ${reviewAction === 'Approved' ? '!bg-green-600 hover:!bg-green-700' : '!bg-red-600 hover:!bg-red-700'}`}
                                        onClick={() => {
                                            handleUpdateReEval(
                                                reviewingRequest._id,
                                                reviewAction!,
                                                reviewAction === 'Approved' ? reviewFormData.updatedScore : undefined,
                                                reviewFormData.comment
                                            );
                                            setReviewModalOpen(false);
                                        }}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default UnifiedAssignments;
