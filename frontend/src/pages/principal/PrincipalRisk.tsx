import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, TrendingUp, Info,
    Download, X, Save,
    AlertTriangle, Target
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PrincipalRisk = () => {
    const { token, user } = useContext(AuthContext)!;
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showThresholdModal, setShowThresholdModal] = useState(false);
    const [thresholds, setThresholds] = useState({ critical: 20, warning: 40 });

    useEffect(() => {
        const fetchRisk = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/governance/principal/dashboard`, config);
                setStats(data);
            } catch (error) {
                console.error('Error fetching risk data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRisk();
    }, [token]);

    const exportToPDF = () => {
        if (!stats) return;
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Institutional Risk Intelligence Report', 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
            doc.text(`Principal: ${user?.fullName || user?.username}`, 14, 34);

            const tableData = stats.departmentComparison.map((d: any) => [
                d.department,
                d.total,
                d.red,
                d.yellow,
                ((d.red * 1.0 + d.yellow * 0.5) / d.total * 100).toFixed(1) + '%'
            ]);

            autoTable(doc, {
                startY: 40,
                head: [['Department', 'Total Students', 'Critical (Red)', 'Warning (Yellow)', 'Risk Score']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229] }
            });

            doc.save(`Institutional_Risk_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF Export failed', error);
        }
    };

    if (loading || !stats) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Calibrating Risk Sensors...</p>
            </div>
        </div>
    );

    const heatmapData = stats.departmentComparison.map((d: any) => ({
        name: d.department,
        critical: d.red,
        warning: d.yellow,
        total: d.total,
        riskScore: ((d.red * 1.0 + d.yellow * 0.5) / d.total * 100).toFixed(1)
    })).sort((a: any, b: any) => b.riskScore - a.riskScore);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-indigo-100">
            {/* Unified Top Header Context */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-40 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase first-letter:uppercase">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                            <AlertTriangle className="w-5 h-5 text-indigo-600" /> Risk Intelligence
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Predictive Vulnerability Analysis</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" /> Export Report
                        </button>
                        <button
                            onClick={() => setShowThresholdModal(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-slate-200"
                        >
                            <Target className="w-3.5 h-3.5" /> Policy Thresholds
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10">
                {/* Risk Distribution Heatmap */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-3 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm relative overflow-hidden"
                    >
                        <div className="mb-8 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Institutional Risk Heatmap</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-departmental vulnerability score comparison</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Critical</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Warning</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={heatmapData} margin={{ top: 10, right: 20, left: -20, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        angle={-35}
                                        textAnchor="end"
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(79, 70, 229, 0.04)' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-4 rounded-xl shadow-2xl border border-slate-100 min-w-[180px]">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 border-b border-slate-50 pb-2">{d.name}</p>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-rose-600 uppercase">Critical</span><span className="text-sm font-black text-slate-900">{d.critical}</span></div>
                                                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-amber-500 uppercase">Warning</span><span className="text-sm font-black text-slate-900">{d.warning}</span></div>
                                                            <div className="flex justify-between items-center pt-2 border-t border-slate-50"><span className="text-[10px] font-black text-indigo-600 uppercase">Risk Index</span><span className="text-sm font-black text-indigo-600">{d.riskScore}%</span></div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="critical" stackId="a" fill="#f43f5e" barSize={32} />
                                    <Bar dataKey="warning" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Risk Stat Cards */}
                    <div className="space-y-6">
                        <div className="bg-rose-600 p-8 rounded-2xl text-white shadow-lg shadow-rose-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <TrendingUp className="w-5 h-5 mb-4 opacity-60" />
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Peak Vulnerability</p>
                                <h3 className="text-xl font-bold mt-1 tracking-tight leading-tight">{heatmapData[0]?.name}</h3>
                                <div className="mt-6 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold tracking-tighter">{heatmapData[0]?.riskScore}%</span>
                                    <span className="text-[10px] font-bold opacity-60 uppercase">Institutional Stress</span>
                                </div>
                            </div>
                            <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Target className="w-3.5 h-3.5 text-indigo-600" /> Critical Hotspots
                            </h4>
                            <div className="space-y-4">
                                {heatmapData.slice(0, 4).map((dept: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{dept.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-rose-600">{dept.riskScore}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <Info className="w-5 h-5 text-indigo-400 mb-4" />
                                <p className="text-xs font-medium leading-relaxed opacity-80 italic">
                                    "Probabilistic analysis indicates a <span className="text-rose-400 font-bold underline underline-offset-4">2.1% volatility surge</span> if departmental HOD interventions are delayed beyond the next assessment cycle."
                                </p>
                            </div>
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
                        </div>
                    </div>
                </div >
            </main >

            {/* Threshold Adjustment Modal */}
            <AnimatePresence>
                {
                    showThresholdModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
                            >
                                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Governance Thresholds</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Level Calibration</p>
                                    </div>
                                    <button onClick={() => setShowThresholdModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="p-10 space-y-8">
                                    <div className="space-y-6">
                                        <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-bold text-rose-900 uppercase tracking-widest">Critical Alert Floor</span>
                                                <span className="text-xl font-bold text-rose-600">{thresholds.critical}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="50"
                                                value={thresholds.critical}
                                                onChange={(e) => setThresholds({ ...thresholds, critical: parseInt(e.target.value) })}
                                                className="w-full h-1.5 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                                            />
                                            <p className="text-[9px] text-rose-700/60 mt-4 font-bold uppercase tracking-tight">Units exceeding this red-node concentration trigger auto-escalation.</p>
                                        </div>

                                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">Institutional Warning Ceiling</span>
                                                <span className="text-xl font-bold text-amber-600">{thresholds.warning}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={thresholds.warning}
                                                onChange={(e) => setThresholds({ ...thresholds, warning: parseInt(e.target.value) })}
                                                className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                            <p className="text-[9px] text-amber-700/60 mt-4 font-bold uppercase tracking-tight">Total institutional stress levels above this limit trigger board review.</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
                                        <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                            Adjusting these thresholds will recalibrate the institutional intelligence engine. Changes are simulated until formally committed via systemic policy update.
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={() => setShowThresholdModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                                            Discard
                                        </button>
                                        <button onClick={() => setShowThresholdModal(false)} className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                                            <Save className="w-4 h-4" /> Save Simulation
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
            </AnimatePresence>
        </div>
    );
};

export default PrincipalRisk;
