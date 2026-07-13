import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    FileText, Upload, CheckCircle, AlertCircle, 
    ArrowLeft, Send, Loader2, BookOpen
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../context/ToastContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Submission = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext)!;
    const toast = useToast();
    
    const [assignment, setAssignment] = useState<any>(null);
    const [submission, setSubmission] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id, token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [assRes, subRes] = await Promise.all([
                axios.get(`${API}/api/assignments/${id}`, config),
                axios.get(`${API}/api/submissions/my`, config)
            ]);
            
            setAssignment(assRes.data);
            const mySub = subRes.data.find((s: any) => s.assignmentId?._id === id || s.assignmentId === id);
            setSubmission(mySub);
        } catch (error) {
            toast.error('Error fetching assignment details.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file && !submission) {
            toast.error('Please select a file to upload.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('assignmentId', id!);
            if (file) formData.append('file', file);

            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };
            
            await axios.post(`${API}/api/submissions`, formData, config);
            toast.success('Assignment submitted successfully!');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-vh-60">
            <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
        </div>
    );

    const deadlinePassed = assignment && new Date(assignment.deadline) < new Date();

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2">
                        <ArrowLeft size={16} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold text-text">{assignment?.title}</h1>
                        <p className="text-[13px] text-text-muted mt-1">{assignment?.subjectId?.name || 'Department of Academics'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-3 py-1.5 h-auto flex flex-col items-center">
                        <span className="text-[10px] uppercase font-semibold text-text-muted">Deadline</span>
                        <span className={`text-[13px] font-medium ${deadlinePassed ? 'text-danger' : 'text-text'}`}>
                            {new Date(assignment?.deadline).toLocaleDateString()}
                        </span>
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card>
                        <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                            <BookOpen size={16} className="text-primary" />
                            <h3 className="text-[14px] font-medium text-text uppercase tracking-wider">Assignment Brief</h3>
                        </div>
                        <div className="space-y-4">
                            {assignment?.questions?.map((q: any, idx: number) => (
                                <div key={idx} className="p-4 bg-surface border border-border rounded">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge  className="text-[10px] px-1.5">QUESTION {idx + 1}</Badge>
                                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{q.marks} Marks</span>
                                    </div>
                                    <p className="text-[13px] text-text font-medium leading-relaxed">{q.question}</p>
                                </div>
                            )) || <p className="text-[13px] text-text-muted italic">Question details provided in the brief.</p>}
                        </div>
                    </Card>

                    {submission && (
                        <Card className={submission.status === 'graded' ? 'border-success/30 bg-success/5' : 'border-primary/20 bg-primary/5'}>
                            <div className="flex flex-col items-center text-center py-4">
                                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Evaluation Grade</p>
                                <div className="flex items-baseline justify-center gap-1.5 mb-4">
                                    <span className="text-4xl font-semibold text-text font-mono tracking-tighter">{submission.marks || 0}</span>
                                    <span className="text-sm font-semibold text-text-muted">/ {assignment?.totalMarks || assignment?.maxMarks}</span>
                                </div>
                                
                                {submission.status !== 'graded' && (
                                    <Badge variant="warning" className="animate-pulse">Awaiting Professor's Review</Badge>
                                )}

                                {submission.feedback && (
                                    <div className="mt-6 w-full pt-4 border-t border-border/50 text-left">
                                        <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">Professor's Feedback</h4>
                                        <div className="p-4 bg-background border border-border rounded text-[13px] text-text italic font-medium leading-relaxed">
                                            "{submission.feedback}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-4 lg:sticky lg:top-6">
                    <Card className="border-primary/20 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="flex items-center gap-2 text-primary pb-3 border-b border-border mb-2">
                                <Upload size={18} />
                                <h3 className="text-[14px] font-semibold uppercase tracking-wider">Submission Portal</h3>
                            </div>

                            {!submission || !deadlinePassed ? (
                                <div className="space-y-5">
                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            onChange={handleFileChange} 
                                            className="hidden" 
                                            id="file-upload" 
                                            accept="image/*,application/pdf"
                                        />
                                        <label 
                                            htmlFor="file-upload"
                                            className="block p-6 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all bg-surface"
                                        >
                                            <div className="w-10 h-10 bg-background border border-border rounded flex items-center justify-center mx-auto mb-3 text-text-muted group-hover:text-primary transition-all">
                                                <FileText size={18} />
                                            </div>
                                            <p className="text-[12px] font-semibold text-text-muted uppercase tracking-widest">
                                                {file ? file.name : "Select Script (JPG/PDF)"}
                                            </p>
                                        </label>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full h-11" 
                                        disabled={submitting || (!file && !submission)}
                                        loading={submitting}
                                        
                                    >
  <Send size={16} className="mr-2" /> {submission ? 'Update Submission' : 'Submit My Work'}
</Button>
                                    
                                    <div className="flex items-center gap-2 bg-primary/5 p-3 rounded border border-primary/20">
                                        <AlertCircle size={14} className="text-primary shrink-0" />
                                        <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                                            Handwritten responses are optimized for AI evaluation.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-danger/5 border border-danger/20 rounded text-center space-y-2">
                                    <AlertCircle size={24} className="text-danger mx-auto mb-1" />
                                    <h4 className="text-[13px] font-semibold text-danger uppercase tracking-wider">Submission Closed</h4>
                                    <p className="text-[11px] text-danger/80 font-medium">The deadline for this assignment has expired.</p>
                                </div>
                            )}

                            {submission && (
                                <div className="pt-4 border-t border-border flex flex-col items-center">
                                    <div className="flex items-center gap-2 text-success text-[10px] font-semibold uppercase tracking-widest">
                                        <CheckCircle size={14} /> Successfully Recorded
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-1 font-mono uppercase">ID: {submission._id.slice(-8).toUpperCase()}</p>
                                </div>
                            )}
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Submission;

