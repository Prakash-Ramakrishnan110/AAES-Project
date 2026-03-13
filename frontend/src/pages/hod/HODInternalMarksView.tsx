import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Users, ChevronRight, CheckCircle, Lock, FileBarChart, AlertCircle, Award } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HODInternalMarksView = () => {
    const { token, user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [patternMap, setPatternMap] = useState<{ [subjectId: string]: any }>({});
    const [marksMap, setMarksMap] = useState<{ [subjectId: string]: any[] }>({});
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchAll();
    }, [token]);

    const fetchAll = async () => {
        try {
            // 1. Get all subjects in dept
            const { data: subs } = await axios.get(
                `${API}/api/subjects?department=${user?.department}`, config
            );
            setSubjects(subs);

            // 2. For each subject, get pattern + marks
            const pMap: { [k: string]: any } = {};
            const mMap: { [k: string]: any[] } = {};

            await Promise.all(subs.map(async (s: any) => {
                try {
                    const pRes = await axios.get(`${API}/api/internal/pattern/subject/${s._id}`, config);
                    pMap[s._id] = pRes.data;

                    const mRes = await axios.get(
                        `${API}/api/internal/subject-marks?subjectId=${s._id}&academicYear=${pRes.data.academicYear}&semester=${pRes.data.semester}`,
                        config
                    );
                    mMap[s._id] = mRes.data.marks || [];
                } catch {
                    pMap[s._id] = null;
                    mMap[s._id] = [];
                }
            }));

            setPatternMap(pMap);
            setMarksMap(mMap);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const configuredSubjects = subjects.filter(s => patternMap[s._id]);
    const unconfiguredSubjects = subjects.filter(s => !patternMap[s._id]);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Internal Marks Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">View staff-entered marks for all {user?.department} subjects</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-emerald-50 rounded-md border border-emerald-200 text-sm font-bold text-emerald-700 shadow-sm">
                        {configuredSubjects.length} Configured
                    </div>
                    <div className="px-4 py-2 bg-slate-50 rounded-md border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">
                        {unconfiguredSubjects.length} Pending
                    </div>
                    <button
                        onClick={() => navigate('/hod/consolidated-reports')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-md text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <FileBarChart className="w-4 h-4" /> Class-wise Reports
                    </button>
                </div>
            </div>

            {/* Configured Subjects */}
            {configuredSubjects.length > 0 && (
                <div className="space-y-4">
                    {configuredSubjects.map((sub) => {
                        const pattern = patternMap[sub._id];
                        const marks = marksMap[sub._id] || [];
                        const enteredCount = marks.length;

                        return (
                            <div
                                key={sub._id}
                                className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden"
                            >
                                {/* Subject Header */}
                                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-slate-700" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{sub.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{sub.code} · Sem {sub.semester}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {pattern.patternLocked && (
                                            <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200 uppercase tracking-wider">
                                                <Lock className="w-3 h-3" /> Locked
                                            </span>
                                        )}
                                        {pattern.published && (
                                            <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200 uppercase tracking-wider">
                                                <CheckCircle className="w-3 h-3" /> Published
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-bold border border-slate-200 uppercase tracking-wider">
                                            <Users className="w-3 h-3" /> {enteredCount} students
                                        </span>
                                        <button
                                            onClick={() => navigate(`/hod/internal-pattern/${sub._id}`)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                                        >
                                            Configure <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Components Row */}
                                <div className="px-5 py-3 bg-slate-50/50 flex flex-wrap gap-2 border-b border-slate-100">
                                    {pattern.components.map((c: any) => (
                                        <span key={c.name} className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 shadow-sm">
                                            {c.name} <span className="text-slate-400 font-medium">/ {c.maxMarks}</span>
                                        </span>
                                    ))}
                                    <span className="px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-bold shadow-sm">
                                        Total: {pattern.totalInternalMax}
                                    </span>
                                </div>

                                {/* Marks Table */}
                                {marks.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500 text-sm font-medium">
                                        No marks entered yet by staff.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">Student</th>
                                                    {pattern.components.map((c: any) => (
                                                        <th key={c.name} className="px-5 py-3 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                                            {c.name} <span className="opacity-50">/{c.maxMarks}</span>
                                                        </th>
                                                    ))}
                                                    <th className="px-5 py-3 text-center text-[10px] font-bold text-slate-900 uppercase tracking-wider">Total</th>
                                                    <th className="px-5 py-3 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {marks.map((mark: any) => {
                                                    const pct = pattern.totalInternalMax > 0
                                                        ? Math.round((mark.totalObtained / pattern.totalInternalMax) * 100) : 0;
                                                    const grade = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';
                                                    const gradeColor = pct >= 60 ? 'text-emerald-600' : 'text-red-600';

                                                    return (
                                                        <tr key={mark._id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-5 py-3">
                                                                <p className="font-bold text-slate-900 text-sm">
                                                                    {mark.student?.fullName || mark.student?.username || '—'}
                                                                </p>
                                                                <p className="text-[10px] text-slate-500 uppercase font-medium">
                                                                    {mark.student?.registerNumber || ''}
                                                                </p>
                                                            </td>
                                                            {pattern.components.map((c: any) => {
                                                                const cm = mark.componentMarks?.find((m: any) => m.componentName === c.name);
                                                                return (
                                                                    <td key={c.name} className="px-5 py-3 text-center font-bold text-slate-700">
                                                                        {cm ? cm.marksObtained : '—'}
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className="px-5 py-3 text-center">
                                                                <span className="inline-flex items-center justify-center w-10 h-8 bg-slate-100 border border-slate-200 text-slate-900 rounded-md font-bold text-sm">
                                                                    {mark.totalObtained}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 text-center">
                                                                <span className={`font-bold text-sm ${gradeColor}`}>{grade}</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Unconfigured */}
            {unconfiguredSubjects.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">No Pattern Configured</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {unconfiguredSubjects.map(sub => (
                            <div key={sub._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-md border border-dashed border-slate-300">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{sub.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">{sub.code}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/hod/internal-pattern/${sub._id}`)}
                                    className="text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors uppercase tracking-wider border border-slate-200 bg-white px-3 py-1.5 rounded"
                                >
                                    Set up
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {subjects.length === 0 && (
                <div className="text-center py-24 text-slate-500 font-medium">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                    <p>No subjects found for {user?.department}</p>
                </div>
            )}
        </div>
    );
};

export default HODInternalMarksView;
