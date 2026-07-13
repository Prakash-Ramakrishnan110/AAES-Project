import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';

interface StudentRiskProps {
    risk: {
        student: {
            fullName: string;
            username: string;
            email: string;
        };
        riskLevel: 'Red' | 'Yellow' | 'Green';
        attendancePercent: number;
        internalPercent: number;
        assignmentPercent: number;
        lastCalculatedAt: string;
        aiInsights?: string;
    };
    onRecalculate?: () => void;
    loading?: boolean;
}

const StudentRiskCard: React.FC<StudentRiskProps> = ({ risk, onRecalculate, loading }) => {
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Red': return 'bg-rose-50 border-rose-200 text-rose-700';
            case 'Yellow': return 'bg-amber-50 border-amber-200 text-amber-700';
            case 'Green': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
            default: return 'bg-gray-50 border-gray-200 text-gray-700';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'Red': return <AlertTriangle className="text-rose-600" size={24} />;
            case 'Yellow': return <Info className="text-amber-600" size={24} />;
            case 'Green': return <CheckCircle className="text-emerald-600" size={24} />;
            default: return null;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${getRiskColor(risk.riskLevel)}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                        {getRiskIcon(risk.riskLevel)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg leading-tight">{risk.student?.fullName || 'Unknown Student'}</h3>
                        <p className="text-sm opacity-80 uppercase tracking-wider font-semibold">Risk Level: {risk.riskLevel}</p>
                    </div>
                </div>
                
                <button 
                    onClick={onRecalculate}
                    disabled={loading}
                    className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors disabled:opacity-50"
                    title="Recalculate Risk"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <MetricBox label="Attendance" value={Math.round(risk.attendancePercent)} unit="%" />
                <MetricBox label="Internals" value={Math.round(risk.internalPercent)} unit="%" />
                <MetricBox label="Tasks" value={Math.round(risk.assignmentPercent)} unit="%" />
            </div>

            {risk.aiInsights && (
                <div className="mt-4 p-3 bg-white/40 rounded-xl border border-white/20 backdrop-blur-sm">
                    <p className="text-xs uppercase font-semibold mb-1 opacity-60">AI Forecasting Logic</p>
                    <p className="text-sm leading-relaxed italic">"{risk.aiInsights}"</p>
                </div>
            )}

            <div className="mt-4 flex justify-between items-center text-[10px] uppercase font-semibold tracking-widest opacity-50">
                <span>Phase 4 Analytics</span>
                <span>Updated: {new Date(risk.lastCalculatedAt).toLocaleDateString()}</span>
            </div>
        </motion.div>
    );
};

const MetricBox = ({ label, value, unit }: { label: string, value: number, unit: string }) => (
    <div className="bg-white/40 p-2 rounded-xl border border-white/20 text-center">
        <p className="text-[10px] uppercase font-semibold opacity-60 truncate">{label}</p>
        <p className="text-base font-semibold">{value}{unit}</p>
    </div>
);

export default StudentRiskCard;

