import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Bell, User, Layout, Database, Save, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const settingsNav = [
    { icon: Shield, label: 'Governance Policy' },
    { icon: Bell, label: 'Global Alerts' },
    { icon: User, label: 'System Admins' },
    { icon: Layout, label: 'Layout Prefs' },
    { icon: Database, label: 'Archive Settings' }
];

const PrincipalSettings = () => {
    const { token } = useContext(AuthContext)!;
    const [activeTab, setActiveTab] = useState(0);
    const [threshold, setThreshold] = useState(2);
    const [inactivity, setInactivity] = useState(7);
    const [admins, setAdmins] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Form states for alerts
    const [alerts, setAlerts] = useState({
        escalations: true,
        riskHeatmap: true,
        infraCritical: false,
        auditLogs: true
    });

    // Form states for layout
    const [layout, setLayout] = useState('comfortable');

    // Archive state
    const [retention, setRetention] = useState(365);

    useEffect(() => {
        if (activeTab === 2) {
            fetchAdmins();
        }
    }, [activeTab]);

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
        setToast('Configuration Saved Successfully!');
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="p-5 space-y-5 max-w-5xl mx-auto relative">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600" /> Control Center
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">Institution-wide configuration and governance policy management.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition-all"
                >
                    <Save className="w-3.5 h-3.5" /> Save Configuration
                </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {/* Sidebar */}
                <div className="space-y-1">
                    {settingsNav.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === i
                                ? 'bg-white shadow text-indigo-600 border border-slate-100'
                                : 'text-slate-400 hover:bg-white hover:text-slate-600'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${activeTab === i ? 'text-indigo-600' : 'text-slate-300'}`} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Settings Panel */}
                <div className="md:col-span-3 space-y-5 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 0 && (
                            <motion.div
                                key="gov"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-indigo-500" /> Escalation Policy
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group hover:border-indigo-100 transition-all">
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">Auto-Escalation Threshold</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Consecutive RED assessments to trigger escalation.</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setThreshold(t => Math.max(1, t - 1))} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold flex items-center justify-center hover:border-indigo-300 transition-colors">−</button>
                                                <span className="text-xl font-bold text-indigo-600 w-6 text-center">{threshold}</span>
                                                <button onClick={() => setThreshold(t => t + 1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold flex items-center justify-center hover:border-indigo-300 transition-colors">+</button>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group hover:border-indigo-100 transition-all">
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">Inactivity Promo Period</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Days before escalation moves to the next level.</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setInactivity(t => Math.max(1, t - 1))} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold flex items-center justify-center hover:border-indigo-300 transition-colors">−</button>
                                                <span className="text-xl font-bold text-indigo-600 w-6 text-center">{inactivity}</span>
                                                <button onClick={() => setInactivity(t => t + 1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold flex items-center justify-center hover:border-indigo-300 transition-colors">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                    <h4 className="text-xs font-bold text-red-900 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                        <Shield className="w-3.5 h-3.5" /> Critical Alert
                                    </h4>
                                    <p className="text-[11px] font-medium text-red-700/70 leading-relaxed">
                                        Changes to the Governance Policy will trigger an institution-wide Audit Log entry and notify all Departmental HODs immediately.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 1 && (
                            <motion.div
                                key="alerts"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-amber-500" /> Institutional Alerts
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(alerts).map(([key, value]) => (
                                        <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group hover:border-indigo-100 transition-all">
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Toggle global notifications for this category.</p>
                                            </div>
                                            <button
                                                onClick={() => setAlerts({ ...alerts, [key]: !value })}
                                                className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${value ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 2 && (
                            <motion.div
                                key="admins"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <User className="w-4 h-4 text-emerald-500" /> System Administrators
                                </h3>
                                {loadingAdmins ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {admins.map(admin => (
                                            <div key={admin._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                                                    {admin.username[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{admin.fullName || admin.username}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{admin.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 3 && (
                            <motion.div
                                key="layout"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Layout className="w-4 h-4 text-purple-500" /> Layout Preferences
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {['comfortable', 'dense'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setLayout(mode)}
                                            className={`p-6 rounded-2xl border-2 transition-all text-center ${layout === mode ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                        >
                                            <p className="font-bold text-sm text-slate-800 capitalize mb-1">{mode} View</p>
                                            <p className="text-[10px] text-slate-400">Optimal for {mode === 'dense' ? 'high data density' : 'clarity and spacing'}.</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 4 && (
                            <motion.div
                                key="archive"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Database className="w-4 h-4 text-slate-600" /> Archive Policy
                                </h3>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-xs font-bold text-slate-800 mb-2">Data Retention Policy</p>
                                    <p className="text-[28px] font-bold text-indigo-600 mb-4">{retention} Days</p>
                                    <input
                                        type="range"
                                        min="30"
                                        max="730"
                                        step="30"
                                        value={retention}
                                        onChange={(e) => setRetention(parseInt(e.target.value))}
                                        className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mb-4"
                                    />
                                    <p className="text-[10px] text-slate-400 leading-relaxed px-10">
                                        Automated archival of audit logs and historical assessment data. Records older than the retention period move to deep storage.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 right-10 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100]"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrincipalSettings;

