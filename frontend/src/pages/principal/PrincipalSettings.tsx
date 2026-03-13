import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Bell, User, Layout, Database,
    Save, Layers, Trash2,
    ShieldCheck, Zap,
    ChevronRight, X
} from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const settingsNav = [
    { icon: Shield, label: 'System Policy' },
    { icon: Bell, label: 'Notifications' },
    { icon: Layers, label: 'Performance Goals' },
    { icon: User, label: 'System Admins' },
    { icon: Layout, label: 'Layout Prefs' },
    { icon: Database, label: 'Secure Archiving' }
];

const PrincipalSettings = () => {
    const { token } = useContext(AuthContext)!;
    const [activeTab, setActiveTab] = useState(0);
    const [threshold, setThreshold] = useState(2);
    const [inactivity, setInactivity] = useState(7);
    const [admins, setAdmins] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [goals, setGoals] = useState<any[]>([]);
    const [savingGoals, setSavingGoals] = useState(false);

    const [alerts, setAlerts] = useState({
        escalations: true,
        riskHeatmap: true,
        infraCritical: false,
        auditLogs: true
    });

    const [retention, setRetention] = useState(365);

    useEffect(() => {
        if (activeTab === 3) fetchAdmins();
        if (activeTab === 2 || activeTab === 0) fetchGoals();
    }, [activeTab]);

    const fetchGoals = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/settings/goals`, config);
            setGoals(data || []);
        } catch (error) {
            console.error('Error fetching goals', error);
        }
    };

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/users`, config);
            setAdmins(data.filter((u: any) => u.role === 'admin'));
        } catch (error) {
            console.error('Error fetching admins', error);
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleSave = () => {
        setToast('Institutional Configuration Synchronized');
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveGoals = async () => {
        setSavingGoals(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/settings/goals`, { goals }, config);
            setToast('Performance Goals Updated');
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            console.error('Error saving goals', error);
        } finally {
            setSavingGoals(false);
        }
    };

    const addGoal = () => {
        setGoals([...goals, { key: '', target: 100, current: 0, unit: '%', deadline: new Date().toISOString().split('T')[0] }]);
    };

    const updateGoal = (index: number, field: string, value: any) => {
        const newGoals = [...goals];
        newGoals[index] = { ...newGoals[index], [field]: value };
        setGoals(newGoals);
    };

    const removeGoal = (index: number) => {
        setGoals(goals.filter((_g, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-indigo-100">
            {/* Sub-header Context */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-40 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase first-letter:uppercase">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                            <Shield className="w-5 h-5 text-indigo-600" /> System Settings
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Institutional Management Control</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> System Security Active
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-2">
                        {settingsNav.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`w-full flex items-center justify-between group px-6 py-4 rounded-2xl transition-all border ${activeTab === i
                                    ? 'bg-white shadow-lg shadow-indigo-50 border-indigo-100 text-indigo-600'
                                    : 'text-slate-400 border-transparent hover:bg-white hover:border-slate-100 hover:text-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={`w-4 h-4 ${activeTab === i ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-400'}`} />
                                    <span className={`text-xs font-black uppercase tracking-widest ${activeTab === i ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTab === i ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px] flex flex-col"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{settingsNav[activeTab].label}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional configuration parameters</p>
                                </div>
                                {activeTab !== 2 && (
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                                    >
                                        <Save className="w-3.5 h-3.5" /> Commit Changes
                                    </button>
                                )}
                            </div>

                            <div className="p-10 flex-1">
                                <AnimatePresence mode="wait">
                                    {activeTab === 0 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 group hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Escalation Threshold</h4>
                                                        <span className="text-2xl font-black text-indigo-600">{threshold}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium mb-6 leading-relaxed uppercase">Consecutive RED assessment nodes required to trigger automated principal-level intervention.</p>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => setThreshold(t => Math.max(1, t - 1))} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold hover:border-indigo-500 transition-colors">-</button>
                                                        <button onClick={() => setThreshold(t => t + 1)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold hover:border-indigo-500 transition-colors">+</button>
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 group hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Inactivity Lifecycle</h4>
                                                        <span className="text-2xl font-black text-indigo-600">{inactivity}d</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium mb-6 leading-relaxed uppercase">Operational latency period permitted before governance tokens are auto-escalated to oversight.</p>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => setInactivity(t => Math.max(1, t - 1))} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold hover:border-indigo-500 transition-colors">-</button>
                                                        <button onClick={() => setInactivity(t => t + 1)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold hover:border-indigo-500 transition-colors">+</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4 items-start">
                                                <Shield className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
                                                <p className="text-[11px] font-black text-rose-800 leading-relaxed uppercase tracking-tight">
                                                    MODIFICATION OF GOVERNANCE SOURCE PARAMETERS WILL TRIGGER A GLOBAL AUDIT EVENT AND NOTIFY ALL DEPARTMENTAL HEADS. SECURE AUTHENTICATION IS LOGGED.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 1 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            {Object.entries(alerts).map(([key, value]) => (
                                                <div key={key} className="p-6 bg-slate-50 flex justify-between items-center rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-lg ${value ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                                            <Bell className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Global Notification Handle</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setAlerts({ ...alerts, [key]: !value })}
                                                        className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${value ? 'left-7' : 'left-1'}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}

                                    {activeTab === 2 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Layers className="w-4 h-4" /> Performance Goal Matrix
                                                </h4>
                                                <button onClick={addGoal} className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">
                                                    Add Strategic Target
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {goals.map((goal, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 group relative"
                                                    >
                                                        <button onClick={() => removeGoal(idx)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>

                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Performance Indicator</label>
                                                                <input
                                                                    type="text"
                                                                    value={goal.key}
                                                                    onChange={(e) => updateGoal(idx, 'key', e.target.value)}
                                                                    placeholder="e.g., Institutional Engagement Velocity"
                                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-indigo-500 transition-all uppercase tracking-tight"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target</label>
                                                                    <input type="number" value={goal.target} onChange={(e) => updateGoal(idx, 'target', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black outline-none" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Current</label>
                                                                    <input type="number" value={goal.current} onChange={(e) => updateGoal(idx, 'current', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black outline-none" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                                                                    <input type="date" value={goal.deadline?.split('T')[0]} onChange={(e) => updateGoal(idx, 'deadline', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-black outline-none" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                                                                <span>Projected Orbit</span>
                                                                <span>{((goal.current / goal.target) * 100).toFixed(0)}% Complete</span>
                                                            </div>
                                                            <div className="h-1.5 bg-white border border-slate-100 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                                                                    className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={handleSaveGoals}
                                                disabled={savingGoals}
                                                className="w-full py-5 bg-slate-900 hover:bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                                            >
                                                {savingGoals ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4 text-amber-400" />}
                                                Synchronize Strategic Goals
                                            </button>
                                        </motion.div>
                                    )}

                                    {activeTab === 3 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                            {loadingAdmins ? (
                                                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Scanning Admin Registry...</span>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {admins.map(admin => (
                                                        <div key={admin._id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 flex items-center gap-5 group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all">
                                                            <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                                {(admin.fullName || admin.username)[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{admin.fullName || admin.username}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{admin.email}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 5 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto py-10 text-center">
                                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                                <Database className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4">Institutional Archiving</h4>
                                            <p className="text-[28px] font-black text-indigo-600 mb-2">{retention} Units</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">Temporal deep storage rotation cycle</p>

                                            <div className="px-10 mb-12">
                                                <input
                                                    type="range"
                                                    min="30"
                                                    max="730"
                                                    step="30"
                                                    value={retention}
                                                    onChange={(e) => setRetention(parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>

                                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">
                                                "RECORDS EXCEEDING THE ARCHIVAL HORIZON WILL BE MOVED TO SECURE STORAGE. RETRIEVAL REQUIRES MULTI-FACTOR CLEARANCE."
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Notification Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 right-10 bg-slate-900 border border-slate-800 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-[100]"
                    >
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{toast}</span>
                        <button onClick={() => setToast(null)}><X className="w-4 h-4 text-slate-500 hover:text-white transition-colors" /></button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrincipalSettings;
