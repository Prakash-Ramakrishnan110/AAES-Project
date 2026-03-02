import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { ChevronLeft, AlertTriangle, TrendingUp, Users, Download, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const API = 'http://localhost:5000';

const riskStyle = (risk: string) => {
    if (risk === 'high') return 'bg-red-50 text-red-700 border-red-200';
    if (risk === 'moderate') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (risk === 'good') return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
};

const riskLabel = (risk: string) => {
    if (risk === 'high') return '🔴 High Risk';
    if (risk === 'moderate') return '🟡 Moderate';
    if (risk === 'good') return '🟢 Good';
    return '—';
};

const exportCSV = (data: any[], subjectName: string) => {
    const headers = ['Name', 'Register No', 'Email', 'Total Classes', 'Present', 'Absent', 'Attendance %', 'Risk'];
    const rows = data.map(s => [
        s.fullName || s.username,
        s.registerNumber || '',
        s.email || '',
        s.totalClasses,
        s.present,
        s.absent,
        s.percentage !== null ? `${s.percentage}%` : 'N/A',
        riskLabel(s.risk)
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subjectName.replace(/\s/g, '_')}_attendance.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

const SubjectAttendanceSummary = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'risk' | 'moderate' | 'good'>('all');
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API}/api/attendance/subject/${subjectId}/summary`, config);
                setData(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load summary');
            } finally {
                setLoading(false);
            }
        };
        if (token) load();
    }, [token, subjectId]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error || !data) return (
        <div className="p-12 text-center text-gray-500 text-sm">{error || 'No data found.'}</div>
    );

    const filteredStudents = data.students.filter((s: any) => {
        if (filter === 'all') return true;
        if (filter === 'risk') return s.risk === 'high';
        if (filter === 'moderate') return s.risk === 'moderate';
        if (filter === 'good') return s.risk === 'good';
        return true;
    });

    const lowAttendanceCount = data.students.filter((s: any) => s.risk === 'high').length;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/staff/my-subjects')}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Attendance Summary</h1>
                        <p className="text-sm text-gray-500">{data.subject.name} ({data.subject.code})</p>
                    </div>
                </div>
                <button
                    onClick={() => exportCSV(data.students, data.subject.name)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl"><BookOpen className="w-5 h-5 text-blue-600" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Classes Conducted</p>
                        <h3 className="text-2xl font-bold text-gray-900">{data.totalClasses}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl"><TrendingUp className="w-5 h-5 text-green-600" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Class Average</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {data.avgAttendance !== null ? `${data.avgAttendance}%` : '—'}
                        </h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl"><Users className="w-5 h-5 text-purple-600" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total Students</p>
                        <h3 className="text-2xl font-bold text-gray-900">{data.students.length}</h3>
                    </div>
                </div>
                <div className={`rounded-2xl border shadow-sm p-5 flex items-center gap-4 ${lowAttendanceCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <div className={`p-3 rounded-xl ${lowAttendanceCount > 0 ? 'bg-red-100' : 'bg-gray-50'}`}>
                        <AlertTriangle className={`w-5 h-5 ${lowAttendanceCount > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Below 75%</p>
                        <h3 className={`text-2xl font-bold ${lowAttendanceCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{lowAttendanceCount}</h3>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {([
                    { key: 'all', label: 'All Students' },
                    { key: 'risk', label: '🔴 High Risk (<75%)' },
                    { key: 'moderate', label: '🟡 Moderate (75–85%)' },
                    { key: 'good', label: '🟢 Good (>85%)' }
                ] as const).map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${filter === f.key
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                            <tr>
                                <th className="px-5 py-3">#</th>
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Register No</th>
                                <th className="px-5 py-3 text-center">Present</th>
                                <th className="px-5 py-3 text-center">Absent</th>
                                <th className="px-5 py-3 text-center">Total</th>
                                <th className="px-5 py-3 text-center">Attendance %</th>
                                <th className="px-5 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map((student: any, idx: number) => (
                                <motion.tr
                                    key={student._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className={`text-sm ${student.risk === 'high' ? 'bg-red-50/40' : ''}`}
                                >
                                    <td className="px-5 py-3.5 text-gray-400 text-xs">{idx + 1}</td>
                                    <td className="px-5 py-3.5 font-medium text-gray-800">{student.fullName || student.username}</td>
                                    <td className="px-5 py-3.5 text-gray-500">{student.registerNumber || '—'}</td>
                                    <td className="px-5 py-3.5 text-center font-semibold text-green-600">{student.present}</td>
                                    <td className="px-5 py-3.5 text-center font-semibold text-red-500">{student.absent}</td>
                                    <td className="px-5 py-3.5 text-center text-gray-500">{student.totalClasses}</td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className={`font-bold ${student.risk === 'high' ? 'text-red-600' : student.risk === 'moderate' ? 'text-amber-600' : 'text-green-600'}`}>
                                            {student.percentage !== null ? `${student.percentage}%` : '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${riskStyle(student.risk)}`}>
                                            {riskLabel(student.risk)}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-5 py-8 text-center text-gray-400 text-sm">No students match this filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubjectAttendanceSummary;
