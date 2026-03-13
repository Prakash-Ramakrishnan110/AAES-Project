import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Search, Mail, GraduationCap, ChevronRight, Download, FileBadge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

interface Student {
    _id: string;
    fullName?: string;
    username: string;
    email: string;
    registerNumber?: string;
    batch?: string;
    section?: string;
    academicYear?: string;
    semester?: string;
}

const StaffStudentList = () => {
    const { token, user } = useContext(AuthContext)!;
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Using new dedicated endpoint for staff student directory
                const { data } = await axios.get(`${API}/api/users/staff-students`, config);
                setStudents(data);
            } catch (err) {
                console.error('Error fetching students:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchStudents();
    }, [token, API]);

    const handleExportExcel = () => {
        if (!students.length) return;

        const exportData = filteredStudents.map(student => ({
            'Full Name': student.fullName || student.username,
            'Username': student.username,
            'Register Number': student.registerNumber || '—',
            'Email Address': student.email,
            'Batch': student.batch || '—',
            'Section': student.section || '—',
            'Academic Year': student.academicYear || '—'
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
            { wch: 15 }  // Year
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `Student_Directory_${user?.department || 'Department'}_${new Date().toLocaleDateString()}.xlsx`);
    };

    const handleDownloadZip = async (studentId: string, registerNumber: string) => {
        try {
            const config = { 
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' as const
            };
            const res = await axios.get(`${API}/api/student-documents/download-all/${studentId}`, config);

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${registerNumber}_Documents.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error downloading ZIP:', err);
            alert('Failed to generate ZIP. No documents found or server error.');
        }
    };

    const filteredStudents = students.filter(s =>
        (s.fullName || s.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.registerNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.username).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
                    <p className="text-gray-500 text-sm">List of students in the {user?.department} department.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-2xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
                    >
                        <Download className="w-4 h-4" /> Export Excel
                    </button>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, reg no or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-80 transition-all bg-white"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Academic Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                        No students found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100/50 shadow-sm group-hover:scale-105 transition-transform">
                                                    {(student.fullName || student.username).charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 leading-snug">
                                                        {student.fullName || student.username}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 font-medium tracking-tight">@{student.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 bg-amber-50 rounded-md border border-amber-100">
                                                        <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700">{student.registerNumber || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 pl-0.5">
                                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100 font-bold uppercase tracking-wider">
                                                        {student.academicYear || 'Year'}
                                                    </span>
                                                    {student.section && (
                                                        <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg border border-gray-100 font-bold uppercase">
                                                            Sec {student.section}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{student.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 pl-6">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                                                        {student.batch || 'Batch'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleDownloadZip(student._id, student.registerNumber || student.username)}
                                                className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all border border-amber-100"
                                                title="Download Documents ZIP"
                                            >
                                                <FileBadge className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    console.log(`[StaffStudentList] Navigating to profile: ${student._id}`);
                                                    navigate(`/profile/${student._id}`);
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md hover:translate-x-1"
                                            >
                                                View Profile <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffStudentList;
