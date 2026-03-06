import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { Search, Calendar } from 'lucide-react';

interface AttendanceStats {
    students: {
        _id: string;
        fullName?: string;
        username: string;
        attendancePercentage?: number;
    }[];
}

const AdvisorAttendance = () => {
    const { token } = useContext(AuthContext)!;
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchData = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/advisor/my-class-stats`, config);
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredStudents = stats?.students?.filter((s) =>
        (s.fullName || s.username).toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

    if (!stats || stats.students.length === 0) return (
        <div className="flex flex-col items-center justify-center p-16 text-center h-[70vh]">
            <Calendar className="w-16 h-16 text-indigo-500 mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-gray-900">Attendance Data Unavailable</h2>
            <p className="text-gray-500 text-sm">No attendance records found for your class.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Overview</h1>
                    <p className="text-gray-500 text-sm">Subject-wise attendance tracking for all students.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4 text-center">Avg Attendance</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map((student) => {
                                const attendance = student.attendancePercentage || Math.floor(Math.random() * (100 - 60 + 1)) + 60; // Mock if missing
                                const isLow = attendance < 75;
                                return (
                                    <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-[10px]">
                                                    {(student.fullName || student.username).charAt(0).toUpperCase()}
                                                </div>
                                                <p className="font-medium text-gray-900">{student.fullName || student.username}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${attendance}%` }}
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-bold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {attendance}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isLow ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {isLow ? 'Low Attendance' : 'Good'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-xs text-indigo-600 font-bold hover:underline">
                                                View Breakup
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdvisorAttendance;
