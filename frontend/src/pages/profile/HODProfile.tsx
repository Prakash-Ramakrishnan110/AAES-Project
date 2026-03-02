import React from 'react';
import { motion } from 'framer-motion';
import { Building2, BookOpen, GraduationCap, TrendingUp, UserCheck } from 'lucide-react';

interface HODStatsProps {
    stats: {
        deptIntelligence?: {
            totalStaff: number;
            totalStudents: number;
            activeSubjects: number;
            averageAttendance: string;
        };
        studentDistribution?: {
            year1: number;
            year2: number;
            year3: number;
            year4: number;
        };
    };
    department: string;
}

const HODProfile: React.FC<HODStatsProps> = ({ stats, department }) => {
    const intelligence = stats.deptIntelligence || { totalStaff: 0, totalStudents: 0, activeSubjects: 0, averageAttendance: '0%' };
    const distribution = stats.studentDistribution || { year1: 0, year2: 0, year3: 0, year4: 0 };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Building2 size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-indigo-900">Department of {department}</h3>
                    <p className="text-sm text-indigo-600">Department Intelligence & Overview</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm">Faculty Count</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{intelligence.totalStaff}</h3>
                        </div>
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><UserCheck size={20} /></div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm">Student Body</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{intelligence.totalStudents}</h3>
                        </div>
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><GraduationCap size={20} /></div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm">Active Subjects</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{intelligence.activeSubjects}</h3>
                        </div>
                        <div className="bg-green-100 text-green-600 p-2 rounded-lg"><BookOpen size={20} /></div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm">Avg. Attendance</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{intelligence.averageAttendance}</h3>
                        </div>
                        <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg"><TrendingUp size={20} /></div>
                    </div>
                </motion.div>
            </div>

            {/* Student Distribution */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Student Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-3xl font-bold text-indigo-600">{distribution.year1}</div>
                        <div className="text-sm text-gray-500 mt-1">1st Year</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-3xl font-bold text-blue-600">{distribution.year2}</div>
                        <div className="text-sm text-gray-500 mt-1">2nd Year</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-3xl font-bold text-purple-600">{distribution.year3}</div>
                        <div className="text-sm text-gray-500 mt-1">3rd Year</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-3xl font-bold text-green-600">{distribution.year4}</div>
                        <div className="text-sm text-gray-500 mt-1">4th Year</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HODProfile;
