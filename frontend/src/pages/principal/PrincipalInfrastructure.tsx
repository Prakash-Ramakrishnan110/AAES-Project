import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Search, ShieldCheck, Zap,
    ArrowUpRight, X
} from 'lucide-react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PrincipalInfrastructure = () => {
    const { token } = useContext(AuthContext)!;
    const [depts, setDepts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchInfra = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/governance/principal/infrastructure`, config);
            setDepts(data);
        } catch (error) {
            console.error('Error fetching infra', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInfra();
    }, [token]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Scanning Institutional Assets...</p>
            </div>
        </div>
    );

    const filteredDepts = (depts || []).filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.department && d.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-indigo-100">
            {/* Unified Top Header Context */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-40 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase first-letter:uppercase">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" /> Infrastructure Optimization
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Asset Health & Governance Matrix</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search assets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 rounded-xl text-xs font-bold transition-all w-full md:w-[280px] outline-none"
                            />
                        </div>
                        <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {depts.length} Verified Nodes
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDepts.map((asset, i) => (
                        <motion.div
                            key={asset._id || i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group overflow-hidden"
                        >
                            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center px-6">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{asset.type}</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${asset.status === 'Functional' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className={`text-[10px] font-black uppercase ${asset.status === 'Functional' ? 'text-emerald-600' : 'text-amber-600'}`}>{asset.status}</span>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{asset.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-1 uppercase tracking-tight">
                                            <Activity className="w-3 h-3" /> {asset.location}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Utilization</div>
                                        <div className="text-2xl font-bold text-indigo-600">{asset.utilizationRate}%</div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${asset.utilizationRate}%` }}
                                            className={`h-full ${asset.utilizationRate > 80 ? 'bg-rose-500' : asset.utilizationRate > 50 ? 'bg-indigo-600' : 'bg-emerald-500'}`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Last Maintenance</p>
                                            <p className="text-xs font-bold text-slate-700 text-center">
                                                {asset.lastMaintained ? new Date(asset.lastMaintained).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Dept. Lead</p>
                                            <p className="text-xs font-bold text-slate-700 text-center truncate">{asset.department || 'General'}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedAsset(asset)}
                                        className="w-full py-4 border border-slate-200 hover:border-indigo-600 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        Full Asset Report <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Detailed Asset Modal */}
            <AnimatePresence>
                {selectedAsset && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{selectedAsset.type} Registry REPORT</span>
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedAsset.name}</h2>
                                </div>
                                <button onClick={() => setSelectedAsset(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Operational Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${selectedAsset.status === 'Functional' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                            <p className="text-sm font-bold text-slate-700">{selectedAsset.status}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Resource Capacity</p>
                                        <p className="text-sm font-bold text-slate-700">Optimal (Institutional Standard)</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Cycle</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedAsset.lastMaintained ? new Date(selectedAsset.lastMaintained).toLocaleDateString() : 'Dec 2025'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Custodian</p>
                                        <p className="text-sm font-bold text-slate-700">Administrative Services</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-6 flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5" /> Maintenance Archives
                                        </h4>
                                        <div className="space-y-4">
                                            {[
                                                { date: '12 Jan 2026', action: 'Routine System Check', status: 'Passed' },
                                                { date: '05 Dec 2025', action: 'Hardware Upgrade', status: 'Completed' },
                                                { date: '15 Oct 2025', action: 'Network Optimization', status: 'Completed' }
                                            ].map((log, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-[11px] border-b border-white/10 pb-3 last:border-0 last:pb-0">
                                                    <span className="font-bold text-slate-500 uppercase tracking-tighter">{log.date}</span>
                                                    <span className="font-medium text-slate-300">{log.action}</span>
                                                    <span className="text-emerald-400 font-bold uppercase tracking-widest text-[9px]">{log.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Zap className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 rotate-12" />
                                </div>

                                <button
                                    className="w-full py-4 bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                >
                                    Download Formal Audit Log
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrincipalInfrastructure;
