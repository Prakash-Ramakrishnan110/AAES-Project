import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { Search, Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Student {
    _id: string;
    fullName?: string;
    username: string;
    registerNumber?: string;
    email: string;
    semester: number;
    avgScore: number | null;
}

const AdvisorStudentList = () => {
    const { token } = useContext(AuthContext)!;
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchStudents = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/advisor/my-class-stats`, config);
            setStudents(data.students);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const filteredStudents = students.filter(s =>
        (s.fullName || s.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.registerNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

    if (students.length === 0) return (
        <div className="flex flex-col items-center justify-center p-16 text-center h-[70vh]">
            <Shield className="w-16 h-16 text-amber-500 mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-gray-900">No Students Found</h2>
            <p className="text-gray-500 text-sm">No students are currently associated with your class.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student List</h1>
                    <p className="text-gray-500 text-sm">Detailed directory of all students in your assigned class.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search name or reg no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Registration No</th>
                            <th className="px-6 py-4 text-center">Semester</th>
                            <th className="px-6 py-4 text-center">Avg Score</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredStudents.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                            {(student.fullName || student.username).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{student.fullName || student.username}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                    {student.registerNumber || student.username.toUpperCase()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                        SEM {student.semester}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={`text-sm font-bold ${(student.avgScore ?? 0) < 50 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {student.avgScore !== null ? `${student.avgScore.toFixed(1)}%` : '—'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => navigate(`/profile/${student._id}`)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                    >
                                        View Profile <ChevronRight className="w-3 h-3" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdvisorStudentList;
