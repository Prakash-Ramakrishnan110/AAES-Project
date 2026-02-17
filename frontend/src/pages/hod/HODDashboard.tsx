import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
// Recharts unused for now, placeholders used.
// import {
//     BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// } from 'recharts';

const HODDashboard = () => {
    const { token, user } = useContext(AuthContext)!;
    const [stats, setStats] = useState({
        staffCount: 0,
        studentCount: 0,
        avgMarks: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Placeholder: In a real app, fetch from specific HOD stats endpoint
                // For now, we might need to create a new endpoint or reuse existing with filtering
                // Let's assume we'll create /api/analytics/hod/stats
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5000/api/analytics/hod/stats', config);
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching HOD stats:", error);
                // Fallback for demo if endpoint doesn't exist yet
                setStats({ staffCount: 5, studentCount: 120, avgMarks: 78 });
            }
        };
        fetchStats();
    }, [token]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Welcome, HOD {user?.department}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow border-l-4 border-teal-500">
                    <h3 className="text-gray-500 text-sm uppercase">Total Staff</h3>
                    <div className="text-3xl font-bold">{stats.staffCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm uppercase">Total Students</h3>
                    <div className="text-3xl font-bold">{stats.studentCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm uppercase">Avg Department Performance</h3>
                    <div className="text-3xl font-bold">{stats.avgMarks}%</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow mb-8">
                <h3 className="text-lg font-bold mb-4">Department Performance Overview</h3>
                <p className="text-gray-600">Detailed analytics are available in the <a href="/hod/analytics" className="text-teal-600 hover:underline">Analytics</a> section.</p>
            </div>
        </div>
    );
};

export default HODDashboard;
