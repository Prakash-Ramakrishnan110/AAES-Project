import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    BookOpen, FileText, CheckSquare, Clock, ClipboardList,
    BarChart2, Zap, ArrowRight, Users, TrendingUp, Star, CalendarDays, Download, HeartHandshake
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Subject {
    _id: string; name: string; code: string; semester: string; academicYear?: string; department?: string;
}

const StaffDashboard = () => {
    const { token, user } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const [stats, setStats] = useState({ subjectCount: 0, assignmentCount: 0, submissionCount: 0, pendingGrading: 0 });
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
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

    const kpis = [
        { label: 'My Subjects', value: stats.subjectCount, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/staff/my-subjects' },
        { label: 'Assignments', value: stats.assignmentCount, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', link: '/staff/assignments' },
        { label: 'Submissions', value: stats.submissionCount, icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-50', link: '/staff/evaluation' },
        { label: 'Pending Review', value: stats.pendingGrading, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', link: '/staff/evaluation' },
    ];

    const quickActions = [
        { icon: ClipboardList, label: 'Mark Attendance', desc: 'Go to My Subjects → Mark Attendance', color: 'from-indigo-500 to-indigo-600', link: '/staff/my-subjects' },
        { icon: FileText, label: 'Assignments', desc: 'Manage tests, quizzes & AI tasks', color: 'from-blue-500 to-blue-600', link: '/staff/assignments' },
        { icon: BarChart2, label: 'Evaluate', desc: `${stats.pendingGrading} submissions pending`, color: 'from-green-500 to-green-600', link: '/staff/evaluation' },
        { icon: HeartHandshake, label: 'Mentor Hub', desc: 'Mentees, risk levels & interactions', color: 'from-teal-500 to-teal-600', link: '/staff/mentorship-governance' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {(user as any)?.fullName || user?.username} 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Here's your teaching overview for today</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={exportToPDF}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <Link to="/staff/assignments"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        <FileText className="w-4 h-4" /> Assignments
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <motion.div key={kpi.label}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                    >
                        <Link to={kpi.link}>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group">
                                <div className={`p-3 rounded-xl ${kpi.bg} group-hover:scale-110 transition-transform`}>
                                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {loading ? <span className="text-gray-300">—</span> : kpi.value}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* My Subjects Overview */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <h2 className="font-semibold text-gray-800 text-sm">My Subjects</h2>
                        </div>
                        <Link to="/staff/my-subjects" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                            View All <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm">
                            No subjects assigned yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {subjects.slice(0, 5).map((subject, i) => (
                                <motion.div key={subject._id}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {subject.code?.substring(0, 2).toUpperCase() || 'SU'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{subject.name}</p>
                                        <p className="text-xs text-gray-400">{subject.code} · Sem {subject.semester} · {subject.academicYear}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => navigate(`/staff/attendance/${subject._id}`)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors"
                                        >
                                            <ClipboardList className="w-3 h-3" /> Attend
                                        </button>
                                        <button onClick={() => navigate(`/staff/attendance/${subject._id}/summary`)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors"
                                        >
                                            <BarChart2 className="w-3 h-3" /> Summary
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Grading Progress */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <h2 className="font-semibold text-gray-800 text-sm">Grading Progress</h2>
                        </div>
                        <div className="relative flex items-center justify-center mb-3">
                            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F3F4F6" strokeWidth="3.5" />
                                <circle cx="18" cy="18" r="15.9" fill="none"
                                    stroke={gradeRate >= 80 ? '#10B981' : gradeRate >= 50 ? '#F59E0B' : '#6366F1'}
                                    strokeWidth="3.5"
                                    strokeDasharray={`${gradeRate} ${100 - gradeRate}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute text-center">
                                <p className="text-2xl font-bold text-gray-900">{gradeRate}%</p>
                                <p className="text-xs text-gray-400">Graded</p>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <div className="text-center">
                                <p className="font-bold text-gray-800">{stats.submissionCount - stats.pendingGrading}</p>
                                <p>Graded</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-amber-600">{stats.pendingGrading}</p>
                                <p>Pending</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-800">{stats.submissionCount}</p>
                                <p>Total</p>
                            </div>
                        </div>
                        <Link to="/staff/evaluation"
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                            <CheckSquare className="w-3.5 h-3.5" /> Go to Evaluation
                        </Link>
                    </div>

                    {/* Advisor Badge (if advisor) */}
                    {(user as any)?.isAdvisor && (
                        <Link to="/staff/advisor-dashboard"
                            className="block bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-4 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-100 rounded-xl">
                                    <Star className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-purple-800">Class Advisor</p>
                                    <p className="text-xs text-purple-500">View your class overview →</p>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Quick Actions
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, i) => (
                        <motion.div key={action.label}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.06 }}
                        >
                            <Link to={action.link}>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <action.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">{action.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Today Info */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <CalendarDays className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-indigo-200 text-sm">
                            {subjects.length} subject{subjects.length !== 1 ? 's' : ''} assigned · {stats.pendingGrading} pending review
                        </p>
                    </div>
                </div>
                <Link to="/staff/my-subjects"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors whitespace-nowrap"
                >
                    <Users className="w-4 h-4" /> My Subjects
                </Link>
            </div>
        </div>
    );
};

export default StaffDashboard;
