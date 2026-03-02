import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Activity, FileText, ChevronRight,
    Search, Clock
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

    const getActionColor = (action: string) => {
        if (action?.includes('locked')) return 'text-amber-600 bg-amber-50 border-amber-100';
        if (action?.includes('published')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (action?.includes('escalated')) return 'text-red-600 bg-red-50 border-red-100';
        return 'text-slate-600 bg-slate-50 border-slate-100';
    };

    const filtered = logs.filter(l =>
        !search || l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.performedBy?.fullName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-5 space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" /> Audit Trail
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">Immutable timeline of critical institutional policy actions.</p>
                </div>
                <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search actions..."
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-52"
                    />
                </div>
            </motion.div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Timestamp</th>
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Performer</th>
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Target</th>
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 whitespace-nowrap">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                                        {search ? 'No matching audit entries.' : 'No audit logs found.'}
                                    </td>
                                </tr>
                            )}
                            {filtered.map((log, i) => (
                                <motion.tr
                                    key={log._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                <Clock className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">{new Date(log.timestamp).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-medium text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-full font-bold text-[10px] flex items-center justify-center w-7 h-7 ${log.performedBy?.role === 'hod' ? 'bg-purple-100 text-purple-600' :
                                                log.performedBy?.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {(log.performedBy?.fullName || log.performedBy?.username || '?')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-800">{log.performedBy?.fullName || log.performedBy?.username}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.performedBy?.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="text-xs font-semibold text-slate-700">{log.action}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="text-xs font-medium text-slate-500">{log.targetModel}</p>
                                        {log.details?.subjectName && <p className="text-[10px] font-bold text-indigo-400">{log.details.subjectName}</p>}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getActionColor(log.action)}`}>
                                            Success
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-300 hover:text-indigo-600 hover:border-indigo-100 transition-all opacity-0 group-hover:opacity-100">
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                <div className="px-5 py-3 border-t border-slate-50 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-slate-300" />
                    <p className="text-[11px] text-slate-400 font-medium">{filtered.length} entries {search && `matching "${search}"`}</p>
                </div>
            </div>
        </div>
    );
};

export default PrincipalAuditLogs;
