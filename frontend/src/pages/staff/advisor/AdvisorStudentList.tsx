import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, ChevronRight, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Student {
    _id: string;
    fullName?: string;
    username: string;
    registerNumber?: string;
    email: string;
    semester: number;
    batch?: string;
    section?: string;
    avgScore: number | null;
}

const AdvisorStudentList = () => {
    const { token, user } = useContext(AuthContext)!;
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

    const handleExportExcel = () => {
        if (!students.length) return;

        const exportData = students.map(student => ({
            'Full Name': student.fullName || student.username,
            'Username': student.username,
            'Register Number': student.registerNumber || '—',
            'Email Address': student.email,
            'Batch': student.batch || '—',
            'Section': student.section || '—',
            'Semester': student.semester || 'N/A',
            'Average Score': student.avgScore !== null ? `${student.avgScore.toFixed(1)}%` : '—'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');

        // Column widths
        const wscols = [
            { wch: 25 }, // Name
            { wch: 15 }, // Username
            { wch: 20 }, // Reg No
            { wch: 30 }, // Email
            { wch: 15 }, // Batch
            { wch: 8 },  // Section
            { wch: 10 }, // Sem
            { wch: 15 }  // Score
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `Student_List_${user?.department || 'Class'}_${new Date().toLocaleDateString()}.xlsx`);
    };

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
                    <button
                        onClick={handleExportExcel}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export Excel
                    </button>
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
                            <th className="px-6 py-4">Student & ID</th>
                            <th className="px-6 py-4 text-center">Batch / Sec</th>
                            <th className="px-6 py-4">Email Address</th>
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
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                            {(student.fullName || student.username).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 leading-tight">{student.fullName || student.username}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] font-bold text-gray-400">@{student.username}</span>
                                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50/50 px-1 rounded border border-indigo-100/50">
                                                    Reg: {student.registerNumber || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                     <div className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                            {student.batch || 'Batch —'}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                            Section {student.section || '—'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs text-gray-500 max-w-[180px] truncate font-medium">{student.email}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">
                                        Sem {student.semester || '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={`text-sm font-bold ${(student.avgScore ?? 0) < 50 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {student.avgScore !== null ? `${student.avgScore.toFixed(1)}%` : '—'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => {
                                            console.log(`[AdvisorStudentList] Navigating to profile: ${student._id}`);
                                            navigate(`/profile/${student._id}`);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                                    >
                                        View Profile <ChevronRight className="w-4 h-4 ml-0.5" />
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
