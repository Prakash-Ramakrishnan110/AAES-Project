import { useEffect, useState, useContext, cloneElement } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';

import {
    BookOpen, FileText, CheckSquare, Clock,
    Zap, TrendingUp, 
    Calendar, Download,
    Target, LayoutDashboard
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SectionCard from '../../components/ui/SectionCard';
import Skeleton from '../../components/ui/Skeleton';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 260,
            damping: 20
        }
    }
} as const;

interface Subject {
    _id: string; name: string; code: string; semester: string; academicYear?: string; department?: string;
}

const StaffDashboard = () => {
    const { token, user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();

    const [stats, setStats] = useState({ subjectCount: 0, assignmentCount: 0, submissionCount: 0, pendingGrading: 0, pendingReEval: 0 });
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const staffId = (user as any)?._id || user?.id;
                const [statsRes, subjectsRes] = await Promise.all([
                    axios.get(`${API}/api/assignments/stats/staff`, config),
                    axios.get(`${API}/api/subjects?staffId=${staffId}`, config)
                ]);
                setStats(statsRes.data);
                setSubjects(subjectsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetch();
    }, [token, user]);

    const gradeRate = stats.submissionCount > 0
        ? Math.round(((stats.submissionCount - stats.pendingGrading) / stats.submissionCount) * 100)
        : 0;

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const staffName = (user as any)?.fullName || user?.username || 'Staff';

            doc.setFontSize(18);
            doc.text(`Staff Dashboard Report`, 14, 20);

            doc.setFontSize(12);
            doc.text(`Generated for: ${staffName}`, 14, 30);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 38);

            autoTable(doc, {
                startY: 45,
                head: [['Key Metric', 'Value']],
                body: [
                    ['Total Subjects', stats.subjectCount.toString()],
                    ['Total Assignments', stats.assignmentCount.toString()],
                    ['Total Submissions', stats.submissionCount.toString()],
                    ['Pending Grading', stats.pendingGrading.toString()],
                    ['Grading Progress', `${gradeRate}%`]
                ],
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229] }
            });

            if (subjects.length > 0) {
                const subjectBody = subjects.map(s => [
                    s.code || 'N/A',
                    s.name || 'N/A',
                    s.semester || 'N/A',
                    s.academicYear || 'N/A'
                ]);
                autoTable(doc, {
                    startY: (doc as any).lastAutoTable.finalY + 15,
                    head: [['Subject Code', 'Subject Name', 'Semester', 'Academic Year']],
                    body: subjectBody,
                    theme: 'striped',
                    headStyles: { fillColor: [79, 70, 229] }
                });
            }

            doc.save(`Staff_Report_${staffName.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        }
    };

    useEffect(() => {
        if (!loading) {
            setHeaderOptions({
                title: 'Institutional Academic Dashboard',
                subtitle: (
                    <span>Welcome back, <span className="text-slate-900 font-bold">{(user as any)?.fullName || user?.username}</span> &bull; Faculty Portal</span>
                ),
                actions: (
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={exportToPDF}
                            className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5 text-primary" />
                            Academic Report
                        </button>
                        <button 
                            onClick={() => navigate('/staff/evaluation')}
                            className="bg-primary text-white px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Target className="w-3.5 h-3.5" />
                            Grading Hub
                        </button>
                    </div>
                )
            });
        }
    }, [loading, user, setHeaderOptions, navigate]);

    const quickActions = [
        { icon: LayoutDashboard, label: 'Modules', desc: 'Sync tests & AI workloads', color: 'from-[#05CD99] to-[#04b084]', link: '/staff/assignments' },
        { icon: Target, label: 'Evaluate', desc: `${stats.pendingGrading} nodes pending`, color: 'from-[#FFB547] to-[#e6a33f]', link: '/staff/evaluation' },
    ];

    return (
        <div className="space-y-6 pb-12">
            {loading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} height={110} className="w-full rounded-2xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <Skeleton height={350} className="w-full rounded-3xl" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton height={200} className="w-full rounded-3xl" />
                            <Skeleton height={134} className="w-full rounded-3xl" />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Administrative KPIs */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        <StatCard label="Assigned Modules" value={stats.subjectCount} icon={<BookOpen />} color="blue" link="/staff/my-subjects" />
                        <StatCard label="Submissions" value={stats.assignmentCount} icon={<FileText />} color="indigo" link="/staff/assignments" />
                        <StatCard 
                            label="Pending Eval" 
                            value={stats.pendingGrading} 
                            icon={<Clock />} 
                            color="amber" 
                            link="/staff/evaluation"
                            alert={(stats as any).pendingReEval > 0 ? `${(stats as any).pendingReEval} Re-eval` : null}
                        />
                        <StatCard label="Impact" value={`${gradeRate}%`} icon={<TrendingUp />} color="green" link="/staff/evaluation" />
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Course Stream */}
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-2">
                            <SectionCard 
                                title="Active Courses" 
                                subtitle="Live academic inventory"
                                icon={<BookOpen />}
                                actions={<Link to="/staff/my-subjects" className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline">View All</Link>}
                            >
                                <div className="space-y-2 pt-2">
                                    {subjects.length === 0 ? (
                                        <div className="py-10 text-center text-gray-400 text-xs font-bold uppercase">No courses mapped</div>
                                    ) : (
                                        subjects.slice(0, 5).map((subject) => (
                                            <div key={subject._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                        <LayoutDashboard size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-slate-900 leading-tight">{subject.name}</p>
                                                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">Semester {subject.semester} • {subject.code}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => navigate(`/staff/assignments`)} className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold uppercase tracking-tight text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">Assignments</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </SectionCard>
                        </motion.div>

                        <div className="space-y-4">
                            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                                <SectionCard title="Grading Status" subtitle="Sync completion" icon={<CheckSquare />}>
                                    <div className="flex flex-col items-center pt-2">
                                        <div className="relative w-28 h-28 mb-4">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                                                <circle cx="18" cy="18" r="16" fill="none"
                                                    stroke={gradeRate >= 80 ? '#10b981' : gradeRate >= 50 ? '#f59e0b' : '#3b82f6'}
                                                    strokeWidth="3"
                                                    strokeDasharray={`${gradeRate} ${100 - gradeRate}`}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-bold text-slate-900 leading-none">{gradeRate}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-slate-900">{stats.submissionCount - stats.pendingGrading}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Graded</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-amber-600">{stats.pendingGrading}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Pending</p>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate('/staff/evaluation')} className="mt-5 w-full bg-slate-900 text-white rounded-xl py-2.5 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
                                            Open Hub
                                        </button>
                                    </div>
                                </SectionCard>
                            </motion.div>


                        </div>
                    </div>

                    <motion.div variants={itemVariants} initial="hidden" animate="visible">
                        <SectionCard title="Instructional Tools" subtitle="Authorized administrative nodes" icon={<Zap />}>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
                                {quickActions.map((action) => (
                                    <div 
                                        key={action.label}
                                        className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all cursor-pointer hover:shadow-md"
                                        onClick={() => navigate(action.link)}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-4 group-hover:text-blue-600 transition-all shadow-sm group-hover:shadow-blue-100">
                                            <action.icon className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-[14px] font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{action.label}</h4>
                                        <p className="text-[10px] font-medium text-slate-500 leading-snug">{action.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </motion.div>

                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                <Calendar className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-slate-900 text-xl font-bold tracking-tight">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest opacity-80 mt-0.5">
                                    Academic Session Active &bull; Institutional Faculty Portal
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="hidden sm:block text-right">
                                <p className="text-2xl font-bold text-slate-900 leading-none">{stats.pendingGrading}</p>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Pending Evaluations</p>
                            </div>
                            <button onClick={() => navigate('/staff/my-subjects')} className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
                                Sync Workspace
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon, color, link, alert }: any) => {
    const navigate = useNavigate();
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        indigo: 'text-indigo-600 bg-indigo-50',
        amber: 'text-amber-600 bg-amber-50',
        green: 'text-green-600 bg-green-50'
    };
 
    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => link && navigate(link)}
            className="glass-card premium-lift flex items-center gap-4 px-6 cursor-pointer h-[115px]"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                {cloneElement(icon as any, { size: 20, strokeWidth: 2.5 })}
            </div>
            <div className="min-w-0 flex-1 text-left">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight truncate">{label}</p>
                <div className="flex flex-col mt-1">
                    <h3 className="text-2xl font-bold text-slate-900 leading-none">{value}</h3>
                    {alert && <p className="text-[9px] font-black text-red-600 mt-1 uppercase truncate tracking-wider">{alert}</p>}
                </div>
            </div>
        </motion.div>
    );
};

export default StaffDashboard;
