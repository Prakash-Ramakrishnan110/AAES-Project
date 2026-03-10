import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Activity, FileText,
    Search, Clock, ShieldCheck, Download
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PrincipalAuditLogs = () => {
    const { token } = useContext(AuthContext)!;
    const location = useLocation();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = new URLSearchParams(location.search);
    const [search, setSearch] = useState(searchParams.get('dept') || '');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/governance/principal/audit-logs`, config);
                setLogs(data);
            } catch (error) {
                console.error('Error fetching audit logs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [token]);

    const downloadLogs = () => {
        try {
            const headers = "Timestamp,Actor,Role,Action,Target,Details\n";
            const rows = filtered.map(log =>
                `${new Date(log.timestamp).toLocaleString()},${log.performedBy?.fullName || log.performedBy?.username},${log.performedBy?.role},${log.action},${log.targetModel},${JSON.stringify(log.details || {})}`
            ).join("\n");
            const blob = new Blob([headers + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Institutional_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        } catch (e) {
            console.error('Export failed', e);
        }
    };

    const getActionColor = (action: string) => {
        if (action?.includes('locked')) return 'text-amber-600 bg-amber-50 border-amber-100';
        if (action?.includes('published')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (action?.includes('escalated')) return 'text-rose-600 bg-rose-50 border-rose-100';
        return 'text-slate-500 bg-slate-50 border-slate-100';
    };

    const filtered = logs.filter(l =>
        !search || l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.performedBy?.fullName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Accessing Institutional Audit Trail...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-indigo-100">
            {/* Sub-header Context */}
            {/* Unified Top Header Context */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-40 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase first-letter:uppercase">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" /> Audit Trail
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Immutable Governance Ledger</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search audit logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 rounded-xl text-xs font-bold transition-all w-full md:w-[280px] outline-none"
                            />
                        </div>
                        <button
                            onClick={downloadLogs}
                            className="p-2.5 bg-slate-900 text-white hover:bg-indigo-600 rounded-xl transition-all shadow-lg shadow-slate-200"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10">
                <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional actor</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Governance action</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Target Model</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Integrity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching audit records</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((log, i) => (
                                        <motion.tr
                                            key={log._id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.01 }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 rounded-lg transition-colors">
                                                        <Clock className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{new Date(log.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                                        <p className="text-[10px] font-medium text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase ${log.performedBy?.role === 'hod' ? 'bg-purple-100 text-purple-600' :
                                                        log.performedBy?.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {(log.performedBy?.fullName || 'P')[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700">{log.performedBy?.fullName || log.performedBy?.username}</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{log.performedBy?.role || 'System'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">{log.targetModel}</p>
                                                    {log.details?.subjectName && <p className="text-[10px] font-medium text-indigo-400 uppercase">{log.details.subjectName}</p>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-slate-300" />
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{filtered.length} Secure Entries Registered</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrincipalAuditLogs;
