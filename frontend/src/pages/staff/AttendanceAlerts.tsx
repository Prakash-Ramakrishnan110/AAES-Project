import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { AlertTriangle, AlertOctagon, Users, TrendingDown, RefreshCw, BookOpen } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AlertStudent {
    studentId: string;
    name: string;
    registerNumber: string;
    email: string;
    semester: string;
    present: number;
    total: number;
    percentage: number;
    classesNeeded: number;
    risk: 'critical' | 'warning';
}

interface AlertData {
    threshold: number;
    totalAlerts: number;
    department: string;
    academicYear: string;
    alerts: AlertStudent[];
}

const AttendanceAlerts = () => {
    const { token } = useContext(AuthContext)!;
    const toast = useToast();
    const [data, setData] = useState<AlertData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: res } = await axios.get(`${API}/api/attendance/alerts`, config);
            setData(res);
        } catch {
            toast.error('Failed to load attendance alerts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [token]);

    const filtered = data?.alerts.filter(a => filter === 'all' ? true : a.risk === filter) || [];
    const criticalCount = data?.alerts.filter(a => a.risk === 'critical').length || 0;
    const warningCount = data?.alerts.filter(a => a.risk === 'warning').length || 0;

    if (loading) return <LoadingSpinner fullPage message="Loading attendance alerts..." />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-b-2 border-red-500 inline-block pb-1">Attendance Alerts</h1>
                    <p className="text-gray-500 text-sm mt-2">Students below the 75% attendance threshold — {data?.department} · {data?.academicYear}</p>
                </div>
                <button onClick={fetchAlerts}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Alerts</p>
                            <p className="text-2xl font-black text-gray-900">{data?.totalAlerts || 0}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">Students below {data?.threshold}% attendance</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <AlertOctagon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-red-600 font-medium">Critical (&lt;60%)</p>
                            <p className="text-2xl font-black text-red-700">{criticalCount}</p>
                        </div>
                    </div>
                    <p className="text-xs text-red-400">Immediate action required</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs text-yellow-600 font-medium">Warning (60-75%)</p>
                            <p className="text-2xl font-black text-yellow-700">{warningCount}</p>
                        </div>
                    </div>
                    <p className="text-xs text-yellow-400">Monitor and counsel</p>
                </div>
            </div>

            {/* Filter Tabs + Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 p-1 gap-1 bg-gray-50/50 m-4 rounded-xl w-fit">
                    {(['all', 'critical', 'warning'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                            {f === 'all' ? `All (${data?.totalAlerts || 0})` : f === 'critical' ? `Critical (${criticalCount})` : `Warning (${warningCount})`}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={TrendingDown}
                        title={filter === 'all' ? 'No Attendance Alerts!' : `No ${filter} alerts`}
                        message={filter === 'all' ? 'All students are above the 75% attendance threshold. Great performance!' : `No students in ${filter} category.`}
                    />
                ) : (
                    <div className="overflow-x-auto pb-4 px-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3 text-center">Semester</th>
                                    <th className="px-4 py-3 text-center">Present / Total</th>
                                    <th className="px-4 py-3 text-center">Attendance %</th>
                                    <th className="px-4 py-3 text-center">Classes Needed</th>
                                    <th className="px-4 py-3 text-center">Risk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(student => (
                                    <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <p className="font-bold text-sm text-gray-900">{student.name}</p>
                                            <p className="text-xs text-gray-400">{student.registerNumber}</p>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-sm text-gray-600 font-medium">{student.semester || '—'}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">
                                            {student.present} / {student.total}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {/* Progress bar */}
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-sm font-black ${student.risk === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                    {student.percentage}%
                                                </span>
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${student.risk === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`}
                                                        style={{ width: `${student.percentage}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${student.classesNeeded > 0 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
                                                {student.classesNeeded > 0 ? `+${student.classesNeeded} classes` : 'On track'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${student.risk === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                                                {student.risk === 'critical' ? '🔴 Critical' : '🟡 Warning'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-blue-800">About Attendance Thresholds</p>
                    <p className="text-xs text-blue-600 mt-0.5">Students require minimum 75% attendance to appear for examinations. The "Classes Needed" column shows how many consecutive classes a student must attend to reach the threshold.</p>
                </div>
            </div>
        </div>
    );
};

export default AttendanceAlerts;
