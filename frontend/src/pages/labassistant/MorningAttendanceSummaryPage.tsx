import { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ClipboardList, Save, AlertCircle, CheckCircle2, 
    Calendar, Users, ArrowRight, History
} from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MorningAttendanceSummaryPage = () => {
    const { token } = useContext(AuthContext)!;
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();

    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        department: 'CSE',
        year: '2nd Year',
        semester: '4',
        section: 'A',
        date: new Date().toISOString().split('T')[0],
        totalStudents: 60,
        presentCount: 0,
        absentCount: 0,
        odCount: 0
    });

    useEffect(() => {
        setHeaderOptions({
            title: 'Morning Attendance Summary',
            subtitle: 'Log daily class attendance counts for departmental tracking'
        });
    }, [setHeaderOptions]);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await axios.get(`${API}/api/morning-attendance/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name.includes('Count') || name === 'totalStudents' ? Number(value) : value 
        }));
        // Reset feedback
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Validation: presentCount + absentCount + odCount = totalStudents
        if (formData.presentCount + formData.absentCount + formData.odCount !== formData.totalStudents) {
            setError("Attendance count does not match the total number of students.");
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API}/api/morning-attendance`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess("Attendance summary recorded successfully!");
            fetchHistory();
            // Optional: reset numeric fields
            // setFormData(prev => ({ ...prev, presentCount: 0, absentCount: 0, odCount: 0 }));
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to record attendance summary.");
        } finally {
            setLoading(false);
        }
    };

    const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'AI&DS'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const sections = ['A', 'B', 'C', 'D'];

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                {/* Entry Form */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <SectionCard 
                            title="Attendance Entry" 
                            icon={<ClipboardList className="text-primary" />}
                            subtitle="Field validation enabled"
                        >
                            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Dept</label>
                                        <select 
                                            name="department" 
                                            value={formData.department} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        >
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                                        <select 
                                            name="year" 
                                            value={formData.year} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        >
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sem</label>
                                        <input 
                                            type="text" 
                                            name="semester" 
                                            placeholder="eg. 4"
                                            value={formData.semester} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sec</label>
                                        <select 
                                            name="section" 
                                            value={formData.section} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        >
                                            {sections.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                        <input 
                                            type="date" 
                                            name="date" 
                                            value={formData.date} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-institutional/30 rounded-2xl border border-primary/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span className="text-[12px] font-bold text-slate-900 uppercase tracking-tight">Student Count Matrix</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        <div className="space-y-1 text-left">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Total Strength</label>
                                            <input 
                                                type="number" 
                                                name="totalStudents" 
                                                value={formData.totalStudents} 
                                                onChange={handleChange}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <label className="text-[10px] font-bold text-green-600 uppercase">Present</label>
                                            <input 
                                                type="number" 
                                                name="presentCount" 
                                                value={formData.presentCount} 
                                                onChange={handleChange}
                                                placeholder="0"
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-green-500"
                                            />
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <label className="text-[10px] font-bold text-red-600 uppercase">Absent</label>
                                            <input 
                                                type="number" 
                                                name="absentCount" 
                                                value={formData.absentCount} 
                                                onChange={handleChange}
                                                placeholder="0"
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-red-500"
                                            />
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <label className="text-[10px] font-bold text-indigo-600 uppercase">On Duty (OD)</label>
                                            <input 
                                                type="number" 
                                                name="odCount" 
                                                value={formData.odCount} 
                                                onChange={handleChange}
                                                placeholder="0"
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calculated Sum</span>
                                            <span className={`text-[13px] font-black ${formData.presentCount + formData.absentCount + formData.odCount === formData.totalStudents ? 'text-green-600' : 'text-slate-900'}`}>
                                                {formData.presentCount + formData.absentCount + formData.odCount} / {formData.totalStudents}
                                            </span>
                                        </div>
                                        {formData.presentCount + formData.absentCount + formData.odCount === formData.totalStudents && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                                                <CheckCircle2 size={12} /> Balanced
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-[12px] font-medium flex items-start gap-2"
                                        >
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            {error}
                                        </motion.div>
                                    )}
                                    {success && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-[12px] font-medium flex items-start gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                            {success}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-70"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Record Attendance
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </SectionCard>
                    </motion.div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-3 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <SectionCard 
                            title="Submission Log" 
                            icon={<History className="text-slate-500" />}
                            subtitle="Last 50 recorded summaries"
                        >
                            <div className="overflow-x-auto pt-2">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-4 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Class</th>
                                            <th className="px-4 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider">Present</th>
                                            <th className="px-4 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider">Absent</th>
                                            <th className="px-4 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider">OD</th>
                                            <th className="px-4 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {historyLoading ? (
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={6} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                                </tr>
                                            ))
                                        ) : history.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-[12px] font-bold uppercase tracking-widest italic">No records found</td>
                                            </tr>
                                        ) : (
                                            history.map((item) => (
                                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                            <span className="text-[13px] font-bold text-slate-700">{new Date(item.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-bold text-slate-900">{item.department} {item.year}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sec {item.section} &bull; Sem {item.semester}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[12px] font-black">{item.presentCount}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-[12px] font-black">{item.absentCount}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[12px] font-black">{item.odCount}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <span className="text-[14px] font-black text-slate-900">{item.totalStudents}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default MorningAttendanceSummaryPage;
