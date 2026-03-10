import { useState, useEffect, useContext } from 'react';
import {
    Calendar, Download, ChevronLeft, ChevronRight,
    Check, Search, Activity, Clock, Layers
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';



const PrincipalActivityLog = () => {
    const { token } = useContext(AuthContext)!;
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyLogs, setDailyLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchDailyLogs();
    }, [selectedDate]);

    const fetchDailyLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/timetable/activity-log/history`, {
                params: { startDate: selectedDate, endDate: selectedDate },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setDailyLogs(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const res = await axios.get(`${API_URL}/timetable/activity-log/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.data;
            const headers = "Date,Period,Time,Staff,Subject,Topic,Remarks\n";
            const rows = data.map((log: any) =>
                `${new Date(log.date).toLocaleDateString()},P${log.period},${log.time},${log.staffId?.fullName || 'N/A'},${log.subjectId?.name},${log.topicCovered},${log.remarks || ''}`
            ).join("\n");
            const blob = new Blob([headers + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Institutional_Log_${selectedDate}.csv`;
            a.click();
        } catch (e) { console.error('Export failed'); }
    };

    const navigateDate = (offset: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const filteredLogs = dailyLogs.filter(log =>
        !search ||
        log.staffId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        log.subjectId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        log.topicCovered?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => a.period - b.period);

    if (loading && dailyLogs.length === 0) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Retrieving Instructional Records...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-indigo-100">

            {/* Unified Top Header Context */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-40 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase first-letter:uppercase">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                            <Activity className="w-5 h-5 text-indigo-600" /> Activity Log
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Instructional Telemetry Ledger</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
                            <button onClick={() => navigateDate(-1)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-2 px-3">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-transparent text-xs font-bold text-slate-700 outline-none uppercase"
                                />
                            </div>
                            <button onClick={() => navigateDate(1)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter records..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 rounded-xl text-sm transition-all w-full md:w-[240px] outline-none"
                            />
                        </div>

                        <button onClick={handleDownloadCSV} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-xl transition-all shadow-sm">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10">
                <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5 w-24">Slot</th>
                                    <th className="px-8 py-5 w-32">Temporal Range</th>
                                    <th className="px-8 py-5 w-64">Academic Lead</th>
                                    <th className="px-8 py-5 w-64">Instructional Module</th>
                                    <th className="px-8 py-5">Topic Covered</th>
                                    <th className="px-8 py-5 text-right">Integrity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center">
                                                <Activity className="w-12 h-12 text-slate-200 mb-4" />
                                                <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No activity registered for this cycle</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log, i) => (
                                        <motion.tr
                                            key={log._id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">P{log.period}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {log.time || '--:--'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {(log.staffId?.fullName || '?')[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.staffId?.fullName || 'N/A'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.staffId?.department || 'Faculty'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{log.subjectId?.name || 'Academic Core'}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[11px] font-medium text-slate-600 leading-relaxed max-w-md">
                                                    {log.topicCovered || <span className="opacity-40 italic font-bold uppercase tracking-widest text-[9px]">Awaiting documentation</span>}
                                                </p>
                                                {log.remarks && (
                                                    <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md w-fit">
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Note:</span>
                                                        <span className="text-[9px] font-bold text-slate-400 italic font-medium">{log.remarks}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 group-hover:border-emerald-200 transition-colors">
                                                    <Check className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Validated</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-slate-300" />
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{filteredLogs.length} Validated Ledger Entries</p>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-indigo-400" /> Verified Record</span>
                            <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-slate-200" /> System Sync Active</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrincipalActivityLog;
