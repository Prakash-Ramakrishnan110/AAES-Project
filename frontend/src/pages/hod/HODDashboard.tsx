import { useEffect, useState, useContext, cloneElement } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { 
    Users, BookOpen, Clock, 
    TrendingUp, FileText, 
    LayoutDashboard, BarChart2, Star, MessageSquare, Download, Target, 
    AlertTriangle, GraduationCap, UserPlus
} from 'lucide-react';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import AssignAdvisorModal from './AssignAdvisorModal';
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

const HODDashboard = () => {
    const { user, token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();

    const [trendData, setTrendData] = useState([]);
    const [subjectData, setSubjectData] = useState([]);
    const [stats, setStats] = useState<any>(null);
    const [advisors, setAdvisors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdvisorModal, setShowAdvisorModal] = useState(false);
    const [workloadData, setWorkloadData] = useState<any[]>([]);
    const [comparisonData, setComparisonData] = useState<any[]>([]);
    const [ccmData, setCcmData] = useState<any[]>([]);
    const [queriesData, setQueriesData] = useState<any[]>([]);
    const [mentorshipOversight, setMentorshipOversight] = useState<any[]>([]);
    const [ccmOversight, setCcmOversight] = useState<any>(null);
    const [morningReports, setMorningReports] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'workload' | 'comparison' | 'ccm' | 'mentorship' | 'morning'>('overview');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [
                    statsRes, semRes, subjRes, advisorRes, 
                    workloadRes, comparisonRes, ccmRes, queriesRes, 
                    oversightRes, ccmOversightRes, morningReportsRes
                ] = await Promise.all([
                    axios.get(`${API}/api/analytics/hod/stats`, config),
                    axios.get(`${API}/api/analytics/semester`, config),
                    axios.get(`${API}/api/analytics/subject`, config),
                    axios.get(`${API}/api/advisor/assignments`, config),
                    axios.get(`${API}/api/analytics/hod/workload`, config),
                    axios.get(`${API}/api/analytics/hod/comparison`, config),
                    axios.get(`${API}/api/ccm`, config),
                    axios.get(`${API}/api/mentorship`, config),
                    axios.get(`${API}/api/analytics/hod/mentorship-oversight`, config),
                    axios.get(`${API}/api/analytics/hod/ccm-oversight`, config),
                    axios.get(`${API}/api/morning-attendance/report`, config)
                ]);
                setStats(statsRes.data);
                setTrendData(semRes.data);
                setSubjectData(subjRes.data.map((s: any) => ({ name: s.subject, score: s.avgMarks })));
                setAdvisors(advisorRes.data);
                setWorkloadData(workloadRes.data);
                setComparisonData(comparisonRes.data);
                setCcmData(ccmRes.data);
                setQueriesData(queriesRes.data);
                setMentorshipOversight(oversightRes.data);
                setCcmOversight(ccmOversightRes.data);
                setMorningReports(morningReportsRes.data);
            } catch (error) {
                console.error("Failed to fetch HOD stats", error);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchDashboardData();
    }, [token]);

    useEffect(() => {
        if (!loading) {
            setHeaderOptions({
                title: 'Institutional Academic Administration',
                subtitle: (
                    <span className="flex items-center gap-2">
                        {user?.department} Department &bull; Welcome back, <span className="text-primary">{(user as any)?.fullName || user?.username}</span>
                    </span>
                ),
                actions: (
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={exportToPDF}
                            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4 text-slate-600" />
                            Export Report
                        </button>
                        <button 
                            onClick={() => navigate('/hod/analytics')}
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-md text-xs font-semibold transition-colors shadow-sm hover:bg-slate-800"
                        >
                            <Target className="w-4 h-4" />
                            Quality Audit
                        </button>
                    </div>
                )
            });
        }
    }, [loading, user, setHeaderOptions, navigate]);

    const quickActions = [
        { icon: UserPlus, label: 'Enrollment', desc: 'Secure departmental student node', color: 'from-[#4318FF] to-[#624BFF]', link: '/hod/students' },
        { icon: Star, label: 'Advisor Sync', desc: 'Manage class responsibilities', color: 'from-[#0B1437] to-[#1B2559]', action: () => setShowAdvisorModal(true) },
        { icon: BookOpen, label: 'Asset Index', desc: 'Staff and student directory overview', color: 'from-[#05CD99] to-[#04b084]', link: '/hod/directory' },
    ];

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const deptName = user?.department || 'Department';
            doc.setFontSize(18);
            doc.text(`${deptName} - HOD Dashboard Report`, 14, 20);
            doc.setFontSize(12);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Generated by: ${(user as any)?.fullName || user?.username || 'HOD'}`, 14, 38);
            autoTable(doc, {
                startY: 45, head: [['Key Metric', 'Value']],
                body: [
                    ['Total Faculty', (stats.staffCount || 0).toString()],
                    ['Total Students', (stats.studentCount || 0).toString()],
                    ['Average Performance', `${stats.avgMarks || 0}%`],
                    ['Active Advisors', advisors.length.toString()]
                ],
                theme: 'grid', headStyles: { fillColor: [79, 70, 229] }
            });
            doc.save(`HOD_Report_${deptName.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        }
    };

    return (
        <div className="space-y-4">
 
            {loading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} height={110} className="w-full rounded-2xl" />
                        ))}
                    </div>
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} width={80} height={32} className="rounded-md" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-8">
                            <Skeleton height={300} className="w-full rounded-3xl" />
                        </div>
                        <div className="lg:col-span-4">
                            <Skeleton height={300} className="w-full rounded-3xl" />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* SaaS Stat Cards - 5 per row */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                    >
                        <StatCard 
                            label="Faculty" 
                            value={stats.staffCount || 0} 
                            icon={<Users />}
                            color="blue"
                            link="/hod/staff"
                        />
                        <StatCard 
                            label="Students" 
                            value={stats.studentCount || 0} 
                            icon={<GraduationCap />}
                            color="blue"
                            link="/hod/students"
                        />
                        <StatCard 
                            label="Performance" 
                            value={`${stats.avgMarks || 0}%`} 
                            icon={<TrendingUp />}
                            color="green"
                            link="/hod/analytics"
                        />
                        <StatCard 
                            label="Attendance" 
                            value={`${stats.avgAttendance || 0}%`} 
                            icon={<Clock />}
                            color="amber"
                            link="/hod/attendance"
                        />
                        <StatCard 
                            label="At Risk" 
                            value={stats.riskCount || 0} 
                            icon={<AlertTriangle />}
                            color="red"
                            link="/hod/analytics"
                        />
                    </motion.div>

                    {/* Compact Navigation Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
                        {[
                            { id: 'overview', label: 'Domain', icon: LayoutDashboard },
                            { id: 'workload', label: 'Workload', icon: Users },
                            { id: 'comparison', label: 'Performance', icon: BookOpen },
                            { id: 'ccm', label: 'CCM Protocol', icon: FileText },
                            { id: 'mentorship', label: 'Mentorship', icon: MessageSquare },
                            { id: 'morning', label: 'Morning Roll Call', icon: Clock }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 border border-transparent'
                                    }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-8 space-y-4">
                                {/* Academic Analytics Block */}
                                <SectionCard 
                                    title="Academic Projection" 
                                    subtitle="Semester aggregate performance"
                                    icon={<TrendingUp />}
                                >
                                    <div className="h-64 w-full mt-2">
                                        {trendData && trendData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={trendData}>
                                                    <defs>
                                                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis 
                                                        dataKey="semester" 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} 
                                                        dy={8} 
                                                    />
                                                    <YAxis 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} 
                                                        domain={[0, 100]} 
                                                    />
                                                    <Tooltip 
                                                        contentStyle={{ 
                                                            borderRadius: '12px', 
                                                            border: 'none', 
                                                            padding: '12px',
                                                            fontSize: '12px',
                                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                                        }} 
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="avgMarks"
                                                        stroke="#3b82f6"
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorAvg)"
                                                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[12px] font-medium text-gray-400 italic">No historical data found</div>
                                        )}
                                    </div>
                                </SectionCard>
 
                                <SectionCard 
                                    title="Instructional Grid" 
                                    subtitle="Performance per subject node"
                                    icon={<BarChart2 />}
                                >
                                    <div className="h-48 w-full mt-2">
                                        {subjectData && subjectData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={subjectData} layout="vertical" margin={{ left: 0 }}>
                                                    <XAxis type="number" domain={[0, 100]} hide />
                                                    <YAxis 
                                                        dataKey="name" 
                                                        type="category" 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 500 }} 
                                                        width={64} 
                                                    />
                                                    <Bar dataKey="score" radius={[0, 2, 2, 0]} barSize={12}>
                                                        {subjectData.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.score < 50 ? '#ef4444' : '#312e81'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[12px] font-medium text-gray-400 italic">No course nodes detected</div>
                                        )}
                                    </div>
                                </SectionCard>
                            </div>
 
                            <div className="lg:col-span-4 space-y-4">
                                {/* Administrative Column */}
                                <SectionCard 
                                    title="Alert Stream" 
                                    subtitle="Critical monitoring"
                                    icon={<AlertTriangle />}
                                >
                                    <div className="space-y-1">
                                        {subjectData.filter((s: any) => (s.score > 0 && s.score < 50)).length > 0 ? (
                                            subjectData.filter((s: any) => (s.score > 0 && s.score < 50)).slice(0, 3).map((subj: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                        <div className="min-w-0">
                                                            <div className="text-[12px] font-bold text-gray-900 truncate">{subj.name}</div>
                                                            <div className="text-[10px] text-red-500 font-bold uppercase">{subj.score}% - CRITICAL</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">All Nodes Nominal</p>
                                            </div>
                                        )}
                                    </div>
                                </SectionCard>
 

                                <SectionCard 
                                    title="Administrative Log" 
                                    subtitle="Tactical node management"
                                    icon={<Target />}
                                >
                                    <div className="grid grid-cols-1 gap-2">
                                        {quickActions.map((action) => (
                                            <button 
                                                key={action.label}
                                                onClick={() => action.action ? action.action() : navigate(action.link || '#')}
                                                className="flex items-center gap-3 p-3 rounded-md bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all text-left"
                                            >
                                                <div className="w-8 h-8 rounded bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                                    <action.icon className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div>
                                                    <div className="text-[12px] font-bold text-gray-900 leading-tight">{action.label}</div>
                                                    <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{action.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </SectionCard>

                                {/* Morning Roll Call Stream */}
                                <SectionCard 
                                    title="Recent Morning Roll Call" 
                                    subtitle="Direct oversight of daily departmental attendance"
                                    icon={<Clock />}
                                    actions={
                                        <button 
                                            onClick={() => navigate('/hod/attendance')}
                                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                        >
                                            Detailed Tracker
                                        </button>
                                    }
                                >
                                    <div className="space-y-3 mt-2">
                                        {stats?.recentMorningSessions?.length > 0 ? (
                                            stats.recentMorningSessions.map((session: any, i: number) => (
                                                <div 
                                                    key={session._id || i} 
                                                    className="group flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-md transition-all cursor-pointer"
                                                    onClick={() => navigate('/hod/attendance')}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex flex-col items-center justify-center">
                                                            <span className="text-[10px] font-black text-slate-400 leading-none">
                                                                {new Date(session.date).toLocaleDateString(undefined, { month: 'short' })}
                                                            </span>
                                                            <span className="text-[14px] font-black text-slate-900 leading-none mt-0.5">
                                                                {new Date(session.date).getDate()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-[12px] font-bold text-slate-900 leading-tight">Morning Roll Call</div>
                                                            <div className="text-[10px] text-slate-500 font-medium uppercase">{session.academicYear}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[13px] font-black text-slate-900 tabular-nums">
                                                            {Math.round((session.present / session.total) * 100)}%
                                                        </div>
                                                        <div className="text-[9px] font-bold text-emerald-600 uppercase">Present</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-6 text-center">
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider italic">No morning sessions recorded this week</p>
                                            </div>
                                        )}
                                    </div>
                                </SectionCard>
                            </div>
                        </div>
                    )}

                    {activeTab === 'workload' && (
                        <SectionCard 
                            title="Faculty Resource Allocation" 
                            subtitle="Workload analysis and assignment density"
                            icon={<Users />}
                        >
                            <div className="overflow-x-auto">
                                <table className="table-compact">
                                    <thead>
                                        <tr>
                                            <th>Faculty Name</th>
                                            <th className="text-center">Courses</th>
                                            <th className="text-center">Live Units</th>
                                            <th className="text-center">Impact</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workloadData.map((staff: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="font-bold text-gray-900">{staff.staffName}</td>
                                                <td className="text-center tabular-nums text-gray-500 font-medium">{staff.subjectCount}</td>
                                                <td className="text-center">
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                                                        {staff.activeAssignments} ACTIVE
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="text-[13px] font-bold text-gray-900">{staff.totalStudentLoad}</div>
                                                    <div className="text-[9px] text-gray-400 font-medium uppercase truncate">Reach</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    )}

                    {activeTab === 'comparison' && (
                        <SectionCard 
                            title="Curricular Quality Metrics" 
                            subtitle="Relative performance across disciplines"
                            icon={<BookOpen />}
                        >
                            <div className="overflow-x-auto">
                                <table className="table-compact">
                                    <thead>
                                        <tr>
                                            <th>Discipline</th>
                                            <th className="text-center">Velocity</th>
                                            <th className="text-center">Sync Rate</th>
                                            <th className="text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisonData.map((subject: any, idx: number) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="font-bold text-gray-900 leading-none">{subject.subjectName}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{subject.subjectCode}</div>
                                                </td>
                                                <td className="text-center">
                                                    <span className="font-bold text-blue-600 text-[14px]">{subject.avgMarks}%</span>
                                                </td>
                                                <td className="text-center text-gray-500 font-medium">{subject.attendanceAvg}%</td>
                                                <td className="text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        subject.avgMarks >= 75 ? 'bg-green-50 text-green-600' : 
                                                        subject.avgMarks >= 50 ? 'bg-blue-50 text-blue-600' : 
                                                        'bg-red-50 text-red-600'
                                                    }`}>
                                                        {subject.avgMarks >= 75 ? 'OPTIMAL' : subject.avgMarks >= 50 ? 'STABLE' : 'CRITICAL'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    )}

                    {activeTab === 'ccm' && (
                        <div className="space-y-8">
                            {/* Oversight Stats */}
                            {ccmOversight && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard 
                                        label="Institutional CCMs" 
                                        value={ccmOversight.totalCCMs} 
                                        icon={<Users className="w-5 h-5" />}
                                        color="primary"
                                    />
                                    <StatCard 
                                        label="Action Assignments" 
                                        value={ccmOversight.totalActionItems} 
                                        icon={<FileText className="w-5 h-5" />}
                                        color="indigo"
                                    />
                                    <StatCard 
                                        label="Critical Delinquency" 
                                        value={ccmOversight.totalOverdue} 
                                        icon={<AlertTriangle className="w-5 h-5" />}
                                        color="red"
                                    />
                                </div>
                            )}

                            <SectionCard 
                                title="Departmental CCM Registry" 
                                subtitle="Formal institutional records"
                                icon={<FileText className="w-5 h-5" />}
                                actions={
                                    <button
                                        onClick={() => navigate('/hod/ccm-reports')}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all text-[11px] font-black uppercase tracking-widest"
                                    >
                                        <FileText className="w-4 h-4" /> Administrative Audit
                                    </button>
                                }
                            >
                                <div className="overflow-x-auto -mx-8 -my-8">
                                    <table className="w-full text-left table-compact border-collapse">
                                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-200">
                                            <tr>
                                                <th className="px-5 py-3">Date</th>
                                                <th className="px-5 py-3">Node Context</th>
                                                <th className="px-5 py-3">Classification</th>
                                                <th className="px-5 py-3 text-center">Protocol Integrity</th>
                                                <th className="px-5 py-3 text-center">Minutes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {ccmData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-8 py-12 text-center text-[14px] font-black text-[#A3AED0]">No departmental CCM records detected.</td>
                                                </tr>
                                            ) : (
                                                ccmData.map((ccm: any, idx: number) => (
                                                    <tr key={ccm._id || idx} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                                        <td className="px-5 py-4 font-semibold text-slate-900">
                                                            {new Date(ccm.meetingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-slate-900">{ccm.academicYear}</span>
                                                                <span className="text-xs text-slate-500">@{ccm.createdBy?.username || 'Advisor'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="text-xs uppercase font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                                                                {ccm.category || 'Academic'}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-sm font-semibold text-slate-900 tabular-nums">{ccm.actionItems?.length || 0} Assets</span>
                                                                {ccm.actionItems?.filter((a: any) => a.status === 'Overdue').length > 0 && (
                                                                    <span className="bg-red-50 text-red-700 text-xs font-semibold px-2 py-0.5 rounded border border-red-200">
                                                                        {ccm.actionItems.filter((a: any) => a.status === 'Overdue').length} Critical
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            {ccm.minutesPDF ? (
                                                                <a href={`${API}${ccm.minutesPDF}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors shadow-sm">
                                                                    <FileText className="w-4 h-4" /> Records
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">N/A</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {activeTab === 'mentorship' && (
                        <div className="space-y-8">
                            <SectionCard 
                                title="Academic Advising Oversight" 
                                subtitle="Mentor network health and query traffic"
                                icon={<MessageSquare className="w-5 h-5" />}
                            >
                                <div className="overflow-x-auto -mx-8 -my-8">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#F4F7FE]/50 text-[#A3AED0] uppercase text-[10px] font-black tracking-widest opacity-80 border-b border-[#F4F7FE]">
                                            <tr>
                                                <th className="px-8 py-5">Academic Mentor</th>
                                                <th className="px-8 py-5 text-center">Mentee Pool</th>
                                                <th className="px-8 py-5 text-center">Critical Nodes</th>
                                                <th className="px-8 py-5 text-center">Active Queries</th>
                                                <th className="px-8 py-5 text-center">Sync Latency</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#F4F7FE]">
                                            {mentorshipOversight.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-8 py-12 text-center text-[14px] font-black text-[#A3AED0]">No mentorship nodes detected.</td>
                                                </tr>
                                            ) : (
                                                mentorshipOversight.map((mentorItem: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-8 py-6">
                                                            <span className="font-black text-[#1B2559] text-[15px] tracking-tight">{mentorItem.mentorName}</span>
                                                        </td>
                                                        <td className="px-8 py-6 text-center font-black text-[#1B2559] tabular-nums">{mentorItem.totalMentees}</td>
                                                        <td className="px-8 py-6 text-center">
                                                            <span className={`px-5 py-2 rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-md ${mentorItem.criticalCases > 0 ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                                                {mentorItem.criticalCases} Cases
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-center font-black text-primary tabular-nums">{mentorItem.openQueries}</td>
                                                        <td className="px-8 py-6 text-center font-black text-[#A3AED0] tabular-nums tracking-widest opacity-80">
                                                            {mentorItem.avgResponseHours > 0 ? `${mentorItem.avgResponseHours}h` : '--'}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard>

                            <SectionCard 
                                title="Advising Communication Stream" 
                                subtitle="Live student-to-mentor communication audit"
                                icon={<MessageSquare className="w-5 h-5" />}
                                actions={
                                    <div className="flex gap-3">
                                        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2 shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                            {queriesData.filter(q => q.status === 'Open').length} Active
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-sm">
                                            {queriesData.filter(q => q.status === 'Resolved').length} Resolved
                                        </div>
                                    </div>
                                }
                            >
                                <div className="overflow-x-auto -mx-8 -my-8">
                                    <table className="w-full text-left table-compact border-collapse">
                                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-200">
                                            <tr>
                                                <th className="px-5 py-3">Chronology</th>
                                                <th className="px-5 py-3">Subunit Node</th>
                                                <th className="px-5 py-3">Mentor Contact</th>
                                                <th className="px-5 py-3">Issue Type</th>
                                                <th className="px-5 py-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {queriesData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-5 py-8 text-center text-sm font-medium text-slate-500">No traffic recorded.</td>
                                                </tr>
                                            ) : (
                                                queriesData.map((query: any, idx: number) => (
                                                    <tr key={query._id || idx} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                                        <td className="px-5 py-4 font-semibold text-slate-900 tabular-nums">
                                                            {new Date(query.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-slate-900">{query.student?.fullName || query.student?.username}</span>
                                                                <span className="text-xs text-slate-500 uppercase">{query.student?.registerNumber || query.student?.username}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 font-semibold text-slate-700">@{query.mentor?.username || 'System'}</td>
                                                        <td className="px-5 py-4">
                                                            <span className="text-xs font-medium px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                                                                {query.queryType}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            <span className={`px-3 py-1 rounded text-xs font-semibold uppercase border ${
                                                                query.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                                                            }`}>
                                                                {query.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {activeTab === 'morning' && (
                        <SectionCard 
                            title="Morning Roll Call Report" 
                            subtitle="Aggregate attendance metrics across department nodes"
                            icon={<Clock />}
                        >
                            <div className="overflow-x-auto -mx-8 -my-8 pt-4">
                                <table className="w-full text-left table-compact border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-200">
                                        <tr>
                                            <th className="px-5 py-4">Date</th>
                                            <th className="px-5 py-4">Class Node</th>
                                            <th className="px-5 py-4 text-center">Present</th>
                                            <th className="px-5 py-4 text-center">Absent</th>
                                            <th className="px-5 py-4 text-center">OD</th>
                                            <th className="px-5 py-4 text-right">Integrity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {morningReports.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-16 text-center">
                                                    <p className="text-[14px] font-black text-slate-300 uppercase tracking-widest italic">No aggregate reports detected in this domain</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            morningReports.map((report: any, idx: number) => (
                                                <tr key={report._id || idx} className="hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-0">
                                                    <td className="px-5 py-5 font-bold text-slate-900">
                                                        {new Date(report.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-5 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-slate-900 leading-tight">{report.department} {report.year}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sec {report.section} &bull; Sem {report.semester}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-5 text-center font-black text-green-600 tabular-nums">
                                                        {report.presentCount}
                                                    </td>
                                                    <td className="px-5 py-5 text-center font-black text-red-600 tabular-nums">
                                                        {report.absentCount}
                                                    </td>
                                                    <td className="px-5 py-5 text-center font-black text-indigo-600 tabular-nums">
                                                        {report.odCount}
                                                    </td>
                                                    <td className="px-5 py-5 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[14px] font-black text-slate-900 tabular-nums">
                                                                {Math.round((report.presentCount / report.totalStudents) * 100)}%
                                                            </span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    )}
                </>
            )}

            {showAdvisorModal && (
                <AssignAdvisorModal
                    onClose={() => setShowAdvisorModal(false)}
                    advisors={advisors}
                    refreshData={() => {
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        axios.get(`${API}/api/advisor/assignments`, config)
                            .then(res => setAdvisors(res.data));
                    }}
                />
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon, color, link, alert }: any) => {
    const navigate = useNavigate();
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        amber: 'text-amber-600 bg-amber-50',
        red: 'text-red-600 bg-red-50'
    };
 
    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => link && navigate(link)}
            className="glass-card premium-lift flex items-center gap-4 px-5 cursor-pointer h-[110px]"
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                {cloneElement(icon as any, { size: 18, strokeWidth: 2 })}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight truncate">{label}</p>
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-none mt-0.5">{value}</h3>
                    {alert && (
                        <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">{alert}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default HODDashboard;
