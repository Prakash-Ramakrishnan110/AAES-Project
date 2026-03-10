import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Calendar, CheckCircle2, Clock, XCircle,
    Search, AlertCircle, Building, Filter,
    ArrowRight, Activity, Target
} from 'lucide-react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PrincipalLeaves = () => {
    const { token } = useContext(AuthContext)!;
    const [leaves, setLeaves] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [leavesRes, statsRes] = await Promise.all([
                    axios.get(`${API}/api/student-leaves/institutional`, config),
                    axios.get(`${API}/api/student-leaves/stats`, config)
                ]);
                setLeaves(leavesRes.data.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Error fetching principal leaves', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const filteredLeaves = leaves.filter(l => {
        const matchesSearch =
            (l.studentId?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.studentId?.registerNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.department || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'All' || l.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Compiling Attendance Sovereignty...</p>
            </div>
        </div>
    );

    const summaryCards = [
        { label: 'System Requests', count: leaves.length, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
        { label: 'Authorized', count: stats?.summary?.Approved || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
        { label: 'Pending Review', count: stats?.summary?.Pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50' },
        { label: 'Declined', count: stats?.summary?.Rejected || 0, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50/50' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-indigo-100">
            {/* Unified Top Header Context */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-40 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase first-letter:uppercase">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                            <Clock className="w-5 h-5 text-indigo-600" /> Institutional Leaves
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Administrative Personnel Oversight</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search student registry..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 rounded-xl text-xs font-bold transition-all w-full md:w-[280px] outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-9 pr-8 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {summaryCards.map((card, i) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:shadow-md hover:border-indigo-100 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-100 group-hover:text-indigo-200 transition-colors" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{card.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{card.count}</h3>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Request Log */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500" /> Recent Global Notifications
                            </h3>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">{filteredLeaves.length} Active Handles</span>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <th className="px-8 py-5">Academic Reference</th>
                                            <th className="px-8 py-5">Institutional Unit</th>
                                            <th className="px-8 py-5 text-center">Temporal Span</th>
                                            <th className="px-8 py-5 text-right">Protocol Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 whitespace-nowrap">
                                        {filteredLeaves.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center">
                                                    <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active leave telemetry matching filters</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLeaves.map((leave) => (
                                                <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                                                {(leave.studentId?.fullName || 'S')[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{leave.studentId?.fullName || 'Unknown Unit'}</p>
                                                                <p className="text-[10px] font-bold text-slate-400">{leave.studentId?.registerNumber || 'ID-REDACTED'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-500 border border-slate-200">
                                                            <Building className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-black uppercase tracking-tight">{leave.department || 'General'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="text-[10px] font-black text-slate-700 uppercase">{new Date(leave.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase">to {new Date(leave.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {leave.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Side Intelligence */}
                    <div className="space-y-8">
                        <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-indigo-400 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Global Load Analysis
                                </h3>
                                <div className="space-y-6">
                                    {stats?.byDepartment?.map((dept: any, i: number) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-80">
                                                <span className="text-slate-400">{dept._id || 'General'}</span>
                                                <span className="text-indigo-300">{dept.count} Req</span>
                                            </div>
                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(dept.count / leaves.length) * 100}%` }}
                                                    className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-[60px] group-hover:bg-indigo-600/30 transition-colors" />
                        </section>

                        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Institutional Sovereignty</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                "Macro-level leave intelligence is synchronized for board-level oversight. Local operational approvals remain delegated to departmental heads unless escalated via Governance Risk Protocol."
                            </p>
                            <button className="w-full py-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">
                                Request Full Audit Export
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrincipalLeaves;
