import { useState, useEffect, useContext, cloneElement } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Users, AlertTriangle, Activity, CheckCircle,
    Building2, ShieldAlert, Layers, Shield,
    Filter, TrendingUp, BarChart2 as BarIcon, Clock
} from 'lucide-react';
import EmergencyBroadcast from '../../components/principal/EmergencyBroadcast';
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

const PrincipalDashboard = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();
    const [summary, setSummary] = useState<any>(null);
    const [deptComparison, setDeptComparison] = useState<any[]>([]);
    const [escalationLevels, setEscalationLevels] = useState({ mentor: 0, advisor: 0, hod: 0 });
    const [goals, setGoals] = useState<any[]>([]);
    const [forecast, setForecast] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [principalAttendance, setPrincipalAttendance] = useState<any[]>([]);

    useEffect(() => {
        if (!token) return;
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/governance/principal/dashboard`, config);
                setSummary(data.summary);
                setDeptComparison(data.departmentComparison || []);
                setEscalationLevels(data.escalationLevels || { mentor: 0, advisor: 0, hod: 0 });

                const [goalsRes, forecastRes, attendanceRes] = await Promise.all([
                    axios.get(`${API}/api/governance/principal/goals`, config),
                    axios.get(`${API}/api/analytics/principal/forecast`, config),
                    axios.get(`${API}/api/attendance/principal`, config)
                ]);
                setGoals(goalsRes.data || []);
                setForecast(forecastRes.data);
                setPrincipalAttendance(attendanceRes.data || []);
            } catch (e) {
                console.error('Principal dashboard error', e);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [token]);

    const s = summary || { totalStudents: 0, totalRed: 0, totalYellow: 0, totalGreen: 0, activeEscalations: 0 };
    
    // Risk Calculation
    const rawRisk = s.totalStudents > 0 ? ((s.totalRed + s.totalYellow) / s.totalStudents * 100) : 0;
    const riskPct = isNaN(rawRisk) || !isFinite(rawRisk) ? '0.0' : rawRisk.toFixed(1);
    
    const onTrackPct = s.totalStudents > 0 ? ((s.totalGreen / s.totalStudents) * 100).toFixed(0) : '0';

    useEffect(() => {
        if (!loading) {
            setHeaderOptions({
                title: 'Institutional Governance Intelligence',
                subtitle: (
                    <span>Welcome, <span className="text-slate-900 font-bold">Principal</span> · Campus-wide Academic Oversight</span>
                ),
                actions: (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowBroadcastModal(true)}
                            className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-100"
                        >
                            <AlertTriangle className="w-4 h-4" /> Emergency Broadcast
                        </button>
                    </div>
                )
            });
        }
    }, [loading, setHeaderOptions]);

    const globalAvgAttendance = principalAttendance.length > 0 
        ? Math.round(principalAttendance.reduce((acc, dept) => acc + (dept.avgAttendance || 0), 0) / principalAttendance.length)
        : 0;

    const kpis = [
        { label: 'Total Enrollment', value: s.totalStudents.toLocaleString(), icon: <Users />, color: 'blue', link: '/principal/departments' },
        { label: 'Institutional Attendance', value: `${globalAvgAttendance}%`, icon: <Clock />, color: 'blue', link: '/principal/attendance' },
        { label: 'Risk Assessment', value: `${s.totalRed + s.totalYellow}`, sub: `${riskPct}% Attention`, icon: <ShieldAlert />, color: 'red', link: '/principal/risk' },
        { label: 'Compliance Rate', value: `${onTrackPct}%`, icon: <CheckCircle />, color: 'green', link: '/principal/analytics' },
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
                            <Skeleton height={400} className="w-full rounded-3xl" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton height={200} className="w-full rounded-3xl" />
                            <Skeleton height={184} className="w-full rounded-3xl" />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Operational KPIs */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {kpis.map((kpi) => (
                            <StatCard key={kpi.label} {...kpi} />
                        ))}
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 space-y-4">
                            {/* Departmental Intelligence */}
                            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                                <SectionCard 
                                    title="Departmental Compliance" 
                                    subtitle="Academic aggregate analysis"
                                    icon={<BarIcon />}
                                >
                                    <div className="space-y-5 pt-3">
                                        {deptComparison.length === 0 ? (
                                            <div className="py-10 text-center text-slate-400 font-medium text-xs">No departmental data synchronized</div>
                                        ) : (
                                            deptComparison.map((dept, i) => (
                                                <div key={dept.name || i} className="group">
                                                    <div className="flex justify-between items-end mb-2 px-1">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900 text-[14px] leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{dept.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Faculty Unit</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-[12px] font-black tabular-nums ${dept.onTrack > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{dept.onTrack}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${dept.onTrack}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className={`h-full rounded-full ${dept.onTrack > 80 ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.2)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]'}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </SectionCard>
                            </motion.div>

                            {/* Institutional Vision */}
                            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                                <SectionCard 
                                    title="Strategic Objectives" 
                                    subtitle="Institutional framework tracking"
                                    icon={<Layers />}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                                        {goals.length === 0 ? (
                                            <div className="col-span-full py-10 text-center text-slate-400 font-medium text-xs">No strategic goals defined</div>
                                        ) : (
                                            goals.map((goal: any) => (
                                                <div key={goal._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <p className="text-[14px] font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{goal.title}</p>
                                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-black">{goal.progress}%</div>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden mb-3">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${goal.progress}%` }}
                                                            className="h-full bg-blue-600" 
                                                        />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{goal.description}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </SectionCard>
                            </motion.div>

                            {/* Campus Roll Call Stream */}
                            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                                <SectionCard 
                                    title="Campus Roll Call Stream" 
                                    subtitle="Live morning attendance across departments"
                                    icon={<Clock />}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                                        {principalAttendance.flatMap(dept => 
                                            (dept.recentMorningSessions || []).map((session: any) => ({
                                                ...session,
                                                department: dept.department
                                            }))
                                        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4).map((session, i) => (
                                            <div 
                                                key={i} 
                                                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all group cursor-pointer"
                                                onClick={() => navigate('/principal/attendance')}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-[12px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{session.department}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">
                                                            {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {session.academicYear}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[14px] font-black text-slate-900 tabular-nums">
                                                            {Math.round((session.present / session.total) * 100)}%
                                                        </div>
                                                        <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Present</div>
                                                    </div>
                                                </div>
                                                <div className="h-1 w-full bg-slate-200/50 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(session.present / session.total) * 100}%` }}
                                                        className="h-full bg-blue-600" 
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {principalAttendance.length > 0 && principalAttendance.every(d => !d.recentMorningSessions?.length) && (
                                            <div className="col-span-full py-10 text-center text-slate-400 font-medium text-xs italic">No campus roll calls recorded today</div>
                                        )}
                                    </div>
                                </SectionCard>
                            </motion.div>
                        </div>

                        <div className="space-y-4">
                            {/* Intervention Funnel */}
                            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                                <SectionCard 
                                    title="Intervention Stream" 
                                    subtitle="Governance flow"
                                    icon={<Filter />}
                                >
                                    <div className="space-y-2 pt-2">
                                        {[
                                            { label: 'HOD Governance', value: escalationLevels.hod, color: 'text-rose-600', bg: 'bg-rose-50', icon: ShieldAlert },
                                            { label: 'Advisor Review', value: escalationLevels.advisor, color: 'text-amber-600', bg: 'bg-amber-50', icon: Activity },
                                            { label: 'Mentor Support', value: escalationLevels.mentor, color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
                                        ].map((level) => (
                                            <div key={level.label} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-9 h-9 ${level.bg} ${level.color} rounded-xl flex items-center justify-center`}>
                                                        <level.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-slate-700 tracking-tight">{level.label}</span>
                                                </div>
                                                <span className={`text-[14px] font-black tabular-nums px-2.5 py-1 rounded-lg ${level.value > 0 ? `${level.bg} ${level.color}` : 'text-slate-300'}`}>{level.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </SectionCard>
                            </motion.div>

                            {/* Strategic Forecast */}
                            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                                <SectionCard 
                                    title="Institutional Prediction" 
                                    subtitle="A.I. Predictive Analytics"
                                    className="bg-slate-900 border-none text-white shadow-2xl relative overflow-hidden"
                                    dark
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16" />
                                    <div className="pt-4 space-y-5 relative z-10">
                                        {forecast ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Yield Prediction</span>
                                                        <div className="text-4xl font-bold text-white tabular-nums tracking-tighter">{forecast.predictedYield}%</div>
                                                    </div>
                                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                                        <TrendingUp className="text-emerald-400 w-8 h-8" />
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <p className="text-[11px] font-medium text-slate-300 leading-relaxed italic">
                                                        "{forecast.rationale}"
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/principal/analytics')}
                                                    className="w-full bg-white text-slate-900 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-100 transition-all"
                                                >
                                                    Analysis Deep-Dive
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">Syncing AI Core...</div>
                                        )}
                                    </div>
                                </SectionCard>
                            </motion.div>
                        </div>
                    </div>

                    {/* Infrastructure Sync */}
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                        {[
                            { label: 'Architecture', value: 'Cluster Nominal', icon: Building2 },
                            { label: 'Administrative', value: 'Sync Active', icon: Users },
                            { label: 'Security', value: 'Protocols Verified', icon: Shield },
                        ].map((item, i) => (
                            <motion.div 
                                variants={itemVariants}
                                key={i} 
                                className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 hover:shadow-lg hover:shadow-slate-100 group transition-all"
                            >
                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                                    <item.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-all" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{item.label}</p>
                                    <p className="text-[14px] font-bold text-slate-800 tracking-tight uppercase">{item.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </>
            )}

            <EmergencyBroadcast isOpen={showBroadcastModal} onClose={() => setShowBroadcastModal(false)} token={token || ''} />
        </div>
    );
};

const StatCard = ({ label, value, icon, color, link, sub }: any) => {
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
            className="glass-card premium-lift flex items-center gap-5 px-6 cursor-pointer h-[120px]"
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                {cloneElement(icon as any, { size: 22, strokeWidth: 2.5 })}
            </div>
            <div className="min-w-0 flex-1 text-left">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] truncate">{label}</p>
                <div className="flex flex-col mt-1">
                    <h3 className="text-2xl font-black text-slate-900 leading-none">{value}</h3>
                    {sub && <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase truncate tracking-wide">{sub}</p>}
                </div>
            </div>
        </motion.div>
    );
};

export default PrincipalDashboard;
