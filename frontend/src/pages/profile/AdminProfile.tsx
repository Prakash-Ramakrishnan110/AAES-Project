import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

interface AdminStatsProps {
    stats: {
        globalStats?: {
            totalUsers: number;
            totalDepts: number;
            totalSubjects: number;
            totalAssignments: number;
        };
        governance?: {
            activeUsers: number;
            inactiveUsers: number;
            recentLogins: number;
        };
    };
}

const AdminProfile: React.FC<AdminStatsProps> = ({ stats }) => {
    const global = stats.globalStats || { totalUsers: 0, totalDepts: 0, totalSubjects: 0, totalAssignments: 0 };
    const governance = stats.governance || { activeUsers: 0, inactiveUsers: 0, recentLogins: 0 };

    return (
        <div className="space-y-6">
            <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="text-yellow-400" />
                    <h2 className="text-xl font-bold">System Governance Overview</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-3xl font-bold mt-1">{global.totalUsers}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Departments</p>
                        <p className="text-3xl font-bold mt-1">{global.totalDepts}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Subjects</p>
                        <p className="text-3xl font-bold mt-1">{global.totalSubjects}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Assignments</p>
                        <p className="text-3xl font-bold mt-1">{global.totalAssignments}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-green-600" /> System Health
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-700">Active User Accounts</span>
                            <span className="font-bold text-green-700">{governance.activeUsers}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="text-gray-700">Inactive/Soft Deleted</span>
                            <span className="font-bold text-red-700">{governance.inactiveUsers}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-gray-700">New Logins (Approx)</span>
                            <span className="font-bold text-blue-700">{governance.recentLogins}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                    <AlertTriangle size={48} className="text-yellow-500 mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-gray-800">Admin Control Center</h3>
                    <p className="text-gray-500 mt-2 text-sm max-w-xs">
                        Profile information is read-only. To manage the system, navigate to the respective Admin Modules.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminProfile;
