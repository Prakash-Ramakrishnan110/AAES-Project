import { useState, useEffect, useContext, cloneElement } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import {
    Users, AlertTriangle, BarChart3, Filter, Clock, Eye, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MorningAttendanceModal from '../../components/modals/MorningAttendanceModal';


const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const AttendanceDashboard = () => {
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();

    const { user, token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const isHOD = user?.role === 'hod';
    const isStudent = user?.role === 'student';
    const isPrincipal = user?.role === 'principal';

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);

    // HOD Filters
    const [filters, setFilters] = useState({
        year: '',
    });

    const [activeTab, setActiveTab] = useState<'subject' | 'morning'>('subject');
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setHeaderOptions({
            title: isPrincipal ? 'Institutional Attendance board' : 'Attendance Intelligence',
            subtitle: isPrincipal ? 'Campus-wide Resource Analytics' : 'Institutional Resource Tracking',
        });
    }, [setHeaderOptions, isPrincipal]);

    useEffect(() => {
        if (isPrincipal) fetchPrincipalView();
        else if (isHOD) fetchHODView();
        else if (isStudent) fetchStudentView();
        else fetchStaffView();
    }, [token, filters.year]);

    const fetchPrincipalView = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API}/api/attendance/principal`, config);
            setItems(res.data);
            
            // Calculate overall institutional average
            if (res.data.length > 0) {
                const total = res.data.reduce((acc: number, d: any) => acc + d.avgAttendance, 0);
                const recordedDepts = res.data.filter((d: any) => d.recordedByMorning).length;
                setStats({
                    overallAvg: total / res.data.length,
                    totalDepts: res.data.length,
                    recordedByMorning: recordedDepts > 0
                });
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchStaffView = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // For staff, we just list their subjects as entry points
            const res = await axios.get(`${API}/api/subjects?staffId=${user?._id || user?.id}`, config);
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
            setStats({
                ...res.data,
                // Normalize property locations for resilience
                morningAvg: res.data.morningAvg ?? res.data.morningAttendance?.avg,
                recentMorningSessions: res.data.recentMorningSessions ?? res.data.morningAttendance?.recentSessions,
                hasStats: true
            });
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchStudentView = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API}/api/attendance/my`, config);
            const attendanceData = res.data.stats || res.data; // Support both old and new format
            setItems(attendanceData);

            // Calculate overall stats for student
            const valid = attendanceData.filter((s: any) => s.percentage !== null);
            if (valid.length > 0) {
                setStats({
                    overallAvg: valid.reduce((acc: number, s: any) => acc + s.percentage, 0) / valid.length,
                    lowCount: valid.filter((s: any) => s.percentage < 75).length
                });
            } else {
                setStats({ overallAvg: 0, lowCount: 0 });
            }
        } catch (error: any) {
            console.error(error);
            alert(`Error fetching attendance: ${error.message}. API: ${API}`);
        } finally {
            setLoading(false);
        }
    };

    const handleViewMorningDetails = async (sessionId: string) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/attendance/morning/details?sessionId=${sessionId}`, config);
            setSelectedSession(data);
            setIsModalOpen(true);
        } catch (err) {
            console.error("Error fetching morning details:", err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Tracking</h1>
                    <p className="text-gray-500 text-sm">
                        {isPrincipal ? 'Campus-wide attendance oversight and departmental comparisons.' :
                            isHOD ? 'Monitor department-wide attendance and staff marking progress.' :
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

            {/* Tab System for HOD/Principal */}
            {(isHOD || isPrincipal) && (
                <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('subject')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'subject' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Subject Attendance
                    </button>
                    <button
                        onClick={() => setActiveTab('morning')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'morning' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Morning Roll Call
                    </button>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div key={isPrincipal ? 'principal' : isHOD ? 'hod' : isStudent ? 'student' : 'staff'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Summary Cards */}
                    {(isPrincipal || isHOD || isStudent) && stats && (
                        <div className={`grid grid-cols-2 ${isPrincipal || isHOD ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
                            {isPrincipal ? (
                                <>
                                    <StatCard label="Campus Morning Avg." value={`${Math.round(stats.overallAvg)}%`} color="blue" icon={<BarChart3 />} />
                                    <StatCard label="Departments" value={stats.totalDepts} color="indigo" icon={<Filter />} />
                                    <StatCard label="Reporting Pattern" value={stats.recordedByMorning ? "Morning Roll Call" : "Period Aggregates"} color="amber" icon={<Users />} />
                                    <StatCard label="Critical Depts" value={items.filter(d => d.avgAttendance < 75).length} color="red" icon={<AlertTriangle />} />
                                </>
                            ) : isHOD ? (
                                <>
                                    <StatCard label="Morning Attendance" value={stats.morningAvg !== null ? `${stats.morningAvg}%` : 'N/A'} color="blue" icon={<BarChart3 />} />
                                    <StatCard label="Subjects Performance" value={`${Math.round(items.reduce((acc, s) => acc + (s.avgAttendance || 0), 0) / (items.filter(s => s.avgAttendance !== null).length || 1))}%`} color="indigo" icon={<Filter />} />
                                    <StatCard label="Staff Monitored" value={stats.staffStats?.length || 0} color="amber" icon={<Users />} />
                                    <StatCard label="At Risk (Subjects)" value={items.filter(s => s.avgAttendance !== null && s.avgAttendance < 75).length} color="red" icon={<AlertTriangle />} />
                                </>
                            ) : (
                                <>
                                    <StatCard label="Overall Avg." value={`${Math.round(stats.overallAvg)}%`} color="blue" icon={<BarChart3 />} />
                                    <StatCard label="Enrollments" value={items.length} color="indigo" icon={<Filter />} />
                                    <StatCard label="Low Attendance" value={stats.lowCount} color="red" icon={<AlertTriangle />} />
                                </>
                            )}
                        </div>
                    )}
 
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                        {activeTab === 'subject' ? (
                            <table className="w-full text-left border-collapse table-compact">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{isPrincipal ? 'Department' : 'Subject'}</th>
                                        {!isStudent && !isPrincipal && <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Details</th>}
                                        {isPrincipal && <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Subject Count</th>}
                                        <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">{isStudent ? 'Record' : 'Classes'}</th>
                                        <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Percentage</th>
                                        {!isStudent && <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={isStudent ? 4 : 5} className="px-5 py-4"><div className="h-4 bg-gray-50 rounded animate-pulse" /></td></tr>)
                                    ) : items.length === 0 ? (
                                        <tr><td colSpan={isStudent ? 4 : 5} className="py-16 text-center text-gray-400 text-xs font-bold uppercase tracking-wider">No records found</td></tr>
                                    ) : (
                                        items.map(item => (
                                            <tr key={isPrincipal ? item.department : (item._id || item.subjectId)} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 bg-blue-50 rounded text-blue-600 font-bold text-[10px] uppercase shrink-0">
                                                            {isPrincipal ? item.department.substring(0, 3) : item.code?.substring(0, 2)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-[13px] text-gray-900 leading-tight truncate">{isPrincipal ? item.department : item.name}</p>
                                                            {!isPrincipal && <p className="text-[10px] text-gray-400 font-medium truncate">{item.code}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                {!isStudent && !isPrincipal && (
                                                    <td className="px-5 py-3 hidden md:table-cell">
                                                        <p className="text-[11px] font-semibold text-gray-600">{item.academicYear} · Sem {item.semester}</p>
                                                    </td>
                                                )}
                                                {isPrincipal && (
                                                    <td className="px-5 py-3 hidden md:table-cell">
                                                        <p className="text-[11px] font-semibold text-gray-600">{item.subjectCount} Subjects</p>
                                                    </td>
                                                )}
                                                <td className="px-5 py-3 text-center">
                                                    <span className="text-[11px] font-bold text-gray-700">
                                                        {isStudent ? `${item.present || 0}/${item.total || 0}` : (item.totalClasses || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <div className={`text-[11px] font-black ${(isStudent ? (item.percentage ?? 0) : (item.avgAttendance ?? 0)) < 75 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {(isStudent ? item.percentage : item.avgAttendance) === null ? '—' : `${isStudent ? item.percentage : item.avgAttendance}%`}
                                                    </div>
                                                </td>
                                                {!isStudent && (
                                                    <td className="px-5 py-3 text-right">
                                                        {isPrincipal ? (
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Institutional Board</span>
                                                        ) : isHOD ? (
                                                            <button 
                                                                onClick={() => navigate(`/hod/attendance/${item._id}/summary`)}
                                                                className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
                                                            >
                                                                View Summary
                                                            </button>
                                                        ) : (
                                                            <div className="flex gap-2 justify-end">
                                                                <button 
                                                                    onClick={() => navigate(`/staff/attendance/${item._id}/summary`)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                >
                                                                    <BarChart3 size={14} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => navigate(`/staff/attendance/${item._id}`)}
                                                                    className="px-3 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold uppercase tracking-tight text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    Mark
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {isHOD && stats?.recentMorningSessions?.length > 0 ? (
                                        stats.recentMorningSessions.map((session: any) => (
                                            <MorningSessionCard 
                                                key={session._id} 
                                                session={session} 
                                                onView={() => handleViewMorningDetails(session._id)}
                                            />
                                        ))
                                    ) : (isPrincipal && items.length > 0) ? (
                                        items.map((dept: any) => (
                                            <div key={dept.department} className="space-y-4">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">{dept.department}</h4>
                                                <div className="space-y-3">
                                                    {dept.recentMorningSessions?.map((session: any) => (
                                                        <MorningSessionCard 
                                                            key={session._id} 
                                                            session={session} 
                                                            compact
                                                            onView={() => handleViewMorningDetails(session._id)}
                                                        />
                                                    ))}
                                                    {(!dept.recentMorningSessions || dept.recentMorningSessions.length === 0) && (
                                                        <p className="text-[10px] text-slate-400 italic px-2">No recent morning roll calls.</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                            <div className="col-span-full py-12 text-center">
                                                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No morning sessions recorded yet.</p>
                                            </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            <MorningAttendanceModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                sessionData={selectedSession}
            />
        </div>
    );
};

const StatCard = ({ label, value, icon, color }: any) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        indigo: 'text-indigo-600 bg-indigo-50',
        amber: 'text-amber-600 bg-amber-50',
        red: 'text-red-600 bg-red-50'
    };
 
    return (
        <motion.div 
            whileHover={{ y: -2 }}
            className="stat-card-compact flex items-center gap-4 px-5"
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                {cloneElement(icon as any, { size: 18, strokeWidth: 2 })}
            </div>
            <div className="min-w-0 flex-1 text-left">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight truncate">{label}</p>
                <h3 className="text-xl font-bold text-gray-900 leading-none mt-0.5">{value}</h3>
            </div>
        </motion.div>
    );
};

const MorningSessionCard = ({ session, onView, compact = false }: any) => (
    <motion.div 
        whileHover={{ y: -4 }}
        className={`bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all group ${compact ? 'p-4' : ''}`}
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all ${compact ? 'p-2' : ''}`}>
                <Calendar size={compact ? 16 : 20} />
            </div>
            {!compact && (
                <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {session.academicYear}
                </div>
            )}
        </div>
        
        <h4 className={`font-bold text-slate-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </h4>
        
        {!compact && (
            <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-50">
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Present</p>
                    <p className="text-lg font-black text-slate-900">{session.present}</p>
                </div>
                <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-50">
                    <p className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Absent</p>
                    <p className="text-lg font-black text-slate-900">{session.total - session.present}</p>
                </div>
            </div>
        )}

        <button 
            onClick={onView}
            className={`w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-2 ${compact ? 'py-2 mt-3' : ''}`}
        >
            <Eye size={14} />
            View Roll Call
        </button>
    </motion.div>
);
 
export default AttendanceDashboard;
