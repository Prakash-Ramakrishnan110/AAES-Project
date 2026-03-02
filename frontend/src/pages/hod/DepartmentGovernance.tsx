import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertOctagon,
    BarChart,
    ClipboardList,
    ChevronRight,
    CheckCircle,
    UserCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';

interface DeptSummary {
    totalClasses: number;
    totalStudents: number;
    totalMentors: number;
    totalCriticalStudents: number;
    activeEscalations: number;
}

interface Escalation {
    _id: string;
    student: {
        fullName: string;
        registerNumber: string;
        academicYear: string;
    };
    mentor: {
        fullName: string;
    };
    issueSummary: string;
    status: 'Open' | 'Under Review' | 'Closed';
    createdAt: string;
    hodDirectives: {
        note: string;
        date: string;
    }[];
}

interface MentorPerformance {
    mentorId: string;
    name: string;
    totalStudents: number;
    redStudents: number;
    interactionRate: number;
    escalations: number;
}

const DepartmentGovernance = () => {
    const { token } = useContext(AuthContext)!;
    const [summary, setSummary] = useState<DeptSummary | null>(null);
    const [escalations, setEscalations] = useState<Escalation[]>([]);
    const [mentorPerformance, setMentorPerformance] = useState<MentorPerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'escalations' | 'performance'>('escalations');

    // Directive Modal State
    const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
    const [directiveNote, setDirectiveNote] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchHODData();
    }, [token]);

    const fetchHODData = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/governance/hod/dashboard', config);
            setSummary(data.departmentSummary);
            setEscalations(data.escalations);
            setMentorPerformance(data.mentorPerformance);
        } catch (error) {
            console.error('Error fetching HOD governance data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateEscalation = async (status?: string) => {
        if (!selectedEscalation) return;
        setUpdating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/governance/hod/escalation/${selectedEscalation._id}`, {
                status: status || selectedEscalation.status,
                note: directiveNote
            }, config);

            setDirectiveNote('');
            setSelectedEscalation(null);
            fetchHODData();
        } catch (error) {
            console.error('Error updating escalation', error);
        } finally {
            setUpdating(false);
        }
    };

    if (isLoading || !summary) return <div className="p-8 text-center text-gray-400">Loading Governance Data...</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 border-b-4 border-indigo-600 inline-block pb-1">Department Governance</h1>
                    <p className="text-slate-500 text-sm mt-2">Manage critical student escalations and track mentor distribution.</p>
                </div>
            </header>

            {/* Top Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Total Classes</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-800">{summary.totalClasses}</h3>
                        <BarChart className="w-5 h-5 text-indigo-100" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Total Mentors</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-800">{summary.totalMentors}</h3>
                        <UserCircle className="w-5 h-5 text-indigo-100" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-rose-100 bg-rose-50/30 shadow-sm">
                    <p className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-2">Critical Students</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-rose-600">{summary.totalCriticalStudents}</h3>
                        <AlertOctagon className="w-5 h-5 text-rose-200" />
                    </div>
                </div>
                <div className="bg-indigo-600 p-5 rounded-2xl shadow-indigo-200 shadow-lg text-white">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Active Escalations</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black">{summary.activeEscalations}</h3>
                        <ClipboardList className="w-6 h-6 opacity-30" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Performance Index</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-emerald-600">84%</h3>
                        <CheckCircle className="w-5 h-5 text-emerald-100" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex px-4 border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('escalations')}
                        className={`px-8 py-5 text-sm font-bold transition-all relative ${activeTab === 'escalations' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Escalated Students
                        {activeTab === 'escalations' && <motion.div layoutId="hodTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={`px-8 py-5 text-sm font-bold transition-all relative ${activeTab === 'performance' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Mentor Performance
                        {activeTab === 'performance' && <motion.div layoutId="hodTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                    </button>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'escalations' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr className="text-xs text-slate-400 uppercase tracking-widest font-black border-b border-slate-100">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Class</th>
                                        <th className="px-6 py-4">Mentor</th>
                                        <th className="px-6 py-4">Issue Summary</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {escalations.map(esc => (
                                        <tr key={esc._id} className="hover:bg-indigo-50/10 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 border border-slate-200 group-hover:bg-white transition-colors">
                                                        {esc.student.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{esc.student.fullName}</p>
                                                        <p className="text-xs text-slate-400">{esc.student.registerNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-bold text-slate-600">{esc.student.academicYear}</td>
                                            <td className="px-6 py-5 text-sm font-bold text-indigo-600/70">{esc.mentor.fullName}</td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-slate-500 max-w-xs truncate">{esc.issueSummary}</p>
                                                <p className="text-[10px] text-slate-300 mt-1 uppercase font-black">{new Date(esc.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${esc.status === 'Open' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                    esc.status === 'Under Review' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                                        'bg-emerald-50 text-emerald-500 border-emerald-100'
                                                    }`}>
                                                    {esc.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => setSelectedEscalation(esc)}
                                                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-slate-400 hover:text-indigo-600"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {escalations.length === 0 && (
                                        <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">No active escalations found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {mentorPerformance.map(mentor => (
                                <div key={mentor.mentorId} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-black text-slate-800 text-lg leading-tight">{mentor.name}</h4>
                                        <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg">Performance High</div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <span>Mentees</span>
                                            <span className="text-slate-800">{mentor.totalStudents}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <span>Red Cases</span>
                                            <span className="text-rose-500">{mentor.redStudents}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <span>Interaction Rate</span>
                                            <span className="text-indigo-600">{(mentor.interactionRate * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50">
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                                                <span className="text-xs font-bold text-slate-400">Total Escalations</span>
                                                <span className="text-sm font-black text-slate-800">{mentor.escalations}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Directive Modal */}
            <AnimatePresence>
                {selectedEscalation && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 z-[60] backdrop-blur-sm"
                            onClick={() => setSelectedEscalation(null)}
                        />
                        <motion.div
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-3xl z-[70] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 block w-fit">Escalation Review</span>
                                        <h2 className="text-2xl font-black text-slate-800">{selectedEscalation.student.fullName}</h2>
                                        <p className="text-sm text-slate-400 mt-1 font-bold">Register Number: {selectedEscalation.student.registerNumber}</p>
                                    </div>
                                    <button onClick={() => setSelectedEscalation(null)} className="p-2 bg-white hover:bg-slate-100 rounded-full border border-slate-200 transition-colors">
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Escalation Context</h3>
                                    <p className="text-slate-600 font-bold leading-relaxed">{selectedEscalation.issueSummary}</p>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">HOD Directives</h3>
                                    <div className="max-h-[150px] overflow-y-auto mb-4 space-y-3 pr-2">
                                        {selectedEscalation.hodDirectives.map((d, i) => (
                                            <div key={i} className="text-sm bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-slate-700 font-bold">
                                                {d.note}
                                                <p className="text-[10px] text-indigo-300 mt-1 uppercase">{new Date(d.date).toLocaleString()}</p>
                                            </div>
                                        ))}
                                        {selectedEscalation.hodDirectives.length === 0 && (
                                            <p className="text-center text-sm text-slate-300 py-4 font-bold border border-slate-100 border-dashed rounded-2xl">No directives logged yet.</p>
                                        )}
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={directiveNote}
                                        onChange={(e) => setDirectiveNote(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                                        placeholder="Enter your directive or note here..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        onClick={() => handleUpdateEscalation('Under Review')}
                                        className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none shadow-none font-black py-4 rounded-2xl"
                                        isLoading={updating}
                                    >
                                        Keep Under Review
                                    </Button>
                                    <Button
                                        onClick={() => handleUpdateEscalation('Closed')}
                                        className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 font-black py-4 rounded-2xl"
                                        isLoading={updating}
                                    >
                                        Close Escalation
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// Simple Close Icon
const X = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default DepartmentGovernance;
