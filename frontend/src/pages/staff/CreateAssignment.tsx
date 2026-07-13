import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    ArrowLeft, ArrowRight, Check, BookOpen,
    Sparkles, Tag, List, Eye, Plus, Trash2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const steps = [
    { id: 1, label: 'Info', icon: <BookOpen size={16} />, desc: 'Basic details' },
    { id: 2, label: 'Type', icon: <Tag size={16} />, desc: 'Assignment type' },
    { id: 3, label: 'Questions', icon: <List size={16} />, desc: 'Add questions' },
    { id: 4, label: 'Preview', icon: <Eye size={16} />, desc: 'Review & publish' },
];

const CreateAssignment = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const toast = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const cfg = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API}/api/subjects/staff`, cfg);
                setSubjects(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to load subjects:', err);
            } finally {
                setLoadingSubjects(false);
            }
        };
        if (token) fetchSubjects();
    }, [token]);

    // Step 1 data
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [maxMarks, setMaxMarks] = useState('100');
    const [subjectId, setSubjectId] = useState('');

    // Step 2 data
    const [assignmentType, setAssignmentType] = useState<'text' | 'file' | 'both'>('text');

    // Step 3 data
    const [questions, setQuestions] = useState<{ text: string; marks: number }[]>([
        { text: '', marks: 10 }
    ]);

    const addQuestion = () => setQuestions([...questions, { text: '', marks: 10 }]);
    const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));
    const updateQuestion = (idx: number, field: 'text' | 'marks', value: string | number) => {
        const updated = [...questions];
        updated[idx] = { ...updated[idx], [field]: value };
        setQuestions(updated);
    };

    const canNext = () => {
        if (currentStep === 1) return title && deadline && subjectId;
        if (currentStep === 2) return assignmentType;
        if (currentStep === 3) return questions.every(q => q.text.trim());
        return true;
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await axios.post(`${API}/api/assignments`, {
                title,
                description,
                submissionDeadline: deadline,
                maxMarks: Number(maxMarks),
                subjectId,
                submissionType: assignmentType,
                questions: questions.map((q, i) => ({ 
                    questionNumber: i + 1, 
                    text: q.text,
                    marks: q.marks 
                }))
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success('Assignment created successfully!');
            navigate('/staff/assignments');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create assignment.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2">
                    <ArrowLeft size={16} />
                </Button>
                <div>
                    <h1 className="text-xl font-semibold text-text">Create Assignment</h1>
                    <p className="text-[13px] text-text-muted mt-1">Configure a new assessment for your students.</p>
                </div>
            </div>

            {/* Stepper Header */}
            <Card className="flex items-center p-2 gap-2 overflow-x-auto">
                {steps.map((step, idx) => {
                    const isDone = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    return (
                        <div key={step.id} className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`
                                flex items-center gap-3 px-3 py-2 rounded transition-all flex-1 cursor-pointer
                                ${isActive ? 'bg-primary/10 text-primary font-medium' : isDone ? 'text-success' : 'text-text-muted'}
                            `}
                                onClick={() => isDone && setCurrentStep(step.id)}
                            >
                                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 text-[12px]">
                                    {isDone ? <Check size={16} /> : step.id}
                                </div>
                                <div className="hidden sm:block">
                                    <p className={`text-[13px] ${isActive ? 'font-semibold' : ''}`}>{step.label}</p>
                                </div>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`h-px w-6 flex-shrink-0 mx-1 transition-colors ${currentStep > step.id ? 'bg-success' : 'bg-border'}`} />
                            )}
                        </div>
                    );
                })}
            </Card>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Step 1: Info */}
                    {currentStep === 1 && (
                        <Card>
                            <h3 className="text-[14px] font-semibold text-text mb-6">Assignment Details</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[12px] font-semibold text-text-muted mb-1.5 block">Title *</label>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Data Structures Assignment 3" className="w-full" />
                                </div>
                                 <div>
                                    <label className="text-[12px] font-semibold text-text-muted mb-1.5 block">Subject *</label>
                                    <div className="relative">
                                        <select 
                                            value={subjectId} 
                                            onChange={e => setSubjectId(e.target.value)}
                                            className="w-full h-10 px-3 bg-background border border-border rounded text-[13px] font-medium text-text focus:outline-none focus:border-primary appearance-none transition-all"
                                        >
                                            <option value="">{loadingSubjects ? 'Loading subjects...' : 'Select a subject'}</option>
                                            {subjects.map(s => (
                                                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                                            ))}
                                        </select>
                                        <ArrowRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-text-muted pointer-events-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[12px] font-semibold text-text-muted mb-1.5 block">Deadline *</label>
                                        <Input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full" />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-semibold text-text-muted mb-1.5 block">Max Marks</label>
                                        <Input type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} className="w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[12px] font-semibold text-text-muted mb-1.5 block">Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Instructions, rubrics, and requirements..." className="w-full px-3 py-2 bg-background border border-border rounded text-[13px] font-medium text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-y" />
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Step 2: Type */}
                    {currentStep === 2 && (
                        <Card>
                            <h3 className="text-[14px] font-semibold text-text mb-6">Submission Type</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(['text', 'file', 'both'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setAssignmentType(type)}
                                        className={`p-5 rounded border transition-all text-left ${assignmentType === type ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-text-muted/30'}`}
                                    >
                                        <div className={`w-10 h-10 rounded flex items-center justify-center text-lg font-semibold mb-4 ${assignmentType === type ? 'bg-primary text-white' : 'bg-surface text-text-muted'}`}>
                                            {type === 'text' ? 'T' : type === 'file' ? 'F' : 'B'}
                                        </div>
                                        <p className={`text-[13px] font-semibold mb-1 ${assignmentType === type ? 'text-primary' : 'text-text'}`}>{type === 'both' ? 'Text + File' : type}</p>
                                        <p className="text-[12px] text-text-muted">
                                            {type === 'text' && "Typed text answers."}
                                            {type === 'file' && "Upload scanned documents."}
                                            {type === 'both' && "Both text and file."}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Step 3: Questions */}
                    {currentStep === 3 && (
                        <Card>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[14px] font-semibold text-text">Add Questions</h3>
                                <Button variant="outline" size="sm"  onClick={addQuestion}>
  <Plus size={14} className="mr-2" /> Add Question
</Button>
                            </div>
                            <div className="space-y-3">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="p-4 bg-background border border-border rounded flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        <div className="w-6 h-6 rounded bg-surface flex items-center justify-center text-[12px] font-semibold flex-shrink-0 text-text-muted">{idx + 1}</div>
                                        <div className="flex-1 w-full space-y-2 md:space-y-0 md:flex md:gap-4 md:items-center">
                                            <Input
                                                value={q.text}
                                                onChange={e => updateQuestion(idx, 'text', e.target.value)}
                                                placeholder={`Question ${idx + 1}...`}
                                                className="w-full md:flex-1"
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] text-text-muted whitespace-nowrap">Marks:</span>
                                                <Input
                                                    type="number"
                                                    value={q.marks}
                                                    onChange={e => updateQuestion(idx, 'marks', Number(e.target.value))}
                                                    className="w-20 text-center"
                                                />
                                            </div>
                                        </div>
                                        {questions.length > 1 && (
                                            <button onClick={() => removeQuestion(idx)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-all self-end md:self-auto">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Step 4: Preview */}
                    {currentStep === 4 && (
                        <Card>
                            <h3 className="text-[14px] font-semibold text-text mb-6">Preview & Publish</h3>
                            <div className="space-y-6">
                                <div className="p-5 bg-background border border-border rounded space-y-3">
                                    <h4 className="text-[16px] font-semibold text-text">{title || 'Untitled Assignment'}</h4>
                                    <div className="flex gap-4 flex-wrap text-[12px] text-text-muted">
                                        <span>Deadline: {deadline ? new Date(deadline).toLocaleDateString() : 'Not set'}</span>
                                        <span>•</span>
                                        <span>Max Marks: {maxMarks}</span>
                                        <span>•</span>
                                        <span>Type: {assignmentType}</span>
                                    </div>
                                    {description && <p className="text-[13px] text-text mt-2">{description}</p>}
                                </div>

                                <div className="space-y-2">
                                    <h5 className="text-[12px] font-semibold text-text-muted mb-2">Questions ({questions.length})</h5>
                                    {questions.map((q, idx) => (
                                        <div key={idx} className="flex gap-3 p-3 bg-surface rounded">
                                            <div className="text-[12px] font-semibold text-text-muted w-5">{idx + 1}.</div>
                                            <div className="flex-1 flex justify-between gap-4 text-[13px]">
                                                <p className="text-text">{q.text}</p>
                                                <p className="font-semibold text-text-muted whitespace-nowrap">{q.marks} pts</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded border border-primary/20 text-primary">
                                    <Sparkles size={20} />
                                    <div>
                                        <p className="text-[13px] font-semibold">AI Evaluation Ready</p>
                                        <p className="text-[12px] opacity-80 mt-0.5">Submissions will be automatically evaluated.</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft size={16} className="mr-2" /> Back
                </Button>

                {currentStep < 4 ? (
                    <Button
                        onClick={() => setCurrentStep(s => Math.min(4, s + 1))}
                        disabled={!canNext()}
                    >
                        Continue <ArrowRight size={16} className="ml-2" />
                    </Button>
                ) : (
                    <Button
                        loading={isLoading}
                        
                        onClick={handleSubmit}
                        
                    >
  <Check size={16} className="mr-2" /> Publish Assignment
</Button>
                )}
            </div>
        </div>
    );
};

export default CreateAssignment;

