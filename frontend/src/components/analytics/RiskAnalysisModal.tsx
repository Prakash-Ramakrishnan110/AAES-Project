import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, Activity, Zap, Loader2 } from 'lucide-react';
import axios from 'axios';
import GradeForecast from './GradeForecast';

interface RiskAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    risk: any;
}

const RiskAnalysisModal: React.FC<RiskAnalysisModalProps> = ({ isOpen, onClose, risk }) => {
    const [forecastData, setForecastData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && risk?.student?._id) {
            fetchForecast();
        }
    }, [isOpen, risk]);

    const fetchForecast = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/forecast/${risk.student._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForecastData(res.data);
        } catch (error) {
            console.error('Error fetching forecast:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !risk) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
                        <div>
                            <h2 className="text-2xl font-semibold">{risk.student?.fullName}</h2>
                            <p className="text-slate-400 font-semibold tracking-widest text-xs uppercase">AI Performance Forensic Report</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        {/* Status Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className={`p-6 rounded-3xl border-2 flex items-center justify-between col-span-2 ${
                                risk.riskLevel === 'Red' ? 'bg-rose-50 border-rose-200' : 
                                risk.riskLevel === 'Yellow' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
                            }`}>
                                <div>
                                    <h4 className="font-semibold text-xl mb-1 flex items-center gap-2">
                                        <Zap className={risk.riskLevel === 'Red' ? 'text-rose-600' : risk.riskLevel === 'Yellow' ? 'text-amber-600' : 'text-emerald-600'} />
                                        {risk.riskLevel} Alert Status
                                    </h4>
                                    <p className="text-sm opacity-70 font-semibold uppercase tracking-tighter">Neural Confidence: 92%</p>
                                </div>
                                <div className="text-4xl font-semibold opacity-30">
                                    {risk.riskLevel === 'Red' ? 'CRITICAL' : risk.riskLevel === 'Yellow' ? 'WARNING' : 'STABLE'}
                                </div>
                            </div>

                            <DetailBox icon={<Activity size={18}/>} label="Attendance" value={`${Math.round(risk.attendancePercent)}%`} color="text-rose-600" />
                            <DetailBox icon={<TrendingDown size={18}/>} label="Internal Marks" value={`${Math.round(risk.internalPercent)}%`} color="text-amber-600" />
                        </div>

                        {/* Grade Forecast Visualization */}
                        <div className="mb-8">
                            <h5 className="font-semibold text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                <span className="p-1 bg-indigo-100 text-indigo-600 rounded">📈</span>
                                Predictive Academic Forecasting
                            </h5>
                            {loading ? (
                                <div className="h-[200px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Synthesizing Neural Model...</span>
                                </div>
                            ) : forecastData ? (
                                <GradeForecast history={forecastData.history} forecast={forecastData.forecast} />
                            ) : (
                                <div className="h-[200px] flex items-center justify-center bg-slate-50 rounded-3xl text-slate-400 font-semibold text-xs">
                                    Forecasting Engine Unavailable
                                </div>
                            )}
                        </div>

                        {/* Traditional Insights */}
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                            <h5 className="font-semibold text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <span className="p-1 bg-slate-200 rounded">💡</span>
                                Recommended Intervention Strategy
                            </h5>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-sm font-semibold text-slate-600">
                                    <span className="w-5 h-5 bg-slate-900 text-white rounded-full flex-shrink-0 flex items-center justify-center text-[10px]">1</span>
                                    Initiate parental advisory regarding attendance thresholds.
                                </li>
                                <li className="flex gap-3 text-sm font-semibold text-slate-600">
                                    <span className="w-5 h-5 bg-slate-900 text-white rounded-full flex-shrink-0 flex items-center justify-center text-[10px]">2</span>
                                    Assign 1-on-1 mentorship for "Internal Volatility" management.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                        <button 
                            onClick={onClose}
                            className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                        >
                            ACKNOWLEDGE REPORT
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const DetailBox = ({ icon, label, value, color }: any) => (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                {icon}
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">{label}</span>
        </div>
        <span className={`text-xl font-semibold ${color}`}>{value}</span>
    </div>
);

export default RiskAnalysisModal;

