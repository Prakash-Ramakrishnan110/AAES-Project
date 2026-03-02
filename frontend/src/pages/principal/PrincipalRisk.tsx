import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, TrendingUp, Info,
    ChevronRight, Map, Filter, Download, X, Save
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
                headStyles: { fillColor: [220, 38, 38] }
            });

            doc.save(`Institutional_Risk_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF Export failed', error);
        }
    };

    if (loading || !stats) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
        <div className="p-5 space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
            >
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-600" /> Institutional Risk Intel
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">Heatmaps and predictive analysis of academic vulnerability.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" /> Export PDF
                    </button>
                    <button
                        onClick={() => setShowThresholdModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow hover:bg-red-700 transition-all"
                    >
                        <Filter className="w-3.5 h-3.5" /> Adjust Thresholds
                    </button>
                </div>
            </motion.div>

            {/* Risk Distribution Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-3 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden"
                >
                    <div className="mb-5 flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Institutional Heatmap</h2>
                            <p className="text-slate-400 font-medium text-[11px] mt-0.5">Cross-departmental vulnerability score comparison.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                                <span className="text-[10px] font-bold uppercase text-slate-400">Critical</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                                <span className="text-[10px] font-bold uppercase text-slate-400">Warning</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={heatmapData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    angle={-35}
                                    textAnchor="end"
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const d = payload[0].payload;
                                            return (
                                                <div className="bg-slate-900 p-3 rounded-xl shadow-xl text-white text-xs">
                                                    <p className="font-bold uppercase tracking-widest border-b border-white/10 pb-1.5 mb-1.5">{d.name}</p>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between gap-6"><span className="text-red-400">Critical:</span><span className="font-bold">{d.critical}</span></div>
                                                        <div className="flex justify-between gap-6"><span className="text-amber-400">Warning:</span><span className="font-bold">{d.warning}</span></div>
                                                        <div className="flex justify-between gap-6 border-t border-white/10 pt-1"><span className="text-indigo-300">Risk Score:</span><span className="font-bold text-indigo-400">{d.riskScore}%</span></div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="critical" stackId="a" fill="#EF4444" barSize={30} />
                                <Bar dataKey="warning" stackId="a" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Vertical Stat Strip */}
                <div className="space-y-4">
                    <div className="bg-red-600 p-5 rounded-2xl text-white shadow-lg">
                        <TrendingUp className="w-5 h-5 mb-3 opacity-70" />
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Highest Vulnerability</p>
                        <h3 className="text-base font-bold mt-1 leading-tight">{heatmapData[0]?.name}</h3>
                        <div className="mt-4 flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold">{heatmapData[0]?.riskScore}%</span>
                            <span className="text-[11px] font-medium opacity-60">dept score</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                            <Map className="w-3.5 h-3.5 text-indigo-600" /> Critical Hotspots
                        </h4>
                        <div className="space-y-3">
                            {heatmapData.slice(0, 4).map((dept: any, i: number) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">{dept.name}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 transition-transform group-hover:translate-x-1" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-5 rounded-2xl text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <Info className="w-4 h-4 text-indigo-400 mb-3" />
                            <p className="text-xs font-medium leading-relaxed opacity-80">
                                Predictions suggest <span className="text-red-400 font-bold">2.1% across-dept risk growth</span> if assessment patterns remain un-published.
                            </p>
                        </div>
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>

            {/* Threshold Adjustment Modal */}
            <AnimatePresence>
                {showThresholdModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowThresholdModal(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden border border-slate-100"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-red-600" /> Adjust Risk Thresholds
                                </h3>
                                <button onClick={() => setShowThresholdModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-red-900 uppercase">Critical (Red)</span>
                                            <span className="text-lg font-bold text-red-600">{thresholds.critical}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={thresholds.critical}
                                            onChange={(e) => setThresholds({ ...thresholds, critical: parseInt(e.target.value) })}
                                            className="w-full accent-red-600 h-1.5 bg-red-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <p className="text-[10px] text-red-700/60 mt-2 font-medium">Departments exceeding this percentage of red-state students are flagged as critical.</p>
                                    </div>

                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-amber-900 uppercase">Warning (Yellow)</span>
                                            <span className="text-lg font-bold text-amber-600">{thresholds.warning}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={thresholds.warning}
                                            onChange={(e) => setThresholds({ ...thresholds, warning: parseInt(e.target.value) })}
                                            className="w-full accent-amber-500 h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <p className="text-[10px] text-amber-700/60 mt-2 font-medium">Combined red and yellow students above this threshold trigger Institutional Warnings.</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                                        <Info className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                                        Adjusting these thresholds simulates institutional risk reporting. Final policy changes must be saved in the <span className="font-bold">Control Center</span>.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setShowThresholdModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors">
                                        Discard
                                    </button>
                                    <button onClick={() => setShowThresholdModal(false)} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                        <Save className="w-4 h-4" /> Save Simulation
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrincipalRisk;

