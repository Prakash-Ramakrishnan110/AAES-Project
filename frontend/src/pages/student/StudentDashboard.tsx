import { useEffect, useState, useContext } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    BookOpen, Plus, CheckCircle2, 
    Clock, Award, TrendingUp
} from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';
import { cloneElement } from 'react';
import ReEvaluationModal from '../../components/modals/ReEvaluationModal';
import { motion } from 'framer-motion';
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

const StudentDashboard = () => {
    const { token, user } = useContext(AuthContext)!;
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();
    const [stats, setStats] = useState({
        totalAssignments: 0,
        submittedCount: 0,
        pendingCount: 0,
        avgMarks: 0
    });
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Re-evaluation State
    const [selectedSubForReEval, setSelectedSubForReEval] = useState<any | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [statsRes, subsRes] = await Promise.all([
                    axios.get(`${API}/api/submissions/stats`, config),
                    axios.get(`${API}/api/submissions/my`, config)
                ]);
                setStats(statsRes.data);
                setRecentSubmissions(subsRes.data.slice(0, 5));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);



    useEffect(() => {
        setHeaderOptions({
            title: 'Academic Analytics',
            subtitle: (
                <span className="flex items-center gap-2">
                    Welcome back, <span className="text-slate-900 font-bold">{(user as any)?.fullName || user?.username}</span> · Semester {user?.semester || '—'}
                </span>
            ),
            actions: (
                <div className="flex items-center gap-3">
                    <Link 
                        to="/student/assignments" 
                        className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Submission
                    </Link>
                </div>
            )
        });
    }, [user, setHeaderOptions]);

    const performanceData = recentSubmissions.map(s => ({
        name: (s.assignmentId?.title || 'Unit').substring(0, 8),
        score: (s.status === 'graded' || s.aiResultStatus === 'graded') ? s.marks : 0
    })).reverse();

    return (
        <div className="space-y-4">
            {loading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} height={110} className="w-full rounded-2xl" />
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
                    {/* SaaS Stat Cards */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        <StatCard label="Active Modules" value={stats.totalAssignments} icon={<BookOpen />} color="blue" />
                        <StatCard label="Completed" value={stats.submittedCount} icon={<CheckCircle2 />} color="green" />
                        <StatCard label="Pending" value={stats.pendingCount} icon={<Clock />} color="amber" />
                        <StatCard label="Marks Avg" value={`${stats.avgMarks}%`} icon={<Award />} color="blue" />
                    </motion.div>

                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-12">
                            <SectionCard 
                                title="Submission Performance" 
                                subtitle="Analytics across recent assignments"
                                icon={<TrendingUp />}
                            >
                                <div className="h-64 w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={performanceData}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} 
                                                dy={10} 
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
                                                dataKey="score" 
                                                stroke="#3b82f6" 
                                                strokeWidth={3} 
                                                fillOpacity={1} 
                                                fill="url(#colorScore)" 
                                                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </SectionCard>
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants} initial="hidden" animate="visible">
                        <SectionCard title="Evaluation History" subtitle="Recent academic records" icon={<Award />}>
                            <div className="overflow-x-auto">
                                <table className="table-compact">
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th>Title</th>
                                            <th>Submitted</th>
                                            <th>Status</th>
                                            <th className="text-right">Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSubmissions.length === 0 ? (
                                            <tr><td colSpan={5} className="py-10 text-center text-slate-400 font-medium">No evaluation records found</td></tr>
                                        ) : (
                                            recentSubmissions.map((sub) => (
                                                <tr key={sub._id}>
                                                    <td className="font-bold text-slate-900">{sub.assignmentId?.subjectId?.name || 'Academic Core'}</td>
                                                    <td>{sub.assignmentId?.title || 'Submission'}</td>
                                                    <td className="text-slate-500 font-medium">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(sub.status === 'graded' || sub.aiResultStatus === 'graded') ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            {(sub.status || sub.aiResultStatus || 'submitted').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="text-right font-bold text-slate-900">{(sub.status === 'graded' || sub.aiResultStatus === 'graded') ? `${sub.marks}/100` : '--'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    </motion.div>
                </>
            )}


            {selectedSubForReEval && (
                <ReEvaluationModal isOpen={!!selectedSubForReEval} onClose={() => setSelectedSubForReEval(null)} submission={selectedSubForReEval} />
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon, color }: any) => {
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
            className="glass-card premium-lift p-5 rounded-2xl flex items-center gap-4 cursor-default"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                {cloneElement(icon as any, { size: 20, strokeWidth: 2.5 })}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 leading-none mt-1">{value}</h3>
            </div>
        </motion.div>
    );
};

export default StudentDashboard;
