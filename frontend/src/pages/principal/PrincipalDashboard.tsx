import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Users, AlertTriangle, Activity, CheckCircle,
    Building2, Globe, ShieldAlert,
    ChevronRight, Shield, Layers,
    Filter, ArrowUpRight
} from 'lucide-react';
import EmergencyBroadcast from '../../components/principal/EmergencyBroadcast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PrincipalDashboard = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [summary, setSummary] = useState<any>(null);
    const [deptComparison, setDeptComparison] = useState<any[]>([]);
    const [escalationLevels, setEscalationLevels] = useState({ mentor: 0, advisor: 0, hod: 0 });
    const [goals, setGoals] = useState<any[]>([]);
    const [forecast, setForecast] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);

    useEffect(() => {
        if (!token) return;
        const fetchDashboard = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/governance/principal/dashboard`, config);
                setSummary(data.summary);
                setDeptComparison(data.departmentComparison || []);
                setEscalationLevels(data.escalationLevels || { mentor: 0, advisor: 0, hod: 0 });

                const [goalsRes, forecastRes] = await Promise.all([
                    axios.get(`${API}/api/governance/principal/goals`, config),
                    axios.get(`${API}/api/analytics/principal/forecast`, config)
                ]);
                setGoals(goalsRes.data || []);
                setForecast(forecastRes.data);
            } catch (e) {
                console.error('Principal dashboard error', e);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [token]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Loading Executive Systems...</p>
            </div>
        </div>
    );

    const s = summary || { totalStudents: 0, totalRed: 0, totalYellow: 0, totalGreen: 0, activeEscalations: 0 };
    const riskPct = s.totalStudents > 0 ? ((s.totalRed + s.totalYellow) / s.totalStudents * 100).toFixed(1) : '0.0';
    const onTrackPct = s.totalStudents > 0 ? ((s.totalGreen / s.totalStudents) * 100).toFixed(0) : '0';

    const kpis = [
        { label: 'Total Enrollment', value: s.totalStudents.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', link: '/principal/departments' },
        { label: 'Risk Aperture', value: `${s.totalRed + s.totalYellow}`, sub: `${riskPct}% Critical/Warning`, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', link: '/principal/risk' },
        { label: 'Active Escalations', value: `${s.activeEscalations}`, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', link: '/principal/risk' },
        { label: 'Operational Health', value: `${onTrackPct}%`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', link: '/principal/analytics' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Unified Top Header Context */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-40 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase first-letter:uppercase">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                            <Activity className="w-5 h-5 text-indigo-600" /> Executive Dashboard
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Institutional Governance Hub</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowBroadcastModal(true)}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
                        >
                            <AlertTriangle className="w-3.5 h-3.5" /> Emergency Broadcast
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-10">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => navigate(kpi.link || '#')}
                            className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} border ${kpi.border}`}>
                                    <kpi.icon className="w-5 h-5" />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</h3>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
                            </div>
                            {kpi.sub && <p className="text-[10px] font-bold text-slate-400 mt-1">{kpi.sub}</p>}
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Analytics Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Departmental Comparison */}
                        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Departmental Performance Index</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Academic Compliance Matrix</p>
                                </div>
                                <Activity className="w-4 h-4 text-slate-300" />
                            </div>
                            <div className="p-8 space-y-6">
                                {deptComparison.length > 0 ? (
                                    deptComparison.map((dept, i) => (
                                        <div key={dept.name || i} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{dept.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Yield: {dept.yield}%</span>
                                                    <span className={`text-[10px] font-black ${dept.onTrack > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{dept.onTrack}% Compliance</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${dept.onTrack}%` }}
                                                    className={`h-full ${dept.onTrack > 80 ? 'bg-indigo-600' : 'bg-amber-500'}`}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase">Consolidating Departmental Telemetry...</div>
                                )}
                            </div>
                        </section>

                        {/* Strategic Goals */}
                        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Strategic Goal Progress</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {goals.map((goal: any) => (
                                    <div key={goal._id} className="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors group">
                                        <div className="flex justify-between items-start mb-4">
                                            <p className="text-xs font-bold text-slate-900 line-clamp-2">{goal.title}</p>
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase">{goal.progress}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                                            <div className="h-full bg-indigo-600" style={{ width: `${goal.progress}%` }} />
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{goal.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar Status Area */}
                    <div className="space-y-8">
                        {/* Escalation Funnel */}
                        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Active Escalations</h3>
                                <Filter className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                            <div className="p-8 space-y-6">
                                {[
                                    { label: 'HOD Intervention', value: escalationLevels.hod, color: 'bg-rose-500', icon: ShieldAlert },
                                    { label: 'Advisor Review', value: escalationLevels.advisor, color: 'bg-amber-500', icon: Activity },
                                    { label: 'Mentor Support', value: escalationLevels.mentor, color: 'bg-indigo-500', icon: Users },
                                ].map((level) => (
                                    <div key={level.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-indigo-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${level.color} text-white`}>
                                                <level.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{level.label}</span>
                                        </div>
                                        <span className="text-lg font-bold text-slate-900">{level.value}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* A.I. Forecast */}
                        <section className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest text-[8px]">Intelligence Forecast</p>
                                </div>
                                {forecast ? (
                                    <div className="space-y-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold tracking-tighter">{forecast.predictedYield}%</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase">Predicted Yield</span>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic opacity-80 line-clamp-3">
                                            "{forecast.rationale}"
                                        </p>
                                        <div className="pt-4 border-t border-white/10">
                                            <button
                                                onClick={() => navigate('/principal/analytics')}
                                                className="w-full py-3 bg-white/10 hover:bg-white text-white hover:text-slate-900 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                Full Analytics Report <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center text-slate-500 text-[10px] font-bold uppercase">Processing Future Vectors...</div>
                                )}
                            </div>
                            <Globe className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
                        </section>
                    </div>
                </div>

                {/* Footer Meta Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 border-t border-slate-200">
                    <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl">
                        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Infrastructure</p>
                            <p className="text-xs font-bold text-slate-900">14 Core Assets Active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl">
                        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty Sync</p>
                            <p className="text-xs font-bold text-slate-900">All Nodes Registered</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl">
                        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                            <Shield className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portal Authority</p>
                            <p className="text-xs font-bold text-slate-900">Executive Access Verified</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Emergency Broadcast Modal */}
            <EmergencyBroadcast
                isOpen={showBroadcastModal}
                onClose={() => setShowBroadcastModal(false)}
                token={token || ''}
            />
        </div>
    );
};

export default PrincipalDashboard;
