import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Users, AlertTriangle, Activity, CheckCircle,
    Building2, Globe, FileText, Settings, ShieldAlert,
    LayoutDashboard, ChevronRight, TrendingDown, Shield, Layers
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PrincipalDashboard = () => {
    const { token, user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [summary, setSummary] = useState<any>(null);
    const [deptComparison, setDeptComparison] = useState<any[]>([]);
    const [escalationLevels, setEscalationLevels] = useState({ mentor: 0, advisor: 0, hod: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const fetchDashboard = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/governance/principal/dashboard`, config);
                setSummary(data.summary);
                setDeptComparison(data.departmentComparison || []);
                setEscalationLevels(data.escalationLevels || { mentor: 0, advisor: 0, hod: 0 });
            } catch (e) {
                console.error('Principal dashboard error', e);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [token]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const s = summary || { totalStudents: 0, totalRed: 0, totalYellow: 0, totalGreen: 0, activeEscalations: 0 };
    const riskPct = s.totalStudents > 0 ? ((s.totalRed + s.totalYellow) / s.totalStudents * 100).toFixed(1) : '0.0';
    const onTrackPct = s.totalStudents > 0 ? ((s.totalGreen / s.totalStudents) * 100).toFixed(0) : '0';

    const kpis = [
        { label: 'Total Enrollment', value: s.totalStudents.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/principal/departments' },
        { label: 'At-Risk Students', value: `${s.totalRed + s.totalYellow}`, sub: `${riskPct}% of total`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', link: '/principal/risk' },
        { label: 'Active Escalations', value: `${s.activeEscalations}`, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', link: '/principal/risk' },
        { label: 'On-Track Ratio', value: `${onTrackPct}%`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/principal/analytics' },
    ];

    const navTiles = [
        { icon: Building2, label: 'Infrastructure', sub: 'Departments & facilities', to: '/principal/departments', color: 'from-indigo-500 to-indigo-600' },
        { icon: ShieldAlert, label: 'Institutional Risk', sub: 'Student risk intelligence', to: '/principal/risk', color: 'from-red-500 to-red-600' },
        { icon: Globe, label: 'Global Insights', sub: 'Analytics & trends', to: '/principal/analytics', color: 'from-blue-500 to-blue-600' },
        { icon: Users, label: 'Administrative Staff', sub: 'Staff management', to: '/principal/staff', color: 'from-purple-500 to-purple-600' },
        { icon: FileText, label: 'Audit Logs', sub: 'Governance trails', to: '/principal/audit', color: 'from-amber-500 to-amber-600' },
        { icon: Settings, label: 'System Settings', sub: 'Configuration', to: '/principal/settings', color: 'from-gray-500 to-gray-600' },
    ];

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AAES &ndash; Principal Panel</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Principal'}. Here is your institution overview.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-700">System Active</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <div
                            onClick={() => navigate(kpi.link)}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className={`p-4 rounded-xl ${kpi.bg} group-hover:scale-110 transition-transform`}>
                                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                                {kpi.sub && <p className="text-[10px] text-gray-400 font-medium">{kpi.sub}</p>}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Department Risk + Escalation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dept Risk Matrix */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            <h2 className="font-semibold text-gray-800">Department Risk Matrix</h2>
                        </div>
                        <button onClick={() => navigate('/principal/risk')}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            View All <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="p-5 space-y-4">
                        {deptComparison.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-8">No department data available yet</p>
                        ) : deptComparison.map((dept, i) => {
                            const redPct = dept.total > 0 ? (dept.red / dept.total) * 100 : 0;
                            const yellowPct = dept.total > 0 ? (dept.yellow / dept.total) * 100 : 0;
                            const greenPct = 100 - redPct - yellowPct;
                            return (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                                        <span>{dept.department}</span>
                                        <span className="text-gray-400">Total: {dept.total}</span>
                                    </div>
                                    <div className="h-3 bg-gray-50 rounded-full overflow-hidden flex shadow-inner">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${redPct}%` }}
                                            transition={{ delay: i * 0.1 }} className="h-full bg-red-500" />
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${yellowPct}%` }}
                                            transition={{ delay: i * 0.1 + 0.1 }} className="h-full bg-amber-400 border-l border-white/20" />
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${greenPct}%` }}
                                            transition={{ delay: i * 0.1 + 0.2 }} className="h-full bg-emerald-400 border-l border-white/20" />
                                    </div>
                                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wide">
                                        <span className="text-red-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> {dept.red} Critical
                                        </span>
                                        <span className="text-amber-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> {dept.yellow} Warning
                                        </span>
                                        <span className="text-emerald-600 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> {dept.total - dept.red - dept.yellow} Good
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Escalation Funnel */}
                <div className="bg-indigo-900 rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Layers className="w-4 h-4 opacity-60" />
                            <h2 className="text-sm font-bold">Escalation Funnel</h2>
                        </div>
                        <p className="text-[11px] text-indigo-200 mb-5">Active cases across admin levels</p>

                        <div className="space-y-3">
                            {[
                                { level: 'HOD Level', count: escalationLevels.hod, icon: Shield, color: 'bg-indigo-600' },
                                { level: 'Advisor Level', count: escalationLevels.advisor, icon: LayoutDashboard, color: 'bg-indigo-700' },
                                { level: 'Mentor Level', count: escalationLevels.mentor, icon: Users, color: 'bg-indigo-800' },
                            ].map((item, i) => (
                                <div key={i} className={`${item.color} p-3 rounded-xl flex items-center justify-between border border-white/10`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-white/10 rounded-lg">
                                            <item.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-semibold text-sm">{item.level}</span>
                                    </div>
                                    <span className="text-xl font-bold">{item.count}</span>
                                </div>
                            ))}
                        </div>

                        {s.totalRed > 0 && (
                            <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/10">
                                <p className="text-[10px] font-bold opacity-60 mb-0.5 uppercase tracking-wider">Action Required</p>
                                <p className="text-xs font-medium">
                                    <span className="text-amber-400 font-bold">{s.totalRed} students</span> need immediate intervention
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl" />
                </div>
            </div>

            {/* Quick Access */}
            <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4" /> Quick Access
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {navTiles.map((tile, i) => (
                        <motion.div
                            key={tile.to}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                        >
                            <div
                                onClick={() => navigate(tile.to)}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tile.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100`}>
                                    <tile.icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm font-bold text-gray-800">{tile.label}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{tile.sub}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingDown className="w-4 h-4" /></div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Risk Trend</p>
                        <h4 className="text-base font-bold text-emerald-600">-12.4% <span className="text-[11px] text-gray-400 font-medium ml-1">vs last month</span></h4>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Globe className="w-4 h-4" /></div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dept Coverage</p>
                        <h4 className="text-base font-bold text-gray-800">98.2% <span className="text-[11px] text-gray-400 font-medium ml-1">synced</span></h4>
                    </div>
                </div>
                <div
                    onClick={() => navigate('/principal/audit')}
                    className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100"><Shield className="w-4 h-4" /></div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">View Audit Logs</p>
                            <p className="text-[11px] text-gray-400">Governance trails</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                </div>
            </div>
        </div>
    );
};

export default PrincipalDashboard;
