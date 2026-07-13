import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, ChevronDown, ChevronUp, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HODInternalMarksView = () => {
    const { token, user } = useContext(AuthContext)!;
    const [subjects, setSubjects] = useState<any[]>([]);
    const [assignmentsMap, setAssignmentsMap] = useState<{ [subjectId: string]: any[] }>({});
    const [submissionsMap, setSubmissionsMap] = useState<{ [assignmentId: string]: any[] }>({});
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
    const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchSubjects();
    }, [token]);

    const fetchSubjects = async () => {
        try {
            const { data: subs } = await axios.get(
                `${API}/api/subjects?department=${encodeURIComponent(user?.department || '')}`, config
            );
            setSubjects(subs);
            
            // Fetch assignments for all subjects
            const aMap: { [k: string]: any[] } = {};
            await Promise.all(subs.map(async (s: any) => {
                try {
                    const res = await axios.get(`${API}/api/assignments?subjectId=${s._id}`, config);
                    aMap[s._id] = res.data;
                } catch {
                    aMap[s._id] = [];
                }
            }));
            setAssignmentsMap(aMap);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSubject = (subjectId: string) => {
        setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
    };

    const toggleAssignment = async (assignmentId: string) => {
        if (expandedAssignment === assignmentId) {
            setExpandedAssignment(null);
            return;
        }
        setExpandedAssignment(assignmentId);
        
        // Fetch submissions for this assignment if not already fetched
        if (!submissionsMap[assignmentId]) {
            try {
                const res = await axios.get(`${API}/api/assignments/${assignmentId}/gradebook`, config);
                setSubmissionsMap(prev => ({ ...prev, [assignmentId]: res.data.gradebook }));
            } catch (err) {
                console.error(err);
                setSubmissionsMap(prev => ({ ...prev, [assignmentId]: [] }));
            }
        }
    };

    const exportToExcel = (assignment: any, subjectName: string) => {
        const submissions = submissionsMap[assignment._id];
        if (!submissions || submissions.length === 0) return;

        const data = submissions.map((sub: any) => ({
            'Student Name': sub.fullName || 'Unknown',
            'Register Number': sub.registerNumber || '—',
            'Status': sub.status === 'graded' ? 'Graded' : (sub.status === 'pending' ? 'Not Submitted' : sub.status),
            'Marks Obtained': sub.status === 'graded' ? sub.marks : 0,
            'Maximum Marks': assignment.maxMarks
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Marks');

        XLSX.writeFile(wb, `${subjectName}_${assignment.title}_Marks.xlsx`);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Assignment Marks Overview</h1>
                <p className="text-sm text-slate-500 mt-1">Directly view assignment marks for all {user?.department} subjects</p>
            </div>

            <div className="space-y-4">
                {subjects.map((sub) => {
                    const assignments = assignmentsMap[sub._id] || [];
                    const isExpanded = expandedSubject === sub._id;

                    return (
                        <div key={sub._id} className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                            {/* Subject Header */}
                            <div 
                                onClick={() => toggleSubject(sub._id)}
                                className="flex items-center justify-between p-5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-slate-700" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{sub.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{sub.code} · Sem {sub.semester}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
                                        {assignments.length} Assignments
                                    </span>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </div>
                            </div>

                            {/* Assignments List */}
                            {isExpanded && (
                                <div className="bg-slate-50 p-5 space-y-3">
                                    {assignments.length === 0 ? (
                                        <div className="text-center text-sm text-slate-500 py-4">No assignments found for this subject.</div>
                                    ) : (
                                        assignments.map((assignment) => {
                                            const isAssignExpanded = expandedAssignment === assignment._id;
                                            const submissions = submissionsMap[assignment._id];

                                            const totalStudents = submissions ? submissions.length : 0;
                                            const pendingStudents = submissions ? submissions.filter(s => s.status === 'pending').length : 0;
                                            const submittedStudents = totalStudents - pendingStudents;

                                            return (
                                                <div key={assignment._id} className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
                                                    <div 
                                                        onClick={() => toggleAssignment(assignment._id)}
                                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="w-4 h-4 text-indigo-500" />
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{assignment.title}</p>
                                                                <p className="text-xs text-slate-500">Max Marks: {assignment.maxMarks}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {submissions && (
                                                                <div className="flex gap-2 items-center">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            exportToExcel(assignment, sub.name);
                                                                        }}
                                                                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200 uppercase tracking-wider transition-colors mr-2"
                                                                        title="Download Marks as Excel"
                                                                    >
                                                                        <Download className="w-3 h-3" /> Export
                                                                    </button>
                                                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                                                        {submittedStudents} Submitted
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                                                                        {pendingStudents} Pending
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {isAssignExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                        </div>
                                                    </div>

                                                    {/* Submissions Table */}
                                                    {isAssignExpanded && (
                                                        <div className="border-t border-slate-100">
                                                            {!submissions ? (
                                                                <div className="p-4 text-center text-xs text-slate-500">Loading marks...</div>
                                                            ) : submissions.length === 0 ? (
                                                                <div className="p-4 text-center text-xs text-slate-500">No students found in this class.</div>
                                                            ) : (
                                                                <div className="p-4 space-y-6">
                                                                    {/* Submitted Students Section */}
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                            <CheckCircle className="w-4 h-4 text-emerald-600" /> 
                                                                            Students Who Submitted ({submittedStudents})
                                                                        </h4>
                                                                        <div className="border border-slate-200 rounded-md overflow-hidden">
                                                                            <table className="w-full text-sm">
                                                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                                                    <tr>
                                                                                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">Student Name</th>
                                                                                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">Reg No</th>
                                                                                        <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-500 uppercase">Marks</th>
                                                                                        <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-500 uppercase">Status</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-slate-100">
                                                                                    {submissions.filter((s: any) => s.status !== 'pending').length === 0 ? (
                                                                                        <tr><td colSpan={4} className="px-4 py-3 text-center text-xs text-slate-500">No students have submitted yet.</td></tr>
                                                                                    ) : (
                                                                                        submissions.filter((s: any) => s.status !== 'pending').map((sub: any) => (
                                                                                            <tr key={sub.studentId} className="hover:bg-slate-50">
                                                                                                <td className="px-4 py-2 text-slate-900 font-medium">{sub.fullName || 'Unknown'}</td>
                                                                                                <td className="px-4 py-2 text-slate-500 text-xs">{sub.registerNumber || '—'}</td>
                                                                                                <td className="px-4 py-2 text-center font-bold text-slate-900">
                                                                                                    {sub.status === 'graded' ? `${sub.marks} / ${assignment.maxMarks}` : '-'}
                                                                                                </td>
                                                                                                <td className="px-4 py-2 text-center">
                                                                                                    {sub.status === 'graded' ? (
                                                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                                                                            <CheckCircle className="w-3 h-3" /> Graded
                                                                                                        </span>
                                                                                                    ) : (
                                                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                                                                                            <AlertCircle className="w-3 h-3" /> {sub.status}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))
                                                                                    )}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>

                                                                    {/* Not Submitted Students Section */}
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                            <AlertCircle className="w-4 h-4 text-rose-600" /> 
                                                                            Students Who Have Not Submitted ({pendingStudents})
                                                                        </h4>
                                                                        <div className="border border-slate-200 rounded-md overflow-hidden">
                                                                            <table className="w-full text-sm">
                                                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                                                    <tr>
                                                                                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">Student Name</th>
                                                                                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">Reg No</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-slate-100">
                                                                                    {submissions.filter((s: any) => s.status === 'pending').length === 0 ? (
                                                                                        <tr><td colSpan={2} className="px-4 py-3 text-center text-xs text-slate-500">All students have submitted.</td></tr>
                                                                                    ) : (
                                                                                        submissions.filter((s: any) => s.status === 'pending').map((sub: any) => (
                                                                                            <tr key={sub.studentId} className="hover:bg-slate-50 bg-rose-50/20">
                                                                                                <td className="px-4 py-2 text-slate-900 font-medium">{sub.fullName || 'Unknown'}</td>
                                                                                                <td className="px-4 py-2 text-slate-500 text-xs">{sub.registerNumber || '—'}</td>
                                                                                            </tr>
                                                                                        ))
                                                                                    )}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {subjects.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-md border border-slate-200">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-900">No Subjects Found</h3>
                        <p className="text-xs text-slate-500 mt-1">No subjects are assigned to your department yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HODInternalMarksView;
