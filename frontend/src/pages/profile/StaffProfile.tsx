import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, CheckSquare, BarChart2 } from 'lucide-react';

interface StaffStatsProps {
    stats: {
        teachingOverview?: {
            subjectsCount: number;
            totalStudents: number;
            assignmentsCreated: number;
        };
        evaluationStats?: {
            totalSubmissionsReceived: number;
            evaluated: number;
            pending: number;
            completionRate: number;
        };
        subjectsList?: Array<{
            name: string;
            code: string;
            semester: string;
            academicYear: string;
        }>;
    };
}

const StaffProfile: React.FC<StaffStatsProps> = ({ stats }) => {
    const overview = stats.teachingOverview || { subjectsCount: 0, totalStudents: 0, assignmentsCreated: 0 };
    const evaluation = stats.evaluationStats || { totalSubmissionsReceived: 0, evaluated: 0, pending: 0, completionRate: 0 };
    const subjects = stats.subjectsList || [];

    return (
        <div className="space-y-6">
            {/* Teaching Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 font-medium">Subjects Managed</p>
                            <h3 className="text-3xl font-bold mt-1">{overview.subjectsCount}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg"><BookOpen size={24} /></div>
                    </div>
                    <div className="mt-4 text-xs text-indigo-100 italic">
                        {subjects.length > 0
                            ? `Handling: ${[...new Set(subjects.map(s => s.academicYear))].join(', ')} • Sems: ${[...new Set(subjects.map(s => s.semester))].sort().join(', ')}`
                            : 'No active subjects'}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 font-medium">Evaluation Rate</p>
                            <h3 className="text-3xl font-bold mt-1 text-gray-800">{evaluation.completionRate}%</h3>
                        </div>
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckSquare size={24} /></div>
                    </div>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${evaluation.completionRate}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{evaluation.evaluated} evaluated / {evaluation.totalSubmissionsReceived} received</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 font-medium">Assigned Content</p>
                            <h3 className="text-3xl font-bold mt-1 text-gray-800">{overview.assignmentsCreated}</h3>
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={24} /></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Total assignments & quizzes created</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subjects List */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-indigo-600" /> Active Subjects
                    </h3>
                    <div className="space-y-3">
                        {subjects.map((sub, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold text-gray-800">{sub.name}</h4>
                                    <p className="text-xs text-gray-500">{sub.code} • {sub.academicYear}</p>
                                </div>
                                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
                                    Semester {sub.semester}
                                </span>
                            </div>
                        ))}
                        {subjects.length === 0 && <p className="text-gray-500 text-center py-4">No subjects assigned.</p>}
                    </div>
                </motion.div>

                {/* Evaluation Status */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart2 size={20} className="text-indigo-600" /> Evaluation Workload
                    </h3>
                    <div className="flex items-center justify-center p-6">
                        <div className="text-center space-y-2">
                            <div className="text-5xl font-bold text-gray-800">{evaluation.pending}</div>
                            <p className="text-gray-500">Pending Submissions</p>
                            <div className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full inline-block mt-2">
                                Action Required
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StaffProfile;
