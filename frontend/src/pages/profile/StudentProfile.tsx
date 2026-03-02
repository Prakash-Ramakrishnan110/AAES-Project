import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Trophy, TrendingUp, Calendar } from 'lucide-react';
import StudentTimeline from '../../components/analytics/StudentTimeline';

interface StudentStatsProps {
    stats: {
        academicSummary?: {
            totalSubmitted: number;
            evaluated: number;
            pending: number;
            overallAverage: number;
        };
        subjectPerformance?: Array<{
            name: string;
            code: string;
            average: number;
            assignments: number;
        }>;
        recentActivity?: Array<{
            assignment: string;
            status: string;
            marks: number;
            date: string;
        }>;
    };
    studentId: string;
    token: string;
}

const StudentProfile: React.FC<StudentStatsProps> = ({ stats, studentId, token }) => {
    const summary = stats.academicSummary || { totalSubmitted: 0, evaluated: 0, pending: 0, overallAverage: 0 };
    const subjects = stats.subjectPerformance || [];
    const recent = stats.recentActivity || [];

    return (
        <div className="space-y-6">
            {/* Academic Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><BookOpen size={20} /></div>
                        <h3 className="text-sm font-medium text-gray-500">Assignments</h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{summary.totalSubmitted}</div>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={12} /> {summary.evaluated} evaluated</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600"><Trophy size={20} /></div>
                        <h3 className="text-sm font-medium text-gray-500">Avg. Score</h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{summary.overallAverage.toFixed(1)}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${summary.overallAverage}%` }}></div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><Clock size={20} /></div>
                        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{summary.pending}</div>
                    <p className="text-xs text-gray-500 mt-1">Awaiting evaluation</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><TrendingUp size={20} /></div>
                        <h3 className="text-sm font-medium text-gray-500">Performance</h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">Good</div>
                    <p className="text-xs text-purple-600 mt-1">Top 15% of class</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subject Performance */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-indigo-600" /> Subject Performance
                    </h3>
                    <div className="space-y-4">
                        {subjects.map((sub, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-gray-800">{sub.name}</h4>
                                    <p className="text-xs text-gray-500">{sub.code} • {sub.assignments} Assignments</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg font-bold ${sub.average >= 75 ? 'text-green-600' : sub.average >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {sub.average}%
                                    </span>
                                </div>
                            </div>
                        ))}
                        {subjects.length === 0 && <p className="text-gray-500 text-center py-4">No academic data available yet.</p>}
                    </div>
                </motion.div>

                {/* Recent Activity (Legacy - keeping but small) */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-indigo-600" /> Recent Hits
                    </h3>
                    <div className="space-y-4">
                        {recent.map((item, idx) => (
                            <div key={idx} className="border-l-2 border-indigo-200 pl-4 py-1">
                                <p className="text-sm font-medium text-gray-800 truncate">{item.assignment}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === 'Evaluated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                    {item.marks !== undefined && (
                                        <span className="text-[10px] font-bold text-gray-600">{item.marks} marks</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {recent.length === 0 && <p className="text-gray-500 text-center py-4 text-xs">No recent activity.</p>}
                    </div>
                </motion.div>
            </div>

            {/* NEW Full Analytics Timeline */}
            <StudentTimeline studentId={studentId} token={token} />
        </div>
    );
};

export default StudentProfile;
