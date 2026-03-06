import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Users, AlertTriangle, FileText, CheckCircle, TrendingUp, RefreshCw, ChevronRight, BookOpen, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RISK_THRESHOLD = 50;

const ClassAdvisorDashboard = () => {
    const { token, user } = useContext(AuthContext)!;
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [notes, setNotes] = useState<any[]>([]);
    const [queries, setQueries] = useState<any[]>([]);
    const [newNote, setNewNote] = useState({ noteType: 'General', content: '' });
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState<string | null>(null);
    const [addingNote, setAddingNote] = useState(false);
    const [noteSuccess, setNoteSuccess] = useState(false);
    const [insights, setInsights] = useState<any[]>([]);
    const [exporting, setExporting] = useState(false);

    // Mentor Assignment Logic
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showMentorModal, setShowMentorModal] = useState(false);
    const [mentorId, setMentorId] = useState('');
    const [staffList, setStaffList] = useState<any[]>([]);
    const [assigningMentor, setAssigningMentor] = useState(false);

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchStaff = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/mentorship/staff`, config);
            setStaffList(data);
        } catch (err) { }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [statsRes, insightsRes] = await Promise.all([
                axios.get(`${API}/api/governance/advisor/dashboard`, config),
                axios.get(`${API}/api/advisor/academic-insights`, config)
            ]);

            setStats(statsRes.data);
            setInsights(insightsRes.data);
        } catch (err) {
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchStats();
            fetchStaff();
        }
    }, [token]);

    const submitMentorAssign = async () => {
        if (!mentorId) return alert('Select a mentor');
        setAssigningMentor(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Pass studentIds and mentorId for updating MentorHistory and User Models
            await axios.post(`${API}/api/mentorship/assign`, {
                studentIds: Array.from(selectedIds),
                mentorId
            }, config);
            alert('Mentors assigned successfully');
            setShowMentorModal(false);
            setSelectedIds(new Set());
            setMentorId('');
            fetchStats();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error occurred');
        } finally {
            setAssigningMentor(false);
        }
    };

    const handleStudentClick = async (student: any) => {
        setSelectedStudent(student);
        setNoteSuccess(false);
        setNewNote({ noteType: 'General', content: '' });
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [notesRes, queriesRes] = await Promise.all([
                axios.get(`${API}/api/advisor/student/${student._id}/notes`, config),
                axios.get(`${API}/api/mentorship?studentId=${student._id}`, config)
            ]);
            setNotes(notesRes.data);
            setQueries(queriesRes.data);
        } catch {
            setNotes([]);
            setQueries([]);
        }
    };

    const handleReplyQuery = async (queryId: string) => {
        if (!replyText.trim()) return;
        setSubmittingReply(queryId);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(`${API}/api/mentorship/${queryId}/reply`, { reply: replyText }, config);
            setQueries(queries.map(q => q._id === queryId ? res.data : q));
            setReplyText('');
            alert('Reply sent and query marked as resolved.');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error sending reply');
        } finally {
            setSubmittingReply(null);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !newNote.content.trim()) return;
        setAddingNote(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(
                `${API}/api/advisor/student/${selectedStudent._id}/notes`,
                newNote, config
            );
            setNotes([{ ...res.data, advisor: { username: user?.username } }, ...notes]);
            setNewNote({ noteType: 'General', content: '' });
            setNoteSuccess(true);
            setTimeout(() => setNoteSuccess(false), 3000);
        } catch {
            // silently fail
        } finally {
            setAddingNote(false);
        }
    };

    const noteTypeStyle = (type: string) => {
        if (type === 'Counseling Done') return 'bg-green-100 text-green-700 border-green-200';
        if (type === 'Parent Contacted') return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-gray-100 text-gray-600 border-gray-200';
    };

    const handleExport = async (type: 'pdf' | 'excel') => {
        setExporting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.get(`${API}/api/advisor/report-data`, config);
            alert(`${type.toUpperCase()} Report generated successfully! (Mock Download initiated)`);
        } catch {
            alert('Failed to generate report.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!stats) return (
        <div className="flex flex-col items-center justify-center p-16 text-center h-[70vh]">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-5">
                <Shield className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Assigned as Class Advisor</h2>
            <p className="text-gray-500 max-w-md text-sm">
                You haven't been assigned as a Class Advisor for any academic year yet.
                Contact your Head of Department if you believe this is an error.
            </p>
        </div>
    );

    return (
        <div className="space-y-6 pb-10 relative">
            {/* Mentor Assign Modal */}
            <AnimatePresence>
                {showMentorModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Assign Mentor ({selectedIds.size} Students)</h3>
                                <button onClick={() => setShowMentorModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <span className="text-xl">&times;</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-indigo-700 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                    Assigning a mentor transfers full mentorship mapping. Previous mentors will automatically be recorded backwards in the Mentor History logs.
                                </p>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Select Mentor (Staff)</label>
                                    <select value={mentorId} onChange={e => setMentorId(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300" >
                                        <option value="">-- Choose a Staff Member --</option>
                                        {staffList.map(staff => (
                                            <option key={staff._id} value={staff._id}>{staff.fullName || staff.username}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowMentorModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button onClick={submitMentorAssign} disabled={assigningMentor} className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center">
                                    {assigningMentor ? 'Assigning...' : 'Confirm Assignment'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            Class Advisor
                        </span>
                        <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                            {stats.academicYear}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">My Class Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {stats.department} · {stats.academicYear}
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl"><Users className="w-5 h-5 text-blue-600" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Students</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.classSummary.totalStudents}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl"><TrendingUp className="w-5 h-5 text-green-600" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Avg Attendance</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {stats.classSummary.avgAttendance.toFixed(1)}%
                        </h3>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Critical (Red)</p>
                        <h3 className={`text-2xl font-bold ${stats.classSummary.totalRed > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {stats.classSummary.totalRed}
                        </h3>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-xl"><Shield className="w-5 h-5 text-amber-600" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Warning (Yellow)</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.classSummary.totalYellow}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Risk Distribution Bar */}
            <div className="bg-white p-1 rounded-full border border-gray-100 flex overflow-hidden h-3 shadow-inner">
                <div style={{ width: `${(stats.classSummary.totalRed / stats.classSummary.totalStudents) * 100}%` }} className="bg-red-500 h-full" />
                <div style={{ width: `${(stats.classSummary.totalYellow / stats.classSummary.totalStudents) * 100}%` }} className="bg-amber-500 h-full" />
                <div style={{ width: `${((stats.classSummary.totalStudents - stats.classSummary.totalRed - stats.classSummary.totalYellow) / stats.classSummary.totalStudents) * 100}%` }} className="bg-emerald-500 h-full" />
            </div>


            {/* Quick Actions Panel */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-gray-900">⚡ Quick Actions</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-semibold border border-indigo-100"
                    >
                        <FileText className="w-4 h-4" /> Generate Class Report (PDF)
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-semibold border border-emerald-100"
                    >
                        <FileText className="w-4 h-4" /> Export Risk List (Excel)
                    </button>
                </div>
            </motion.div>

            {/* Academic Summary Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h2 className="font-bold text-gray-900 text-sm">📊 Academic Summary (Subject-wise)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th className="px-5 py-3">Subject</th>
                                <th className="px-5 py-3 text-center">Avg Marks</th>
                                <th className="px-5 py-3 text-center">Highest</th>
                                <th className="px-5 py-3 text-center">Lowest</th>
                                <th className="px-5 py-3 text-center">Submission Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {insights.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">No academic data available for this class.</td>
                                </tr>
                            ) : insights.map((item: any) => (
                                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-gray-900">{item.subjectName}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{item.subjectCode}</p>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`font-bold ${item.avgMarks >= 75 ? 'text-green-600' : item.avgMarks >= 60 ? 'text-blue-600' : 'text-red-600'}`}>
                                            {item.avgMarks}%
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center font-medium text-gray-700">{item.highest}%</td>
                                    <td className="px-5 py-4 text-center font-medium text-gray-700">{item.lowest}%</td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${item.submissionRate}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500">{item.submissionRate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Students List */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900 text-sm">Student Performance Monitoring</h2>
                        {selectedIds.size > 0 && (
                            <button
                                onClick={() => setShowMentorModal(true)}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
                            >
                                Assign Mentor ({selectedIds.size})
                            </button>
                        )}
                    </div>
                    <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
                        <span>Attendance, Internals, Assignments Tracking</span>
                    </div>
                    <div className="divide-y divide-gray-50 overflow-y-auto max-h-[600px]">
                        {stats.students.map((student: any) => {
                            const isSelected = selectedStudent?.studentId === student.studentId;
                            return (
                                <button
                                    key={student.studentId}
                                    onClick={() => handleStudentClick(student)}
                                    className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-all ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                        {student.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 truncate">{student.name}</p>
                                        <p className="text-xs text-gray-400">Reg No: {student.registerNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-6 text-xs font-medium">
                                        <div className="text-center">
                                            <p className="text-gray-400 uppercase text-[8px] mb-0.5">Att</p>
                                            <p className={`${student.attendancePercentage < 75 ? 'text-red-500' : 'text-gray-700'}`}>{student.attendancePercentage.toFixed(0)}%</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-400 uppercase text-[8px] mb-0.5">Int</p>
                                            <p className={`${student.internalPercentage < 50 ? 'text-red-500' : 'text-gray-700'}`}>{student.internalPercentage.toFixed(0)}%</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-400 uppercase text-[8px] mb-0.5">Asg</p>
                                            <p className={`${student.assignmentPercentage < 60 ? 'text-red-500' : 'text-gray-700'}`}>{student.assignmentPercentage.toFixed(0)}%</p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${student.riskLevel === 'Red' ? 'bg-red-100 text-red-700 border-red-200' :
                                            student.riskLevel === 'Yellow' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                'bg-emerald-100 text-emerald-700 border-emerald-200'
                                            }`}>{student.riskLevel}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-gray-300'}`} />

                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Student Details & Notes */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedStudent ? (
                            <motion.div
                                key={selectedStudent._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full sticky top-6"
                            >
                                {/* Profile Head */}
                                <div className={`p-6 text-white ${selectedStudent.avgScore < RISK_THRESHOLD ? 'bg-gradient-to-br from-red-600 to-rose-700' : 'bg-gradient-to-br from-indigo-600 to-indigo-800'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                                            {(selectedStudent.fullName || selectedStudent.username).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{selectedStudent.fullName || selectedStudent.username}</h3>
                                            <p className="text-white/70 text-xs">Sem {selectedStudent.semester} · {selectedStudent.department}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-indigo-500" /> Mentorship Logs
                                        </h4>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{notes.length} log(s)</span>
                                    </div>

                                    {/* Scrollable History */}
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-6 max-h-[400px] custom-scrollbar">

                                        {/* Queries Section */}
                                        {queries.length > 0 && (
                                            <div className="mb-6 space-y-4">
                                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Student Queries</h5>
                                                {queries.map((query) => (
                                                    <div key={query._id} className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 uppercase">
                                                                {query.queryType} Query
                                                            </span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${query.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {query.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-800 font-medium mb-3">"{query.message}"</p>

                                                        {query.status === 'Open' ? (
                                                            <div className="flex gap-2 mt-3">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Type your reply to resolve..."
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    className="flex-1 text-xs border border-orange-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-orange-400"
                                                                />
                                                                <button
                                                                    onClick={() => handleReplyQuery(query._id)}
                                                                    disabled={submittingReply === query._id || !replyText.trim()}
                                                                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    {submittingReply === query._id ? 'Sending...' : 'Reply & Resolve'}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-3 p-3 bg-white/60 border border-green-100 rounded-lg">
                                                                <p className="text-[10px] text-gray-400 font-bold mb-1">Your Reply:</p>
                                                                <p className="text-xs text-gray-700 font-medium">{query.reply}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Notes Section */}
                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Advisor Logs</h5>
                                        {notes.length === 0 ? (
                                            <div className="text-center py-10 grayscale opacity-40">
                                                <FileText className="w-12 h-12 mx-auto mb-2" />
                                                <p className="text-xs">No mentorship notes yet</p>
                                            </div>
                                        ) : (
                                            notes.map((note, i) => (
                                                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${noteTypeStyle(note.noteType)}`}>
                                                            {note.noteType}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{note.content}</p>
                                                    <p className="text-[10px] text-indigo-400 mt-2 font-bold">— {note.advisor?.username || 'Class Advisor'}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleAddNote} className="space-y-4 pt-6 border-t border-gray-100 mt-auto">
                                        <div className="flex gap-2">
                                            {['General', 'Counseling Done', 'Parent Contacted'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setNewNote({ ...newNote, noteType: type })}
                                                    className={`text-[10px] px-3 py-1 rounded-full border transition-all font-bold ${newNote.noteType === type
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                required
                                                value={newNote.content}
                                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                                placeholder="Enter observation or counseling details..."
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-28"
                                            />
                                            {noteSuccess && (
                                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Saved
                                                </motion.div>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={addingNote || !newNote.content.trim()}
                                            className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                                        >
                                            {addingNote ? 'Saving Record...' : 'Save Mentorship Log'}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-indigo-50/50 rounded-3xl border border-dashed border-indigo-200 p-12 text-center h-[600px] flex flex-col items-center justify-center">
                                <Users className="w-12 h-12 text-indigo-300 mb-4" />
                                <h4 className="text-indigo-900 font-bold mb-1">Select Student Profile</h4>
                                <p className="text-indigo-600/60 text-xs max-w-[200px] mx-auto">Click on a student in the list to view their full academic performance and mentorship history.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ClassAdvisorDashboard;
