import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Activity, BarChart3, TrendingUp, Presentation } from 'lucide-react';

const COLORS = ['#4F46E5', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HODAnalytics = () => {
    const { token, user } = useContext(AuthContext)!;
    const [performanceStats, setPerformanceStats] = useState<any[]>([]); // Depts for Admin, Staff for HOD
    const [semesterStats, setSemesterStats] = useState([]);
    const [subjectStats, setSubjectStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const isHOD = user?.role === 'hod';

                // Fetch Staff Performance for HOD, Department Performance for Admin
                const primaryStatUrl = isHOD
                    ? `${API}/api/analytics/staff/performance`
                    : `${API}/api/analytics/department`;

                const [perfRes, semRes, subjRes] = await Promise.all([
                    axios.get(primaryStatUrl, config),
                    axios.get(`${API}/api/analytics/semester`, config),
                    axios.get(`${API}/api/analytics/subject`, config)
                ]);

                setPerformanceStats(perfRes.data);
                setSemesterStats(semRes.data);
                setSubjectStats(subjRes.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [token]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    const isHOD = user?.role === 'hod';

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900">
                        {isHOD ? 'Department Analytics' : 'System Analytics Headquarters'}
                    </h1>
                    <p className="text-slate-500 mt-1">Real-time academic intelligence and performance metrics.</p>
                </div>
            </motion.div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: isHOD ? 'Total Staff Evaluated' : 'Total Departments', value: performanceStats.length, icon: <Activity />, color: 'text-indigo-600', bg: 'bg-indigo-100' },
                    { label: 'Active Semesters', value: semesterStats.length, icon: <TrendingUp />, color: 'text-pink-600', bg: 'bg-pink-100' },
                    { label: 'Active Subjects', value: subjectStats.length, icon: <Presentation />, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'Data Points', value: subjectStats.reduce((acc, curr) => acc + curr.totalSubmissions, 0), icon: <BarChart3 />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-200 p-6 rounded-md shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-md ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Performance */}
                {/* Department/Staff Performance */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-slate-200 p-6 rounded-md shadow-sm"
                >
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-slate-900">{isHOD ? 'Staff Performance Tracking' : 'Department Performance'}</h2>
                        <p className="text-sm text-slate-500">Average marks across {isHOD ? 'all faculty in your department' : 'all active departments'}</p>
                    </div>
                    <div className="h-80">
                        {performanceStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={performanceStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey={isHOD ? "staff" : "department"} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                                    />
                                    <Bar dataKey="avgMarks" fill="url(#colorAvg)" radius={[6, 6, 0, 0]} name="Avg Marks" barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No performance data available</div>
                        )}
                    </div>
                </motion.div>

                {/* Semester Trends */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-slate-200 p-6 rounded-md shadow-sm"
                >
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Semester Trending Analysis</h2>
                        <p className="text-sm text-slate-500">Performance growth over academic semesters</p>
                    </div>
                    <div className="h-80">
                        {semesterStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={semesterStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSem" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="semester" axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="avgMarks" stroke="#EC4899" strokeWidth={3} fill="url(#colorSem)" name="Avg Marks" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No trend data available</div>
                        )}
                    </div>
                </motion.div>

                {/* Subject Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white border border-slate-200 p-6 rounded-md shadow-sm lg:col-span-2"
                >
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Subject Submission Distribution</h2>
                        <p className="text-sm text-slate-500">Volume of evaluated submissions across subjects</p>
                    </div>
                    <div className="h-96 flex flex-col lg:flex-row items-center">
                        {subjectStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={384}>
                                <PieChart>
                                    <Pie
                                        data={subjectStats}
                                        innerRadius={90}
                                        outerRadius={130}
                                        paddingAngle={5}
                                        dataKey="totalSubmissions"
                                        nameKey="subject"
                                        cx="50%"
                                        cy="50%"
                                    >
                                        {subjectStats.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400">No submission distribution data</div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default HODAnalytics;
