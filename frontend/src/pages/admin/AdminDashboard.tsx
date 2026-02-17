import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const { token } = useContext(AuthContext)!;
    const [stats, setStats] = useState({
        studentCount: 0,
        staffCount: 0,
        deptCount: 0,
        subjectCount: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5000/api/users/stats/system', config);
                setStats(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, [token]);

    const data = [
        { name: 'Departments', count: stats.deptCount },
        { name: 'Staff', count: stats.staffCount },
        { name: 'Students', count: stats.studentCount },
        { name: 'Subjects', count: stats.subjectCount },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
                    <h3 className="text-gray-500 text-sm uppercase">Departments</h3>
                    <div className="text-3xl font-bold">{stats.deptCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm uppercase">Staff Members</h3>
                    <div className="text-3xl font-bold">{stats.staffCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm uppercase">Students</h3>
                    <div className="text-3xl font-bold">{stats.studentCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm uppercase">Subjects</h3>
                    <div className="text-3xl font-bold">{stats.subjectCount}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                    <div className="flex flex-col space-y-2">
                        <Link to="/admin/departments" className="text-indigo-600 hover:underline">Manage Departments</Link>
                        <Link to="/admin/staff" className="text-indigo-600 hover:underline">Manage Staff</Link>
                        <Link to="/admin/students" className="text-indigo-600 hover:underline">Manage Students</Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-lg font-bold mb-4">System Overview</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
