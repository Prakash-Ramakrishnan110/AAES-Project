import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import {
    Search, Plus, Send, AlertTriangle, Megaphone,
    CheckCircle,
    Info, ChevronRight,
    ArrowRight, Shield, X, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
    user?: {
        fullName: string;
        department: string;
        role: string;
    }
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    Info: { icon: <Info className="w-3.5 h-3.5" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    Success: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    Warning: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    Alert: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    Grading: { icon: <Megaphone className="w-3.5 h-3.5" />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
};

const DEPARTMENTS = ['All', 'CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE'];

const PrincipalCommunications = () => {
    const { token } = useContext(AuthContext)!;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [deptFilter, setDeptFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showCompose, setShowCompose] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState<Notification | null>(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({ title: '', message: '', targetGroup: 'all_students' });

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => { fetchNotifications(); }, [token, deptFilter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const url = `${API}/api/notifications/principal/all${deptFilter !== 'All' ? `?department=${deptFilter}` : ''}`;
            const res = await axios.get(url, config);
            setNotifications(res.data || []);
        } catch (err) { console.error('Failed to fetch:', err); }
        finally { setLoading(false); }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.post(`${API}/api/notifications/send`, formData, config);
            setSuccess('Transmission Successful');
            setFormData({ title: '', message: '', targetGroup: 'all_students' });
            fetchNotifications();
            setTimeout(() => { setShowCompose(false); setSuccess(null); }, 1500);
        } catch (err: any) { setError(err.response?.data?.message || 'Transmission Failed'); }
        finally { setSending(false); }
    };

    const filtered = notifications.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-indigo-100">
            {/* Unified Top Header Context */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-40 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase first-letter:uppercase">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                            <Send className="w-5 h-5 text-indigo-600" /> Communications
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Institutional Broadcast Hub</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search registry..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 rounded-xl text-xs font-bold transition-all w-full md:w-[240px] outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setShowCompose(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-slate-200"
                        >
                            <Plus className="w-3.5 h-3.5" /> New Broadcast
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Channel Selector */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="space-y-4 px-4 py-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                            <div className="space-y-1 px-2">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                                    <Megaphone className="w-5 h-5 text-indigo-600" /> Briefings
                                </h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Notification Ledger</p>
                            </div>

                            <button
                                onClick={() => setShowCompose(true)}
                                className="w-full px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                            >
                                <Plus className="w-4 h-4" /> Issue Circular
                            </button>

                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search archives..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-xs font-bold transition-all w-full outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Channel Overlays</p>
                            {DEPARTMENTS.map((dept) => (
                                <button
                                    key={dept}
                                    onClick={() => setDeptFilter(dept)}
                                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black transition-all border ${deptFilter === dept
                                        ? 'bg-white shadow-lg shadow-indigo-50 border-indigo-100 text-indigo-600'
                                        : 'text-slate-400 border-transparent hover:bg-white hover:border-slate-100 hover:text-slate-600'
                                        }`}
                                >
                                    <span className="uppercase tracking-widest font-black leading-none">{dept} {dept === 'All' ? 'Institutional' : ''}</span>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${deptFilter === dept ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Ledger Area */}
                    <div className="lg:col-span-9">
                        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                            <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Archives</span>
                                </div>
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                                    {filtered.length} Briefings Loaded
                                </span>
                            </div>

                            <div className="flex-1">
                                {filtered.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {filtered.map((n, i) => {
                                            const cfg = typeConfig[n.type] || typeConfig['Info'];
                                            return (
                                                <motion.div
                                                    key={n._id}
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    onClick={() => setSelectedMsg(n)}
                                                    className="group cursor-pointer hover:bg-slate-50/50 transition-all py-6 px-10 flex items-center gap-8 relative overflow-hidden"
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center border ${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm group-hover:scale-105 transition-transform`}>
                                                        {cfg.icon}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{n.title}</h3>
                                                            {n.type === 'Alert' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                                                        </div>
                                                        <p className="text-[11px] font-medium text-slate-500 truncate uppercase tracking-tight opacity-70">
                                                            {n.message}
                                                        </p>
                                                    </div>

                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-[10px] font-black text-slate-800 uppercase tabular-nums">
                                                            {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase opacity-60">
                                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>

                                                    <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all opacity-0 group-hover:opacity-100">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-40 opacity-30">
                                        <Shield className="w-16 h-16 mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Quietness</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Structured Compose Modal */}
            <AnimatePresence>
                {showCompose && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Broadcast Message</h3>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Official Circular Entry 2026</p>
                                </div>
                                <button onClick={() => setShowCompose(false)} className="p-3 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSend} className="p-10 space-y-8">
                                {error && <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">{error}</div>}
                                {success && <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3"><Zap className="w-4 h-4" /> {success}</div>}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Distribution Hub</label>
                                    <select
                                        value={formData.targetGroup}
                                        onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-xs font-black focus:bg-white focus:border-indigo-300 transition-all outline-none appearance-none cursor-pointer uppercase tracking-widest"
                                    >
                                        <option value="all_students">Global Student Population</option>
                                        <option value="all_staff">Global Faculty Registry</option>
                                        <option value="all_department">Target Department Cluster</option>
                                        <option value="all_hods">Administrative Leadership (HODs)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Briefing Header</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-xs font-black focus:bg-white focus:border-indigo-300 transition-all outline-none uppercase tracking-widest"
                                        placeholder="Enter subject code..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Institutional Substance</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-xs font-bold focus:bg-white focus:border-indigo-300 transition-all outline-none resize-none leading-relaxed"
                                        placeholder="Draft official directive..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3"
                                >
                                    {sending ? 'Transmitting...' : 'Execute Distribution'} <Zap className="w-4 h-4" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Message Detail Modal */}
            <AnimatePresence>
                {selectedMsg && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{selectedMsg.type} OFFICIAL ARCHIVE</p>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedMsg.title}</h3>
                                </div>
                                <button onClick={() => setSelectedMsg(null)} className="p-3 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-12">
                                <p className="text-sm font-medium text-slate-600 leading-[1.8] whitespace-pre-wrap mb-10 selection:bg-indigo-100">
                                    {selectedMsg.message}
                                </p>
                                <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-xs font-black text-white uppercase">
                                            {(selectedMsg.user?.fullName || 'A')[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{selectedMsg.user?.fullName || 'Registry'}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedMsg.user?.role || 'Admin'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col justify-center">
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                                            {new Date(selectedMsg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">Verified Distribution</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrincipalCommunications;
