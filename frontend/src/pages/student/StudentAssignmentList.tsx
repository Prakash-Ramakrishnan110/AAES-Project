import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useOutletContext, Link } from 'react-router-dom';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import { ArrowRight, FileText, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import ListItem from '../../components/ui/ListItem';
import SectionCard from '../../components/ui/SectionCard';
import ReEvaluationModal from '../../components/modals/ReEvaluationModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentAssignmentList = () => {
    const { token } = useContext(AuthContext)!;
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubForReEval, setSelectedSubForReEval] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [assRes, subRes] = await Promise.all([
                axios.get(`${API}/api/assignments/student`, config),
                axios.get(`${API}/api/submissions/my`, config)
            ]);
            setAssignments(assRes.data);
            setSubmissions(subRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    useEffect(() => {
        setHeaderOptions({
            title: 'Academic Workloads',
            subtitle: (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md border border-slate-200">Institutional Curriculum</span>
                </div>
            ),
            actions: (
                <button 
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Sync Workloads
                </button>
            )
        });
    }, [setHeaderOptions, loading]);

    if (loading) return (
        <div className="flex justify-center items-center min-vh-50">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10 pb-12 bg-transparent font-sans">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <SectionCard 
                    title="Active Workload" 
                    subtitle="Monitor your academic progress and pending submissions"
                    icon={<FileText className="w-5 h-5" />}
                    className="mt-6"
                >
                    <div className="divide-y divide-slate-100 -mx-8 -my-8">
                        {assignments.length === 0 ? (
                            <div className="text-center py-20 opacity-40">
                                <FileText className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-base font-bold text-slate-900">No Assignments Detected</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Your academic queue is currently synchronized and clear.</p>
                            </div>
                        ) : assignments.map(ass => {
                            const sub = submissions.find(s => s.assignment?._id === ass._id || s.assignment === ass._id);
                            return (
                                <ListItem
                                    key={ass._id}
                                    title={ass.title}
                                    subtitle={`${ass.subject?.name || 'Academic Domain'} • ${ass.subject?.code || 'CORE'}`}
                                    badges={[
                                        { 
                                            label: (sub ? sub.status : 'Awaiting').toUpperCase(),
                                            variant: sub?.status === 'graded' ? 'success' : sub?.status === 'submitted' ? 'info' : 'warning'
                                        }
                                    ]}
                                    description={
                                        <div className="flex flex-wrap items-center gap-4 mt-2">
                                            <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-md border border-slate-200">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                                    Deadline: {new Date(ass.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            {sub?.status === 'graded' && (
                                                <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 rounded-md border border-emerald-200">
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                                        Evaluation: {sub.marks} / {ass.maxMarks}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    }
                                    actions={
                                        <div className="flex items-center gap-3">
                                            {sub?.status === 'graded' && (
                                                <button
                                                    onClick={() => setSelectedSubForReEval({ ...sub, assignment: ass })}
                                                    className="px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors border border-amber-200 shadow-sm"
                                                >
                                                    Audit Request
                                                </button>
                                            )}
                                            <Link
                                                to={`/student/assignments/${ass._id}`}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-slate-800 transition-colors shadow-sm group/btn"
                                            >
                                                View <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    }
                                />
                            );
                        })}
                    </div>
                </SectionCard>
            </div>

            {selectedSubForReEval && (
                <ReEvaluationModal
                    isOpen={!!selectedSubForReEval}
                    onClose={() => setSelectedSubForReEval(null)}
                    submission={selectedSubForReEval}
                />
            )}
        </div>
    );
};

export default StudentAssignmentList;
