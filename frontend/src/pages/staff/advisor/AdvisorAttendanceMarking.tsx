import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { 
    CheckCircle, XCircle, CalendarDays, Clock, 
    ChevronLeft, Save, Check, AlertTriangle, 
    MessageSquare, UserCheck, Users 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionCard from '../../../components/ui/SectionCard';

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type Status = 'Present' | 'Absent' | 'Leave' | 'OD';

interface StudentRecord {
    studentId: string;
    name: string;
    registerNumber?: string;
    status: Status;
    reason: string;
}

const AdvisorAttendanceMarking = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const [classInfo, setClassInfo] = useState<any>(null);
    const [students, setStudents] = useState<StudentRecord[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [period, setPeriod] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const loadClassAndStudents = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API}/api/attendance/advisor-students`, config);
                setClassInfo({
                    department: res.data.department,
                    academicYear: res.data.academicYear
                });
                
                const studentList = res.data.students.map((s: any) => ({
                    studentId: s._id,
                    name: s.fullName || s.username,
                    registerNumber: s.registerNumber,
                    status: 'Present' as Status,
                    reason: ''
                }));
                setStudents(studentList);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load class data');
            } finally {
                setLoading(false);
            }
        };

        if (token) loadClassAndStudents();
    }, [token]);

    const handleStatusChange = (studentId: string, newStatus: Status) => {
        setStudents(prev => prev.map(s => 
            s.studentId === studentId ? { ...s, status: newStatus, reason: newStatus === 'Present' || newStatus === 'Leave' ? '' : s.reason } : s
        ));
    };

    const handleReasonChange = (studentId: string, reason: string) => {
        setStudents(prev => prev.map(s => 
            s.studentId === studentId ? { ...s, reason } : s
        ));
    };

    const markAll = (status: Status) => {
        setStudents(prev => prev.map(s => ({ ...s, status, reason: '' })));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        try {
            await axios.post(`${API}/api/attendance`, {
                date,
                period: 0, // Morning Attendance
                department: classInfo.department,
                academicYear: classInfo.academicYear,
                records: students.map(s => ({ 
                    studentId: s.studentId, 
                    status: s.status,
                    reason: s.reason 
                }))
            }, config);
            
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        present: students.filter(s => s.status === 'Present').length,
        absent: students.filter(s => s.status === 'Absent').length,
        od: students.filter(s => s.status === 'OD').length,
        leave: students.filter(s => s.status === 'Leave').length,
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Class Attendance</h1>
                        <p className="text-sm text-slate-500 font-medium">
                            {classInfo?.department} • {classInfo?.academicYear}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{stats.present} Present</span>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase mt-1">{stats.absent} Absent</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SectionCard title="Morning Session" icon={<Clock />} className="h-full">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Roll Call Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Quick Actions" icon={<Users />} className="h-full">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => markAll('Present')} className="btn-saas bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 py-3">
                            <UserCheck className="w-4 h-4 mr-2" /> All Present
                        </button>
                        <button onClick={() => markAll('Absent')} className="btn-saas bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100 py-3">
                            <XCircle className="w-4 h-4 mr-2" /> All Absent
                        </button>
                    </div>
                </SectionCard>
            </div>

            {/* Student List */}
            <SectionCard title="Student Roll Call" icon={<Users />} subtitle="Toggle status and add reasons">
                <div className="space-y-3">
                    {students.map((student, idx) => (
                        <div key={student.studentId} className="group p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{student.name}</h4>
                                        <p className="text-[11px] text-slate-500 font-medium font-mono uppercase tracking-tighter">{student.registerNumber}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {(['Present', 'Absent', 'OD', 'Leave'] as Status[]).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(student.studentId, status)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                                student.status === status 
                                                    ? status === 'Present' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                                                    : status === 'Absent' ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200'
                                                    : status === 'OD' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                                    : 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200'
                                                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence>
                                {(student.status === 'Absent' || student.status === 'OD') && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mt-3"
                                    >
                                        <div className="relative">
                                            <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                            <input
                                                type="text"
                                                placeholder={`Reason for ${student.status.toLowerCase()}...`}
                                                value={student.reason}
                                                onChange={e => handleReasonChange(student.studentId, e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/10 outline-none"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Submit */}
            <div className="sticky bottom-6 left-0 right-0">
                {error && (
                    <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}
                
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200 transition-all disabled:opacity-50"
                >
                    {saved ? (
                        <><Check className="w-5 h-5" /> Attendance Finalized!</>
                    ) : saving ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Committing Records...</>
                    ) : (
                        <><Save className="w-5 h-5" /> Push Attendance Log</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AdvisorAttendanceMarking;
