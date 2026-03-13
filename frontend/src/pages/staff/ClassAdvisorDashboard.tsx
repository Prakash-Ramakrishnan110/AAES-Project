import { useState, useEffect, useContext, cloneElement } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    Users, AlertTriangle, FileText, CheckCircle, TrendingUp, RefreshCw, 
    BookOpen, Zap, Shield
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import SectionCard from '../../components/ui/SectionCard';

const RISK_THRESHOLD = 50;

const StatCard = ({ label, value, icon, color, link, alert }: any) => {
    const navigate = useNavigate();
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        amber: 'text-amber-600 bg-amber-50',
        red: 'text-red-600 bg-red-50'
    };
 
    return (
        <motion.div 
            whileHover={{ y: -2 }}
            onClick={() => link && navigate(link)}
            className="stat-card-compact flex items-center gap-4 px-5 cursor-pointer"
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                {cloneElement(icon as any, { size: 18, strokeWidth: 2 })}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight truncate">{label}</p>
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-none mt-0.5">{value}</h3>
                    {alert && (
                        <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">{alert}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const ClassAdvisorDashboard = () => {
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext)!;
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();
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

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';


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
        if (!loading && stats) {
            setHeaderOptions({
                title: 'Academic Advising Administration',
                subtitle: (
                    <span>{stats.department} &bull; <span className="text-primary font-bold uppercase tracking-wide text-[10px]">{stats.academicYear} Session</span></span>
                ),
                actions: (
                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} /> 
                        Sync Data
                    </button>
                )
            });
        }
    }, [loading, stats, setHeaderOptions]);

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

    useEffect(() => {
        if (token) {
            fetchStats();
        }
    }, [token]);


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
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-[6px] border-[#E9EDF7] border-t-primary rounded-full animate-spin shadow-soft" />
                <p className="text-[#A3AED0] text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">Synchronizing Academic Roster</p>
            </div>
        </div>
    );

    if (!stats) return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh] text-gray-400">
            <Shield className="w-10 h-10 mb-4 opacity-20" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Advising Credentials Required</h2>
            <p className="text-[11px] max-w-xs mt-1 font-medium italic">
                No active academic advising assignment detected. 
                Consult Departmental Administration for authorization.
            </p>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    label="Students" 
                    value={stats.classSummary.totalStudents} 
                    icon={<Users />}
                    color="blue"
                    link="/staff/advisor/students"
                />
                <StatCard 
                    label="Attendance" 
                    value={`${stats.classSummary.avgAttendance.toFixed(1)}%`} 
                    icon={<TrendingUp />}
                    color="green"
                />
                <StatCard 
                    label="At Risk" 
                    value={stats.classSummary.totalRed} 
                    icon={<AlertTriangle />}
                    color="red"
                    alert={stats.classSummary.totalRed > 0 ? "Priority" : null}
                />
                <StatCard 
                    label="Warning" 
                    value={stats.classSummary.totalYellow} 
                    icon={<Shield />}
                    color="amber"
                />
            </div>

            {/* Risk Distribution Bar */}
            <div className="bg-gray-100 p-1 rounded-full flex overflow-hidden h-2.5">
                <div style={{ width: `${(stats.classSummary.totalRed / stats.classSummary.totalStudents) * 100}%` }} className="bg-red-500 h-full rounded-l-full" />
                <div style={{ width: `${(stats.classSummary.totalYellow / stats.classSummary.totalStudents) * 100}%` }} className="bg-amber-500 h-full" />
                <div style={{ width: `${((stats.classSummary.totalStudents - stats.classSummary.totalRed - stats.classSummary.totalYellow) / stats.classSummary.totalStudents) * 100}%` }} className="bg-green-500 h-full rounded-r-full" />
            </div>


            {/* Administrative Controls */}
            <SectionCard 
                title="Management" 
                subtitle="Reporting and archive access"
                icon={<Zap />}
            >
                <div className="flex flex-wrap gap-2 pt-2">
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting}
                        className="btn-secondary text-[10px] font-black uppercase px-4 py-2"
                    >
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> Report (PDF)
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={exporting}
                        className="btn-secondary text-[10px] font-black uppercase px-4 py-2"
                    >
                        <FileText className="w-3.5 h-3.5 text-green-600" /> Registry (XLS)
                    </button>
                    <button
                        onClick={() => navigate('/staff/advisor/documents')}
                        className="btn-primary text-[10px] font-black uppercase px-4 py-2"
                    >
                        <FileText className="w-3.5 h-3.5" /> Archive
                    </button>
                </div>
            </SectionCard>

            {/* Academic Summary Table */}
            <SectionCard 
                title="Academic Matrix" 
                subtitle="Course-wise performance aggregate"
                icon={<BookOpen />}
            >
                <div className="overflow-x-auto">
                    <table className="table-compact">
                        <thead>
                            <tr>
                                <th>Course Node</th>
                                <th className="text-center">Avg</th>
                                <th className="text-center">Peak</th>
                                <th className="text-center">Floor</th>
                                <th className="text-center w-32">Sync</th>
                            </tr>
                        </thead>
                        <tbody>
                            {insights.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400 font-bold uppercase text-[10px]">Syncing Data Nodes...</td>
                                </tr>
                            ) : insights.map((item: any) => (
                                <tr key={item._id}>
                                    <td>
                                        <div className="font-bold text-gray-900 leading-none">{item.subjectName}</div>
                                        <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{item.subjectCode}</div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`font-bold text-[14px] ${item.avgMarks >= 75 ? 'text-green-600' : item.avgMarks >= 60 ? 'text-blue-600' : 'text-red-600'}`}>
                                            {item.avgMarks}%
                                        </span>
                                    </td>
                                    <td className="text-center text-gray-900 font-bold">{item.highest}%</td>
                                    <td className="text-center text-gray-500 font-medium">{item.lowest}%</td>
                                    <td className="text-center">
                                        <div className="flex flex-col gap-1">
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-blue-600 h-full" style={{ width: `${item.submissionRate}%` }} />
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase">{item.submissionRate}% SYNC</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Students List */}
                <div className="lg:col-span-3">
                    <SectionCard 
                        title="Mentee Roster" 
                        subtitle="Cohort performance audit"
                        icon={<Users />}
                        actions={selectedIds.size > 0 && (
                            <button
                                onClick={() => navigate('/staff/mentor-assignment', { state: { studentIds: Array.from(selectedIds) } })}
                                className="btn-primary text-[10px] font-black uppercase px-3 py-1.5"
                            >
                                Route ({selectedIds.size})
                            </button>
                        )}
                    >
                        <div className="space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar pr-1 mt-2">
                            {stats.students.map((student: any) => {
                                const isSelected = selectedStudent?.studentId === student.studentId;
                                return (
                                    <div 
                                        key={student.studentId}
                                        onClick={() => handleStudentClick(student)}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox"
                                                checked={selectedIds.has(student.studentId)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    const next = new Set(selectedIds);
                                                    if (e.target.checked) next.add(student.studentId);
                                                    else next.delete(student.studentId);
                                                    setSelectedIds(next);
                                                }}
                                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                                            />
                                            <div className={`w-9 h-9 rounded-md flex items-center justify-center text-[13px] font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[12px] font-bold text-gray-900 truncate leading-tight">{student.name}</div>
                                                <div className="text-[10px] text-gray-400 font-medium truncate uppercase">{student.username}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="hidden md:flex flex-col items-center">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Att</span>
                                                <span className={`text-[12px] font-bold ${student.attendancePercentage < 75 ? 'text-red-500' : 'text-gray-900'}`}>{student.attendancePercentage.toFixed(0)}%</span>
                                            </div>
                                            <div className="hidden md:flex flex-col items-center">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Int</span>
                                                <span className={`text-[12px] font-bold ${student.internalPercentage < 50 ? 'text-red-500' : 'text-gray-900'}`}>{student.internalPercentage.toFixed(0)}%</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                student.riskLevel === 'Red' ? 'bg-red-50 text-red-600' : 
                                                student.riskLevel === 'Yellow' ? 'bg-amber-50 text-amber-600' : 
                                                'bg-green-50 text-green-600'
                                            }`}>
                                                {student.riskLevel}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>
                </div>
 
                {/* Selected Student Details & Notes */}
                <div className="lg:col-span-2 space-y-4">
                    {selectedStudent ? (
                        <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full sticky top-4">
                            <div className={`p-6 text-white ${selectedStudent.avgScore < RISK_THRESHOLD ? 'bg-red-600' : 'bg-blue-900'} rounded-t-lg`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center text-2xl font-bold border border-white/20">
                                        {(selectedStudent.fullName || selectedStudent.username).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold truncate leading-tight">{selectedStudent.fullName || selectedStudent.username}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded">Semester {selectedStudent.semester}</span>
                                            <span className="text-[9px] font-bold uppercase opacity-80">Profile Audit</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col min-h-0 bg-gray-50/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" /> Advising Log
                                    </h4>
                                    <span className="text-[9px] bg-white border border-gray-200 text-gray-400 px-2 py-0.5 rounded font-bold">{notes.length} Records</span>
                                </div>
 
                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-6 max-h-[350px] custom-scrollbar">
                                    {queries.length > 0 && (
                                        <div className="space-y-2">
                                            {queries.map((query) => (
                                                <div key={query._id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase">
                                                            {query.queryType}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${query.status === 'Resolved' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                                                            <span className={`text-[9px] font-bold uppercase ${query.status === 'Resolved' ? 'text-green-600' : 'text-red-500'}`}>
                                                                {query.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-gray-600 font-medium leading-relaxed italic">"{query.message}"</p>
 
                                                    {query.status === 'Open' ? (
                                                        <div className="flex gap-2 mt-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Type a response..."
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                className="flex-1 text-[11px] bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:bg-white focus:border-blue-400 trasition-all"
                                                            />
                                                            <button
                                                                onClick={() => handleReplyQuery(query._id)}
                                                                disabled={submittingReply === query._id || !replyText.trim()}
                                                                className="btn-primary text-[10px] uppercase font-bold px-3 py-1.5"
                                                            >
                                                                Reply
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-100 border-l-2 border-l-blue-600">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <Shield className="w-3 h-3 text-gray-400" />
                                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Advisor Response</span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-900 font-medium leading-relaxed">{query.reply}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
 
                                    <div className="space-y-2">
                                        {notes.length === 0 ? (
                                            <div className="text-center py-10 text-gray-300">
                                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                <p className="text-[10px] font-bold uppercase">No records found</p>
                                            </div>
                                        ) : (
                                            notes.map((note, i) => (
                                                <div key={i} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                                                            note.noteType === 'Counseling Done' ? 'bg-green-50 text-green-600 border-green-100' :
                                                            note.noteType === 'Parent Contacted' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-gray-50 text-gray-500 border-gray-200'
                                                        }`}>
                                                            {note.noteType}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(note.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-900 font-medium leading-relaxed">{note.content}</p>
                                                    <div className="mt-2 pt-2 border-t border-gray-50">
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">By: {note.advisor?.username || 'FACULTY ADVISOR'}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
 
                                <form onSubmit={handleAddNote} className="space-y-3 pt-6 border-t border-gray-200 mt-auto">
                                    <div className="flex flex-wrap gap-1">
                                        {['General', 'Counseling', 'Parent'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setNewNote({ ...newNote, noteType: type })}
                                                className={`text-[9px] px-3 py-1.5 rounded-md border font-bold uppercase transition-all ${newNote.noteType === type
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-400 border-gray-200 hover:border-blue-400 hover:text-blue-600'
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
                                            placeholder="Enter observation record..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-[12px] font-medium text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all resize-none h-32 placeholder:text-gray-300"
                                        />
                                        {noteSuccess && (
                                            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-[9px] font-black flex items-center gap-1.5 uppercase shadow-sm animate-in fade-in zoom-in">
                                                <CheckCircle className="w-3 h-3" /> Logged
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={addingNote || !newNote.content.trim()}
                                        className="w-full btn-primary py-3 text-[11px] font-black uppercase flex items-center justify-center gap-2"
                                    >
                                        {addingNote ? <RefreshCw className="w-3.5 h-3.5 animate-spin"/> : <FileText className="w-3.5 h-3.5" />}
                                        {addingNote ? 'Logging...' : 'Commit to Ledger'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-10 text-center h-[500px] flex flex-col items-center justify-center">
                            <Users className="w-10 h-10 text-gray-200 mb-4" />
                            <h4 className="text-gray-400 font-bold uppercase text-[10px]">Select a profile to audit</h4>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default ClassAdvisorDashboard;
