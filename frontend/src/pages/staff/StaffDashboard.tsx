import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StaffDashboard = () => {
    const { token } = useContext(AuthContext)!;
    const [stats, setStats] = useState({
        subjectCount: 0,
        assignmentCount: 0,
        submissionCount: 0,
        pendingGrading: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5000/api/assignments/stats/staff', config);
                setStats(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, [token]);

    const data = [
        { name: 'Pending Grading', value: stats.pendingGrading, fill: '#EAB308' },
        { name: 'Graded', value: stats.submissionCount - stats.pendingGrading, fill: '#22C55E' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
                    <h3 className="text-gray-500 text-sm uppercase">My Subjects</h3>
                    <div className="text-3xl font-bold">{stats.subjectCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm uppercase">Assignments Created</h3>
                    <div className="text-3xl font-bold">{stats.assignmentCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm uppercase">Total Submissions</h3>
                    <div className="text-3xl font-bold">{stats.submissionCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm uppercase">Pending Grading</h3>
                    <div className="text-3xl font-bold">{stats.pendingGrading}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                    <div className="flex flex-col space-y-3">
                        <Link to="/staff/assignments" className="text-center bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                            Create / Manage Assignments
                        </Link>
                        <Link to="/staff/my-subjects" className="text-center bg-gray-600 text-white py-2 rounded hover:bg-gray-700">
                            View My Subjects
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-lg font-bold mb-4">Submission Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
