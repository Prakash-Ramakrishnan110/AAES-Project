import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Globe, Activity, PieChart, Zap
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/governance/principal/dashboard`, config);
                setData(data);
            } catch (error) {
                console.error('Error fetching global insights', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [token]);

    if (loading || !data) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const pieData = [
        { name: 'Red State', value: data.summary.totalRed },
        { name: 'Yellow State', value: data.summary.totalYellow },
        { name: 'Green State', value: data.summary.totalGreen }
    ];

    return (
        <div className="p-5 space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600" /> Global Insights
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">Real-time macro analytics and institutional performance projections.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Bar Chart: Departmental Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm"
                >
                    <div className="mb-4">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Departmental Yield</h2>
                        <p className="text-slate-400 font-medium text-[11px] mt-0.5">Average student success rates by faculty.</p>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.departmentComparison}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(79,70,229,0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', fontSize: 11 }}
                                />
                                <Bar dataKey="total" fill="#4F46E5" radius={[8, 8, 0, 0]} barSize={35}>
                                    {data.departmentComparison.map((_entry: any, index: number) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Pie + Velocity */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl"
                    >
                        <h3 className="text-sm font-bold mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-indigo-400" /> Student Wellness
                        </h3>
                        <div className="h-36">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={45}
                                        outerRadius={60}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#EF4444" />
                                        <Cell fill="#F59E0B" />
                                        <Cell fill="#10B981" />
                                    </Pie>
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-slate-500 uppercase">Critical</p>
                                <p className="text-sm font-bold text-red-400">{data.summary.totalRed}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-slate-500 uppercase">Warning</p>
                                <p className="text-sm font-bold text-amber-400">{data.summary.totalYellow}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-slate-500 uppercase">On-Track</p>
                                <p className="text-sm font-bold text-emerald-400">{data.summary.totalGreen}</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="bg-indigo-600 p-5 rounded-2xl text-white overflow-hidden relative group">
                        <div className="relative z-10">
                            <Zap className="w-5 h-5 mb-3 text-amber-400" />
                            <h3 className="text-base font-bold">Velocity Score</h3>
                            <p className="text-xs font-medium opacity-80 mt-1.5 leading-relaxed">
                                Institution processes <span className="font-bold border-b border-amber-400">14.2k data points</span> daily.
                            </p>
                            <button className="mt-5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-all">
                                Efficiency Report <Activity className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrincipalAnalytics;
