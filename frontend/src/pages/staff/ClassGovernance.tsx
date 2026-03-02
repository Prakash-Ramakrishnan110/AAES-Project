import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, AlertOctagon, Activity, Search, BookOpen, MessageSquare, Calendar, Plus, X, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';

const API = 'http://localhost:5000';

interface ClassSummary {
    totalStudents: number;
    avgAttendance: number;
    avgInternal: number;
    totalRed: number;
    totalYellow: number;
}

interface Student {
    studentId: string;
    name: string;
    registerNumber: string;
    mentorName: string;
    attendancePercentage: number;
    internalPercentage: number;
    riskLevel: 'Green' | 'Yellow' | 'Red';
    escalationStatus: string;
}

interface MentorStat {
    name: string;
    totalMentees: number;
    redCases: number;
    interactionCount: number;
}

interface CCMRecord {
    _id: string;
    meetingDate: string;
    category: string;
    agenda: string;
    notes?: string;
    decisions?: string;
    actionItems?: { description: string; responsiblePerson: string; deadline: string; status: string }[];
}

const CATEGORIES = ['Academic', 'Infrastructure', 'Faculty', 'Exam'];

const ClassGovernance = () => {
    const { token } = useContext(AuthContext)!;
    const toast = useToast();
    const [summary, setSummary] = useState<ClassSummary | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [mentorStats, setMentorStats] = useState<MentorStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'mentors' | 'ccm'>('students');
    const [searchTerm, setSearchTerm] = useState('');
    const [ccmRecords, setCcmRecords] = useState<CCMRecord[]>([]);
    const [selectedCCM, setSelectedCCM] = useState<CCMRecord | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSavingCCM, setIsSavingCCM] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const [ccmForm, setCcmForm] = useState({
        meetingDate: new Date().toISOString().split('T')[0],
        category: 'Academic',
        agenda: '',
        notes: '',
        decisions: '',
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    });

    useEffect(() => {
        fetchDashboardData();
        fetchCCMRecords();
    }, [token]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/governance/advisor/dashboard`, config);
            setSummary(data.classSummary);
            setStudents(data.students);
            setMentorStats(data.mentorMonitor);
        } catch {
            toast.error('Failed to load governance data. Please refresh.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCCMRecords = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/ccm`, config);
            setCcmRecords(data);
        } catch {
            console.error('Error fetching CCM records');
        }
    };

    const handleCreateCCM = async () => {
        if (!ccmForm.agenda.trim()) {
            toast.warning('Agenda is required to create a CCM record.');
            return;
        }
        setIsSavingCCM(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API}/api/ccm`, ccmForm, config);
            toast.success('CCM record created successfully!');
            setShowCreateForm(false);
            setCcmForm({ ...ccmForm, agenda: '', notes: '', decisions: '' });
            fetchCCMRecords();
        } catch {
            toast.error('Failed to create CCM record. Please try again.');
        } finally {
            setIsSavingCCM(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Green': return 'bg-green-100 text-green-700 border-green-200';
            case 'Yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Red': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // CCM Analytics
    const openCCMs = ccmRecords.filter(c => !c.actionItems?.every(a => a.status === 'Completed')).length;
    const closedCCMs = ccmRecords.length - openCCMs;

    if (isLoading || !summary) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading governance data...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-b-2 border-purple-600 inline-block pb-1">Class Governance</h1>
                    <p className="text-gray-500 text-sm mt-2">Monitor class health, mentor activity, and committee meetings.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium mb-1">Total Students</p>
                    <h3 className="text-2xl font-bold text-gray-900">{summary.totalStudents}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium mb-1">Avg Attendance</p>
                    <h3 className="text-2xl font-bold text-gray-900">{summary.avgAttendance.toFixed(1)}%</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium mb-1">Avg Internal</p>
                    <h3 className="text-2xl font-bold text-gray-900">{summary.avgInternal.toFixed(1)}%</h3>
                </div>
                <div className="bg-red-50 p-5 rounded-2xl border border-red-200 shadow-sm">
                    <p className="text-sm text-red-600 font-medium mb-1 flex items-center"><AlertOctagon className="w-4 h-4 mr-1" /> Critical</p>
                    <h3 className="text-2xl font-bold text-red-700">{summary.totalRed}</h3>
                </div>
                <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200 shadow-sm">
                    <p className="text-sm text-yellow-600 font-medium mb-1 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> Warning</p>
                    <h3 className="text-2xl font-bold text-yellow-700">{summary.totalYellow}</h3>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {([['students', Users, 'Student Risk Overview'], ['mentors', Activity, 'Mentor Activity'], ['ccm', BookOpen, 'CCM Records']] as const).map(([tab, Icon, label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                            <Icon className="w-4 h-4" />{label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* STUDENTS TAB */}
                    {activeTab === 'students' && (
                        <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-semibold text-gray-800">Class Students</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Search students..."
                                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-64" />
                                </div>
                            </div>
                            {filteredStudents.length === 0 ? (
                                <EmptyState icon={Users} title="No Students Found" message="Try adjusting your search or check if students are enrolled in this class." />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white border-b border-gray-100 text-sm">
                                                <th className="p-4 font-semibold text-gray-600">Student Name</th>
                                                <th className="p-4 font-semibold text-gray-600">Mentor</th>
                                                <th className="p-4 font-semibold text-gray-600">Attendance</th>
                                                <th className="p-4 font-semibold text-gray-600">Internal Score</th>
                                                <th className="p-4 font-semibold text-gray-600">Risk Level</th>
                                                <th className="p-4 font-semibold text-gray-600">Escalated</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredStudents.map(student => (
                                                <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4">
                                                        <p className="font-medium text-gray-900">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.registerNumber}</p>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600 font-medium">{student.mentorName}</td>
                                                    <td className="p-4 text-sm font-medium">{student.attendancePercentage.toFixed(1)}%</td>
                                                    <td className="p-4 text-sm font-medium">{student.internalPercentage.toFixed(1)}%</td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskColor(student.riskLevel)}`}>{student.riskLevel}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        {student.escalationStatus !== 'None' ? (
                                                            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded border border-red-200">{student.escalationStatus}</span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* MENTORS TAB */}
                    {activeTab === 'mentors' && (
                        <motion.div key="mentors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-800">Assigned Mentors Overview</h3>
                                <p className="text-xs text-gray-500 mt-1">Track mentor engagement and red case distribution.</p>
                            </div>
                            {mentorStats.length === 0 ? (
                                <EmptyState icon={Activity} title="No Mentor Data" message="No mentors are assigned to this class yet." />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    {mentorStats.map((mentor, i) => (
                                        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-purple-300 transition-colors shadow-sm">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                                                    {mentor.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{mentor.name}</p>
                                                    <p className="text-xs text-gray-500">{mentor.totalMentees} Assigned Mentees</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 flex items-center"><MessageSquare className="w-4 h-4 mr-1.5 text-gray-400" /> Interactions Logged</span>
                                                    <span className="font-bold text-gray-900">{mentor.interactionCount}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 flex items-center"><AlertOctagon className="w-4 h-4 mr-1.5 text-red-400" /> Critical (Red) Cases</span>
                                                    <span className="font-bold text-red-600">{mentor.redCases}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* CCM TAB */}
                    {activeTab === 'ccm' && (
                        <motion.div key="ccm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* CCM Analytics Bar */}
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Total Meetings</p>
                                        <p className="text-xl font-black text-gray-900">{ccmRecords.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-amber-600 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Open</p>
                                        <p className="text-xl font-black text-amber-600">{openCCMs}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Resolved</p>
                                        <p className="text-xl font-black text-emerald-600">{closedCCMs}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowCreateForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-sm">
                                    <Plus className="w-4 h-4" /> New CCM Record
                                </button>
                            </div>

                            {/* Create CCM Form Panel */}
                            <AnimatePresence>
                                {showCreateForm && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-b border-purple-100 bg-purple-50/40 overflow-hidden"
                                    >
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-purple-800 text-sm">New Class Committee Meeting Record</h4>
                                                <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date</label>
                                                    <input type="date" value={ccmForm.meetingDate}
                                                        onChange={e => setCcmForm({ ...ccmForm, meetingDate: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                                                    <select value={ccmForm.category}
                                                        onChange={e => setCcmForm({ ...ccmForm, category: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Academic Year</label>
                                                    <input type="text" value={ccmForm.academicYear}
                                                        onChange={e => setCcmForm({ ...ccmForm, academicYear: e.target.value })}
                                                        placeholder="e.g. 2025-2026"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Agenda / Issues Raised <span className="text-red-500">*</span></label>
                                                <textarea value={ccmForm.agenda}
                                                    onChange={e => setCcmForm({ ...ccmForm, agenda: e.target.value })}
                                                    placeholder="Describe the main agenda and issues raised in this meeting..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Notes</label>
                                                    <textarea value={ccmForm.notes}
                                                        onChange={e => setCcmForm({ ...ccmForm, notes: e.target.value })}
                                                        placeholder="Academic summary, discussions..."
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Decisions Taken</label>
                                                    <textarea value={ccmForm.decisions}
                                                        onChange={e => setCcmForm({ ...ccmForm, decisions: e.target.value })}
                                                        placeholder="Resolutions, action items decided..."
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => setShowCreateForm(false)}
                                                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">
                                                    Cancel
                                                </button>
                                                <button onClick={handleCreateCCM} disabled={isSavingCCM}
                                                    className="px-5 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                                                    {isSavingCCM && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                                    Save CCM Record
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* CCM Records List */}
                            <div className="p-4">
                                {ccmRecords.length === 0 ? (
                                    <EmptyState icon={BookOpen} title="No CCM Records Yet"
                                        message="Log your first Class Committee Meeting to track academic discussions and decisions."
                                        actionLabel="Create First Record" onAction={() => setShowCreateForm(true)} />
                                ) : (
                                    <div className="space-y-3">
                                        {ccmRecords.map(ccm => (
                                            <div key={ccm._id}
                                                className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm hover:border-purple-200 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">{ccm.category}</span>
                                                            <span className="text-sm text-gray-500 font-medium flex items-center">
                                                                <Calendar className="w-4 h-4 mr-1" />{new Date(ccm.meetingDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 mb-1">{ccm.agenda}</h4>
                                                        {ccm.decisions && <p className="text-sm text-gray-500 leading-relaxed">📋 {ccm.decisions}</p>}
                                                    </div>
                                                    <button onClick={() => setSelectedCCM(selectedCCM?._id === ccm._id ? null : ccm)}
                                                        className="px-4 py-2 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded-xl text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors whitespace-nowrap">
                                                        {selectedCCM?._id === ccm._id ? 'Close' : 'View Details'}
                                                    </button>
                                                </div>

                                                {/* Expand Detail */}
                                                <AnimatePresence>
                                                    {selectedCCM?._id === ccm._id && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                            className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                                            {ccm.notes && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-gray-500 mb-1">Meeting Notes</p>
                                                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">{ccm.notes}</p>
                                                                </div>
                                                            )}
                                                            {ccm.actionItems && ccm.actionItems.length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-gray-500 mb-2">Action Items</p>
                                                                    <div className="space-y-2">
                                                                        {ccm.actionItems.map((item, i) => (
                                                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                                                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'Completed' ? 'bg-green-500' : 'bg-amber-400'}`} />
                                                                                <div className="flex-1">
                                                                                    <p className="font-medium text-gray-800">{item.description}</p>
                                                                                    <p className="text-xs text-gray-500">Responsible: {item.responsiblePerson} · Due: {new Date(item.deadline).toLocaleDateString()}</p>
                                                                                </div>
                                                                                <span className={`text-xs font-bold ${item.status === 'Completed' ? 'text-green-600' : 'text-amber-600'}`}>{item.status}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ConfirmModal
                isOpen={!!confirmDelete}
                title="Delete CCM Record?"
                message="This will permanently delete the CCM record and all its action items. This cannot be undone."
                confirmLabel="Yes, Delete"
                isDanger
                onConfirm={() => setConfirmDelete(null)}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default ClassGovernance;
