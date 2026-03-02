import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, Award, CheckCircle, AlertCircle, Lock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentInternalMarks = () => {
    const { token } = useContext(AuthContext)!;
    const [marks, setMarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/internal/student-marks`, config);
                setMarks(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load marks');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchMarks();
    }, [token]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const totalObtained = marks.reduce((sum, m) => sum + (m.totalObtained || 0), 0);
    const totalMax = marks.reduce((sum, m) => sum + (m.totalMax || 0), 0);
    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Internal Marks</h1>
                    <p className="text-sm text-gray-500 mt-1">Published internal assessment scores from your teachers</p>
                </div>
                {marks.length > 0 && (
                    <div className="px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-700">Overall: {overallPct}%</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-medium">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            {!loading && marks.length === 0 && !error && (
                <div className="text-center py-24 text-gray-400">
                    <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No published marks yet</p>
                    <p className="text-sm mt-1">Marks will appear here once your HOD publishes them</p>
                </div>
            )}

            {/* Subject Cards */}
            <div className="space-y-4">
                {marks.map((mark, idx) => {
                    const pattern = mark.pattern; // used for future pattern-level info if needed
                    void pattern; // suppress unused warning
                    const pct = mark.totalMax > 0 ? Math.round((mark.totalObtained / mark.totalMax) * 100) : 0;
                    const grade = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';
                    const gradeColor = pct >= 60 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : pct >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200';

                    return (
                        <motion.div
                            key={mark._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.07 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            {/* Subject header */}
                            <div className="flex items-center justify-between p-5 border-b border-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">
                                            {mark.subject?.name || 'Subject'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            {mark.subject?.code}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-4 py-1.5 rounded-xl border font-extrabold text-sm ${gradeColor}`}>
                                        Grade: {grade} ({pct}%)
                                    </div>
                                </div>
                            </div>

                            {/* Component breakdown */}
                            <div className="p-5">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {mark.componentMarks?.map((cm: any) => (
                                        <div key={cm.componentName} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                {cm.componentName}
                                            </p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-black text-gray-900">{cm.marksObtained}</span>
                                                <span className="text-xs text-gray-400 font-medium">/ {cm.maxMarks}</span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${cm.maxMarks > 0 ? (cm.marksObtained / cm.maxMarks) * 100 : 0}%` }}
                                                    transition={{ delay: idx * 0.07 + 0.2 }}
                                                    className="h-full bg-indigo-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Total card */}
                                    <div className="bg-indigo-600 rounded-xl p-3 text-white">
                                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">Total</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black">{mark.totalObtained}</span>
                                            <span className="text-xs opacity-70 font-medium">/ {mark.totalMax}</span>
                                        </div>
                                        <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: idx * 0.07 + 0.3 }}
                                                className="h-full bg-white rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Published indicator */}
                                <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                                    <CheckCircle className="w-3 h-3" /> Published by HOD
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentInternalMarks;
