import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    TrendingUp, BookOpen, CheckCircle, AlertCircle,
    Award, BarChart3, ChevronRight, Calculator
} from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentMarksView = () => {
    const { token } = useContext(AuthContext)!;
    const [loading, setLoading] = useState(true);
    const [marksData, setMarksData] = useState<any[]>([]);
    const [overallStats, setOverallStats] = useState({
        avgMarks: 0,
        avgAttendance: 0,
        totalSubjects: 0
    });

    useEffect(() => {
        fetchMarksAndAttendance();
    }, [token]);

    const fetchMarksAndAttendance = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch Attendance
            const attRes = await axios.get(`${API}/api/attendance/my`, config);
            const attendance = attRes.data;

            // Fetch Submissions
            const subRes = await axios.get(`${API}/api/submissions/my`, config);
            const submissions = subRes.data;

            // Get unique subject IDs from both sources
            const subjectIds = new Set([
                ...attendance.map((a: any) => a.subjectId),
                ...submissions.filter((s: any) => s.assignment?.subject).map((s: any) => s.assignment.subject._id || s.assignment.subject)
            ]);

            const combined = Array.from(subjectIds).map(subId => {
                const att = attendance.find((a: any) => a.subjectId === subId);
                const subjectSubmissions = submissions.filter((s: any) =>
                    (s.assignment?.subject === subId || s.assignment?.subject?._id === subId)
                );

                const totalMarksObtained = subjectSubmissions.reduce((acc: number, s: any) => acc + (s.marks || 0), 0);
                const totalMaxMarks = subjectSubmissions.reduce((acc: number, s: any) => acc + (s.assignment?.maxMarks || 0), 0);

                // Try to get subject name/code from either source
                const subjectName = att?.name || subjectSubmissions[0]?.assignment?.subject?.name || 'Unknown Subject';
                const subjectCode = att?.code || subjectSubmissions[0]?.assignment?.subject?.code || '???';

                return {
                    subjectId: subId,
                    name: subjectName,
                    code: subjectCode,
                    percentage: att ? att.percentage : null,
                    submissionsCount: subjectSubmissions.length,
                    marksObtained: totalMarksObtained,
                    maxMarks: totalMaxMarks,
                    gradePercentage: totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0
                };
            });

            setMarksData(combined);

            // Calculate overall stats
            const totalAvgMarks = combined.length > 0 ? combined.reduce((acc: number, s: any) => acc + s.gradePercentage, 0) / combined.length : 0;
            const totalAvgAtt = combined.length > 0 ? combined.reduce((acc: number, s: any) => acc + (s.percentage || 0), 0) / combined.length : 0;

            setOverallStats({
                avgMarks: Math.round(totalAvgMarks),
                avgAttendance: Math.round(totalAvgAtt),
                totalSubjects: combined.length
            });

        } catch (error) {
            console.error('Error fetching student performance data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 pb-10">
            {/* Full-Width Standardized Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-indigo-600 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Performance Analytics</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
                                Academic Performance
                            </h1>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                Monitor grade trajectories and attendance telemetry
                            </p>
                        </div>

                        <div className="px-5 py-3 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                            <Award className="w-6 h-6 text-indigo-600" />
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Academic Status</p>
                                <p className="text-xs font-black text-indigo-700 uppercase">
                                    {overallStats.avgMarks > 80 ? 'EXCELLENT STANDING' : overallStats.avgMarks > 60 ? 'GOOD STANDING' : 'NEEDS ATTENTION'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white border-gray-100 overflow-hidden relative group">
                        <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp className="w-20 h-20" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Overall Grade</p>
                        <p className="text-3xl font-black text-gray-900">{overallStats.avgMarks}%</p>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${overallStats.avgMarks}%` }} className="h-full bg-indigo-600 rounded-full" />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white border-gray-100 overflow-hidden relative group">
                        <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BarChart3 className="w-20 h-20" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg. Attendance</p>
                        <p className="text-3xl font-black text-gray-900">{overallStats.avgAttendance}%</p>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${overallStats.avgAttendance}%` }} className={`h-full rounded-full ${overallStats.avgAttendance < 75 ? 'bg-red-500' : 'bg-green-500'}`} />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white border-gray-100 overflow-hidden relative group">
                        <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BookOpen className="w-20 h-20" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Subjects</p>
                        <p className="text-3xl font-black text-gray-900">{overallStats.totalSubjects}</p>
                        <p className="mt-4 text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" /> All subjects active
                        </p>
                    </Card>
                </div>

                {/* Detailed Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Submissions</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Marks</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Attend. %</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="px-8 py-6"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
                            ) : marksData.length === 0 ? (
                                <tr><td colSpan={5} className="py-24 text-center text-gray-400 italic font-medium">No performance data found. Start submitting assignments to see your progress!</td></tr>
                            ) : (
                                marksData.map((data, idx) => (
                                    <motion.tr key={data.subjectId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="hover:bg-indigo-50/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">{data.code?.substring(0, 2)}</div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{data.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{data.code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-xs font-bold text-gray-600 border border-gray-100">
                                                <Calculator className="w-3 h-3" /> {data.submissionsCount}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <p className="text-sm font-bold text-gray-800">{data.marksObtained} <span className="text-gray-400 font-medium">/ {data.maxMarks}</span></p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-sm font-black ${data.percentage !== null && data.percentage < 75 ? 'text-red-500' : 'text-gray-900'}`}>{data.percentage === null ? '—' : `${data.percentage}%`}</span>
                                                {data.percentage !== null && data.percentage < 75 && (
                                                    <span className="text-[8px] font-black uppercase text-red-400 flex items-center gap-1"><AlertCircle className="w-2 h-2" /> Shortage</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 group-hover:translate-x-[-4px] transition-transform">
                                                <div className="text-right">
                                                    <p className="font-black text-indigo-600">{data.gradePercentage}%</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{data.gradePercentage >= 90 ? 'O' : data.gradePercentage >= 80 ? 'A+' : data.gradePercentage >= 70 ? 'A' : data.gradePercentage >= 60 ? 'B' : 'C'}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600" />
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentMarksView;
