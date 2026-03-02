import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    BarChart3, Filter,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

const AttendanceDashboard = () => {
    const { user, token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const isHOD = user?.role === 'hod';
    const isStudent = user?.role === 'student';

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);

    // HOD Filters
    const [filters, setFilters] = useState({
        year: '',
    });

    useEffect(() => {
        if (isHOD) fetchHODView();
        else if (isStudent) fetchStudentView();
        else fetchStaffView();
    }, [token, filters.year]);

    const fetchStaffView = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // For staff, we just list their subjects as entry points
            const res = await axios.get(`${API}/api/subjects?staffId=${user?.id}`, config);
            setItems(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchHODView = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API}/api/attendance/hod?year=${filters.year}`, config);
            setItems(res.data.subjects);
            setStats(res.data.staffStats);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchStudentView = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API}/api/attendance/my`, config);
            setItems(res.data);

            // Calculate overall stats for student
            const valid = res.data.filter((s: any) => s.percentage !== null);
            if (valid.length > 0) {
                setStats({
                    overallAvg: valid.reduce((acc: number, s: any) => acc + s.percentage, 0) / valid.length,
                    lowCount: valid.filter((s: any) => s.percentage < 75).length
                });
            } else {
                setStats({ overallAvg: 0, lowCount: 0 });
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Tracking</h1>
                    <p className="text-gray-500 text-sm">
                        {isHOD ? 'Monitor department-wide attendance and staff marking progress.' :
                            isStudent ? 'Track your attendance across all subjects.' :
                                'Mark and manage attendance for your assigned subjects.'}
                    </p>
                </div>

                {isHOD && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select className="text-sm font-semibold text-gray-700 bg-transparent outline-none"
                                value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })}>
                                <option value="">All Years</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={isHOD ? 'hod' : isStudent ? 'student' : 'staff'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Summary Cards for HOD */}
                    {isHOD && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="bg-indigo-600 text-white border-none shadow-indigo-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Overall Avg.</p>
                                <p className="text-3xl font-black">
                                    {Math.round(items.reduce((acc, s) => acc + (s.avgAttendance || 0), 0) / (items.filter(s => s.avgAttendance !== null).length || 1))}%
                                </p>
                            </Card>
                            <Card className="bg-white border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Subjects</p>
                                <p className="text-3xl font-black text-gray-900">{items.length}</p>
                            </Card>
                            <Card className="bg-white border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Staff</p>
                                <p className="text-3xl font-black text-gray-900">{stats.length}</p>
                            </Card>
                            <Card className="bg-white border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Low Attendance</p>
                                <p className="text-3xl font-black text-red-500">{items.filter(s => s.avgAttendance !== null && s.avgAttendance < 75).length}</p>
                            </Card>
                        </div>
                    )}

                    {/* Summary Cards for Student */}
                    {isStudent && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-indigo-600 text-white border-none shadow-indigo-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Overall Avg.</p>
                                <p className="text-3xl font-black">{Math.round(stats.overallAvg)}%</p>
                            </Card>
                            <Card className="bg-white border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Subjects</p>
                                <p className="text-3xl font-black text-gray-900">{items.length}</p>
                            </Card>
                            <Card className="bg-white border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Needs Attention</p>
                                <p className="text-3xl font-black text-red-500">{stats.lowCount}</p>
                            </Card>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                                    {!isStudent && <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Context</th>}
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{isStudent ? 'Present/Total' : 'Classes'}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{isStudent ? 'Attend. %' : 'Avg. %'}</th>
                                    {!isStudent && <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={isStudent ? 4 : 5} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
                                ) : items.length === 0 ? (
                                    <tr><td colSpan={isStudent ? 4 : 5} className="py-20 text-center text-gray-400 italic">No data available.</td></tr>
                                ) : (
                                    items.map(item => (
                                        <tr key={item._id || item.subjectId} className="hover:bg-indigo-50/10 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 font-bold text-[10px] uppercase">{item.code?.substring(0, 2)}</div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{item.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {!isStudent && (
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <p className="text-xs font-semibold text-gray-600">{item.academicYear} · Sem {item.semester}</p>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-center">
                                                {isStudent ? (
                                                    <span className="text-xs font-bold text-gray-800">{item.present || 0} / {item.total || 0}</span>
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-800">{item.totalClasses || 0}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.percentage !== undefined || item.avgAttendance !== undefined ? (
                                                    <div className={`text-sm font-black ${(isStudent ? item.percentage : item.avgAttendance) < 75 ? 'text-red-500' : 'text-green-600'}`}>
                                                        {(isStudent ? item.percentage : item.avgAttendance) === null ? '—' : `${isStudent ? item.percentage : item.avgAttendance}%`}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                            {!isStudent && (
                                                <td className="px-6 py-4 text-right">
                                                    {isHOD ? (
                                                        <Button size="sm" variant="outline" onClick={() => navigate(`/staff/attendance/${item._id}/summary`)} icon={<BarChart3 className="w-3.5 h-3.5" />}>Summary</Button>
                                                    ) : (
                                                        <div className="flex gap-2 justify-end">
                                                            <Button size="sm" variant="outline" onClick={() => navigate(`/staff/attendance/${item._id}/summary`)}><BarChart3 className="w-3.5 h-3.5" /></Button>
                                                            <Button size="sm" onClick={() => navigate(`/staff/attendance/${item._id}`)} icon={<ArrowRight className="w-3.5 h-3.5" />}>Mark</Button>
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AttendanceDashboard;
