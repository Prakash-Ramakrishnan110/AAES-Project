import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, XCircle, CalendarDays, Clock, ChevronLeft, Save, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type Status = 'Present' | 'Absent' | 'Leave' | 'OD';

interface StudentRecord {
    studentId: string;
    name: string;
    registerNumber?: string;
    status: Status;
}

const AttendanceMarking = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const [subject, setSubject] = useState<any>(null);
    const [students, setStudents] = useState<StudentRecord[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [period, setPeriod] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [existingLocked, setExistingLocked] = useState(false);
    const [loadingSession, setLoadingSession] = useState(false);
    const [error, setError] = useState('');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Load subject info + students
    const loadSubjectAndStudents = async () => {
        try {
            setLoading(true);
            // Pass date to get recommendedStatus based on approved leaves/ODs
            const res = await axios.get(`${API}/api/attendance/subject/${subjectId}/students?date=${date}`, config);
            setSubject(res.data.subject);
            const studentList = res.data.students.map((s: any) => ({
                studentId: s._id,
                name: s.fullName || s.username,
                registerNumber: s.registerNumber,
                status: (s.recommendedStatus || 'Present') as Status
            }));
            setStudents(studentList);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load subject data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && subjectId) loadSubjectAndStudents();
    }, [token, subjectId, date]); // Reload when date changes to check for leaves



    // Load existing session when date/period changes
    useEffect(() => {
        const loadSession = async () => {
            if (!date || !period) return;
            setLoadingSession(true);
            setExistingLocked(false);
            try {
                const res = await axios.get(
                    `${API}/api/attendance/session?subjectId=${subjectId}&date=${date}&period=${period}`,
                    config
                );
                if (res.data && res.data.records) {
                    // Map existing records onto students
                    setStudents(prev => prev.map(s => {
                        const record = res.data.records.find((r: any) => r.student._id === s.studentId);
                        return record ? { ...s, status: record.status } : s;
                    }));
                    // Check if locked
                    if (res.data.lockedAt) {
                        setExistingLocked(true);
                    }
                }
            } catch {
                // No existing session, we already have recommendedStatus from loadSubjectAndStudents
            } finally {
                setLoadingSession(false);
            }
        };
        if (students.length > 0) loadSession();
    }, [date, period]);

    const toggleStatus = (studentId: string) => {
        if (existingLocked) return;
        setStudents(prev => prev.map(s => {
            if (s.studentId === studentId) {
                const cycle: Status[] = ['Present', 'Absent', 'Leave', 'OD'];
                const currentIndex = cycle.indexOf(s.status);
                const nextStatus = cycle[(currentIndex + 1) % cycle.length];
                return { ...s, status: nextStatus };
            }
            return s;
        }));
    };

    const markAll = (status: Status) => {
        if (existingLocked) return;
        setStudents(prev => prev.map(s => ({ ...s, status })));
    };

    const handleSubmit = async () => {
        if (existingLocked) return;
        setSaving(true);
        setError('');
        try {
            await axios.post(`${API}/api/attendance`, {
                subjectId,
                date,
                period,
                records: students.map(s => ({ studentId: s.studentId, status: s.status }))
            }, config);
            setSaved(true);
            setExistingLocked(true); // Lock locally
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const presentCount = students.filter(s => s.status === 'Present').length;
    const absentCount = students.filter(s => s.status === 'Absent').length;

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/staff/my-subjects')}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
                    {subject && (
                        <p className="text-sm text-gray-500">{subject.name} ({subject.code})</p>
                    )}
                </div>
            </div>

            {/* Session Selector */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" /> Select Session
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
                        <input
                            type="date"
                            value={date}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={e => setDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Period</label>
                        <div className="grid grid-cols-4 gap-2">
                            {PERIODS.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`py-2 text-sm font-semibold rounded-xl border transition-colors ${period === p
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lock / Status banners */}
            {existingLocked && (
                <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    This session is locked — attendance cannot be edited after it is saved.
                </div>
            )}
            {loadingSession && (
                <div className="text-xs text-gray-400 text-center py-2">Loading existing session...</div>
            )}

            {/* Action Bar */}
            {!existingLocked && students.length > 0 && (
                <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-2">
                        <button onClick={() => markAll('Present')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-semibold rounded-xl border border-green-200 transition-colors">
                            <CheckCircle className="w-4 h-4" /> All Present
                        </button>
                        <button onClick={() => markAll('Absent')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl border border-red-200 transition-colors">
                            <XCircle className="w-4 h-4" /> All Absent
                        </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="font-semibold text-green-600">{presentCount} Present</span>
                        <span className="text-gray-300">|</span>
                        <span className="font-semibold text-red-500">{absentCount} Absent</span>
                    </div>
                </div>
            )}

            {/* Student List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-800 text-sm">Student List</span>
                    <span className="ml-auto text-xs text-gray-400">{students.length} students</span>
                </div>
                {students.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 text-sm">No students enrolled for this subject.</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {students.map((student, idx) => (
                            <motion.div
                                key={student.studentId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.02 }}
                                onClick={() => toggleStatus(student.studentId)}
                                className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${existingLocked ? 'cursor-default' : 'hover:bg-gray-50'} 
                                    ${student.status === 'Present' ? 'bg-green-50/40' :
                                        student.status === 'Absent' ? 'bg-red-50/30' :
                                            student.status === 'OD' ? 'bg-blue-50/30' : 'bg-amber-50/30'}`}
                            >
                                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                                    {student.registerNumber && (
                                        <p className="text-xs text-gray-400">{student.registerNumber}</p>
                                    )}
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${student.status === 'Present' ? 'bg-green-100 text-green-700 border-green-200' :
                                        student.status === 'Absent' ? 'bg-red-100 text-red-600 border-red-200' :
                                            student.status === 'OD' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-amber-100 text-amber-700 border-amber-200'
                                    }`}>
                                    {student.status === 'Present' ? <><CheckCircle className="w-4 h-4" /> Present</> :
                                        student.status === 'Absent' ? <><XCircle className="w-4 h-4" /> Absent</> :
                                            student.status === 'OD' ? <><Clock className="w-4 h-4" /> OD</> :
                                                <><Clock className="w-4 h-4" /> Leave</>
                                    }
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
            )}

            {/* Submit */}
            {!existingLocked && students.length > 0 && (
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                >
                    {saved ? (
                        <><Check className="w-4 h-4" /> Attendance Saved!</>
                    ) : saving ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    ) : (
                        <><Save className="w-4 h-4" /> Save Attendance</>
                    )}
                </button>
            )}
        </div>
    );
};

export default AttendanceMarking;
