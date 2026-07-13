import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PerformanceTrendsProps {
    data: {
        semester: string;
        performance: number;
        volume: number;
    }[];
}

const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400 font-semibold uppercase tracking-widest text-[11px]">
                Insufficient data for longitudinal analysis
            </div>
        );
    }

    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : null;
    const diff = previous ? latest.performance - previous.performance : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">Growth Indicator</p>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-semibold text-slate-900">{latest.performance.toFixed(1)}%</span>
                        {diff > 0 ? (
                            <span className="flex items-center text-emerald-600 text-xs font-semibold">
                                <TrendingUp size={14} className="mr-0.5" /> +{diff.toFixed(1)}%
                            </span>
                        ) : diff < 0 ? (
                            <span className="flex items-center text-rose-600 text-xs font-semibold">
                                <TrendingDown size={14} className="mr-0.5" /> {diff.toFixed(1)}%
                            </span>
                        ) : (
                            <span className="flex items-center text-slate-400 text-xs font-semibold">
                                <Minus size={14} className="mr-0.5" /> 0.0%
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">Data Volume (Assets)</p>
                    <div className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                        {latest.volume} <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Calculated Submissions</span>
                    </div>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="semester" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                            label={{ value: 'SEMESTER SCALE', position: 'insideBottom', offset: -5, fontSize: 8, fontWeight: 900, fill: '#cbd5e1' }}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            domain={[0, 100]}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Performance']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="performance" 
                            stroke="#4F46E5" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorPerf)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                <span>Phase 4 Comparative Engine</span>
                <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Dataset Node Sync
                </span>
            </div>
        </div>
    );
};

export default PerformanceTrends;

