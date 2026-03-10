import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Globe, Activity, PieChart, Zap, TrendingUp,
    Shield, Target, ChevronRight, BarChart3
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, PieChart as RePieChart, Pie, Cell
} from 'recharts';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const COLORS = ['#4F46E5', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];

const PrincipalAnalytics = () => {
    const { token } = useContext(AuthContext)!;
    const [data, setData] = useState<any>(null);
    const [facultyMatrix, setFacultyMatrix] = useState<any[]>([]);
    const [forecast, setForecast] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const results = await Promise.allSettled([
                    axios.get(`${API}/api/governance/principal/dashboard`, config),
                    axios.get(`${API}/api/analytics/principal/faculty-matrix`, config),
                    axios.get(`${API}/api/analytics/principal/forecast`, config)
                ]);

                if (results[0].status === 'fulfilled') setData(results[0].value.data);
                if (results[1].status === 'fulfilled') setFacultyMatrix(results[1].value.data || []);
                if (results[2].status === 'fulfilled') setForecast(results[2].value.data);

            } catch (error) {
                console.error('Error fetching global insights', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [token]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Synthesizing Global Analytics...</p>
            </div>
        </div>
    );

    if (!data || !data.summary) return (
        <div className="flex flex-col items-center justify-center min-h-screen text-slate-500 bg-slate-50">
            <div className="mt-20 flex flex-col items-center">
                <Globe className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold text-lg">No Analytics Data Available</p>
                <p className="text-sm">Institutional synchronization in progress.</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase">Retry Connection</button>
            </div>
        </div>
    );

    const pieData = [
        { name: 'Red State', value: data?.summary?.totalRed || 0 },
        { name: 'Yellow State', value: data?.summary?.totalYellow || 0 },
        { name: 'Green State', value: data?.summary?.totalGreen || 0 }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-indigo-100">

            {/* Unified Top Header Context */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-40 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase first-letter:uppercase">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                            <Globe className="w-5 h-5 text-indigo-600" /> Global Insights
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Institutional Analytics Matrix</p>
                    </div>
                    <div className="px-4 py-2 bg-indigo-50/50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-indigo-100">
                        <Activity className="w-3.5 h-3.5" /> Macro-Telemetry Pulse: Active
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bar Chart: Departmental Performance */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm"
                    >
                        <div className="mb-8 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Departmental Yield Matrix</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Average student success rates across faculties</p>
                            </div>
                            <BarChart3 className="w-4 h-4 text-slate-300" />
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.departmentComparison}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(79, 70, 229, 0.04)' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: 11, fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="total" fill="#4F46E5" radius={[8, 8, 0, 0]} barSize={40}>
                                        {(data.departmentComparison || []).map((_entry: any, index: number) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Wellness + Velocity Strip */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group"
                        >
                            <div className="relative z-10">
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4 flex items-center gap-2 text-indigo-400">
                                    <PieChart className="w-4 h-4" /> Student Wellness Index
                                </h3>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={pieData}
                                                innerRadius={50}
                                                outerRadius={65}
                                                paddingAngle={10}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                <Cell fill="#f43f5e" />
                                                <Cell fill="#f59e0b" />
                                                <Cell fill="#10b981" />
                                            </Pie>
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Critical</p>
                                        <p className="text-base font-bold text-rose-400">{data.summary.totalRed}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Warning</p>
                                        <p className="text-base font-bold text-amber-400">{data.summary.totalYellow}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Healthy</p>
                                        <p className="text-base font-bold text-emerald-400">{data.summary.totalGreen}</p>
                                    </div>
                                </div>
                            </div>
                            <Globe className="absolute -right-12 -bottom-12 w-48 h-48 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                        </motion.div>

                        <div className="bg-indigo-600 p-8 rounded-2xl text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <Zap className="w-5 h-5 mb-4 text-emerald-300" />
                                <h3 className="text-xl font-bold tracking-tight">Transmission Velocity</h3>
                                <p className="text-xs font-medium opacity-80 mt-2 leading-relaxed italic">
                                    "Institutional infrastructure processes <span className="font-black text-white px-1.5 bg-white/10 rounded">14.2k telemetry points</span> every 24 hours."
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Faculty Performance Matrix */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 ml-1">
                        <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Faculty Resource Performance Matrix</h3>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-8 py-5">Academic Registry</th>
                                        <th className="px-8 py-5">Specialization</th>
                                        <th className="px-8 py-5 text-center">Average Yield (%)</th>
                                        <th className="px-8 py-5 text-center">Engagement Index</th>
                                        <th className="px-8 py-5 text-right">Operational Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {facultyMatrix.map((staff, i) => (
                                        <tr key={staff._id || i} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                                                        {(staff.staffName || '?')[0]}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{staff.staffName || 'Unknown Faculty'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-tight">
                                                    {staff.dept}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-black text-slate-800">{staff.avgMarks}%</span>
                                                    <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                        <div
                                                            className={`h-full ${staff.avgMarks > 80 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                                            style={{ width: `${staff.avgMarks}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-bold text-slate-600">{staff.studentEngagement.toFixed(1)}%</span>
                                                    <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-slate-400 group-hover:bg-indigo-400 transition-colors"
                                                            style={{ width: `${staff.studentEngagement}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${staff.avgMarks > 80 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${staff.avgMarks > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {staff.avgMarks > 80 ? 'Excellence' : 'Observation'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Predictive Forecasting AI Analysis */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/3 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                                <Zap className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Predictive Neural Engine v2.1</span>
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter leading-tight">Institutional Performance Forecast</h2>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                Macro-level synthesis of {data.summary.totalStudents * 5} telemetry nodes across cross-departmental success vectors.
                            </p>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl group hover:border-rose-500/40 transition-all">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Projected Vunerability</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-5xl font-black text-rose-500 tracking-tighter group-hover:scale-110 transition-transform">{forecast?.predictedRiskCount || 0}</h3>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Nodes</span>
                                </div>
                                <div className="mt-8 flex items-center gap-3">
                                    <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{ width: '35%' }} />
                                    </div>
                                    <span className="text-[10px] font-black text-rose-300 uppercase">-12% Forecast</span>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl group hover:border-emerald-500/40 transition-all">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Signal Confidence</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-5xl font-black text-emerald-400 tracking-tighter group-hover:scale-110 transition-transform">{forecast?.confidence || 0}%</h3>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Precision Index</span>
                                </div>
                                <div className="mt-8 flex items-center gap-3">
                                    <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400" style={{ width: `${forecast?.confidence || 0}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">High Reliability</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Visual noise elements */}
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />
                </div>
            </main>
        </div>
    );
};

export default PrincipalAnalytics;
