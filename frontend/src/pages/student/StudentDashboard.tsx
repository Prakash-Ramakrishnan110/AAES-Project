import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const StudentDashboard = () => {
    const { token } = useContext(AuthContext)!;
    const [stats, setStats] = useState({
        totalAssignments: 0,
        submittedCount: 0,
        pendingCount: 0,
        avgMarks: 0
    });
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch Stats
                const statsRes = await axios.get('http://localhost:5000/api/submissions/stats/student', config);
                setStats(statsRes.data);

                // Fetch Recent Submissions
                const subsRes = await axios.get('http://localhost:5000/api/submissions/my', config);
                setRecentSubmissions(subsRes.data.slice(0, 5)); // Top 5
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [token]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Access Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
                    <h3 className="text-gray-500 text-sm uppercase">Total Assignments</h3>
                    <div className="text-3xl font-bold">{stats.totalAssignments}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm uppercase">Submitted</h3>
                    <div className="text-3xl font-bold">{stats.submittedCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm uppercase">Pending</h3>
                    <div className="text-3xl font-bold">{stats.pendingCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm uppercase">Average Marks</h3>
                    <div className="text-3xl font-bold">{stats.avgMarks}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-4">
                        <Link to="/student/assignments" className="block w-full text-center bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700">
                            View All Assignments
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-lg font-bold mb-4">Performance History</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={recentSubmissions.map(s => ({
                                name: s.assignment?.title.substring(0, 10) + '...', // Truncate
                                marks: s.status === 'graded' ? s.marks : 0
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="marks" fill="#4F46E5" name="Marks Obtained" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-lg font-bold mb-4">Recent Submissions</h3>
                    <div className="space-y-3">
                        {recentSubmissions.length === 0 ? <p className="text-gray-500">No submissions yet.</p> : recentSubmissions.map(sub => (
                            <div key={sub._id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-semibold">{sub.assignment?.title || 'Untitled'}</p>
                                    <p className="text-xs text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {sub.status === 'graded' ? `${sub.marks} Marks` : sub.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
