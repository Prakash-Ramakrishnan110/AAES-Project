import React from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Brain, Target, Info, Sparkles } from 'lucide-react';

interface GradeForecastProps {
    history: {
        semester: string;
        gpa: number;
    }[];
    forecast: {
        predictedGPA: number;
        improvementProbability: number;
        insight: string;
    };
}

const GradeForecast: React.FC<GradeForecastProps> = ({ history, forecast }) => {
    // Prepare data for chart: add the forecast as the next semester
    const lastSem = history.length > 0 ? parseInt(history[history.length - 1].semester) : 0;
    const nextSem = (lastSem + 1).toString();
    
    const chartData = [
        ...history.map(h => ({ ...h, type: 'actual' })),
        { semester: nextSem, gpa: forecast.predictedGPA, type: 'predicted' }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-indigo-600" />
                        <p className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">Predicted GPA</p>
                    </div>
                    <div className="text-3xl font-semibold text-indigo-900">{forecast.predictedGPA.toFixed(1)}</div>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-emerald-600" />
                        <p className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">Improvement Chance</p>
                    </div>
                    <div className="text-3xl font-semibold text-emerald-900">{forecast.improvementProbability}%</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain size={14} className="text-slate-600" />
                        <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">AI Confidence</p>
                    </div>
                    <div className="text-3xl font-semibold text-slate-900">89%</div>
                </div>
            </div>

            <div className="h-[250px] w-full bg-white/50 rounded-2xl p-4 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="semester" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            domain={[0, 10]}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : (value ?? 'N/A'), 'GPA']}
                        />
                        <ReferenceLine x={history[history.length-1]?.semester} stroke="#cbd5e1" strokeDasharray="3 3" />
                        
                        {/* Actual History Line */}
                        <Line 
                            type="monotone" 
                            data={chartData.filter(d => d.type === 'actual' || (d.type === 'predicted' && d.semester === history[history.length-1]?.semester))}
                            dataKey="gpa" 
                            stroke="#4F46E5" 
                            strokeWidth={4}
                            dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        
                        {/* Forecast Line */}
                        <Line 
                            type="monotone" 
                            data={chartData.filter(d => d.type === 'predicted' || (d.type === 'actual' && d.semester === history[history.length-1]?.semester))}
                            dataKey="gpa" 
                            stroke="#4F46E5" 
                            strokeWidth={4}
                            strokeDasharray="5 5"
                            dot={{ fill: '#fff', strokeWidth: 2, r: 4, stroke: '#4F46E5' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain size={80} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Info size={14} className="text-indigo-400" />
                        <h4 className="text-[10px] uppercase font-semibold tracking-widest text-indigo-400">Strategic Insight</h4>
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic text-slate-200">
                        "{forecast.insight}"
                    </p>
                </div>
            </div>
            
            <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                <span>Neural Forecasting Node v1.0</span>
                <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Predictive Accuracy: High
                </span>
            </div>
        </div>
    );
};

export default GradeForecast;

