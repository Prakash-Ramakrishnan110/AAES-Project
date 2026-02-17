import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts';

const Analytics = () => {
    const { token } = useContext(AuthContext)!;
    const [deptStats, setDeptStats] = useState([]);
    const [semesterStats, setSemesterStats] = useState([]);
    // const [subjectStats, setSubjectStats] = useState([]); // Can be added later for detailed view

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const deptRes = await axios.get('http://localhost:5000/api/analytics/department', config);
                setDeptStats(deptRes.data);

                const semRes = await axios.get('http://localhost:5000/api/analytics/semester', config);
                setSemesterStats(semRes.data);

            } catch (error) {
                console.error("Error fetching analytics:", error);
            }
        };
        fetchAnalytics();
    }, [token]);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">System Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Department Performance */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Department-wise Performance</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="department" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="avgMarks" fill="#4F46E5" name="Avg Marks" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Semester Trends */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Semester-wise Trends</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={semesterStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="semester" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="avgMarks" stroke="#EC4899" strokeWidth={2} name="Avg Marks" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Additional chart placeholders can go here */}
            </div>
        </div>
    );
};

export default Analytics;
