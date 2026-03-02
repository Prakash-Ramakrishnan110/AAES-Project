import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceInsight {
    _id: string;
    subjectName: string;
    subjectCode: string;
    avgMarks: number;
    highest: number;
    lowest: number;
    submissionRate: number;
}

const AdvisorPerformance = () => {
    const { token } = useContext(AuthContext)!;
    const [insights, setInsights] = useState<PerformanceInsight[]>([]);
    const [loading, setLoading] = useState(true);

    const API = 'http://localhost:5000';

    const fetchData = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/advisor/academic-insights`, config);
            setInsights(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academic Performance</h1>
                    <p className="text-gray-500 text-sm">In-depth subject-wise performance analysis and distribution.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.length === 0 ? (
                    <div className="col-span-2 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No performance insights available yet.</p>
                    </div>
                ) : insights.map((item, idx) => (
                    <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900">{item.subjectName}</h3>
                                <p className="text-xs text-indigo-500 font-mono">{item.subjectCode}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${item.avgMarks >= 75 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {item.avgMarks}% AVG
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 py-2">
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Highest</p>
                                <p className="text-lg font-bold text-gray-800">{item.highest}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Lowest</p>
                                <p className="text-lg font-bold text-gray-800">{item.lowest}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Submission</p>
                                <p className="text-lg font-bold text-indigo-600">{item.submissionRate}%</p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1.5 px-0.5">
                                <span>PERFORMANCE TREND</span>
                                <span>{item.submissionRate}% RATE</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${item.avgMarks >= 75 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${item.avgMarks}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdvisorPerformance;
