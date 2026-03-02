import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, Users, ChevronRight, Award, AlertCircle, CheckCircle, Lock } from 'lucide-react';

const API = 'http://localhost:5000';

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
                    <h1 className="text-2xl font-bold text-gray-900">Internal Marks Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">View staff-entered marks for all {user?.department} subjects</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-sm font-bold text-emerald-700">
                        {configuredSubjects.length} Configured
                    </div>
                    <div className="px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500">
                        {unconfiguredSubjects.length} Pending
                    </div>
                </div>
            </div>

            {/* Configured Subjects */}
            {configuredSubjects.length > 0 && (
                <div className="space-y-4">
                    {configuredSubjects.map((sub, idx) => {
                        const pattern = patternMap[sub._id];
                        const marks = marksMap[sub._id] || [];
                        const enteredCount = marks.length;

                        return (
                            <motion.div
                                key={sub._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                {/* Subject Header */}
                                <div className="flex items-center justify-between p-5 border-b border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{sub.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{sub.code} · Sem {sub.semester}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {pattern.patternLocked && (
                                            <span className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-200">
                                                <Lock className="w-3 h-3" /> Locked
                                            </span>
                                        )}
                                        {pattern.published && (
                                            <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200">
                                                <CheckCircle className="w-3 h-3" /> Published
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold border border-gray-200">
                                            <Users className="w-3 h-3" /> {enteredCount} students
                                        </span>
                                        <button
                                            onClick={() => navigate(`/hod/internal-pattern/${sub._id}`)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                                        >
                                            Configure <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Components Row */}
                                <div className="px-5 py-3 bg-gray-50/50 flex flex-wrap gap-2 border-b border-gray-50">
                                    {pattern.components.map((c: any) => (
                                        <span key={c.name} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700">
                                            {c.name} <span className="text-gray-400 font-medium">/ {c.maxMarks}</span>
                                        </span>
                                    ))}
                                    <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold">
                                        Total: {pattern.totalInternalMax}
                                    </span>
                                </div>

                                {/* Marks Table */}
                                {marks.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400 text-sm">
                                        No marks entered yet by staff.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50/50">
                                                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                                    {pattern.components.map((c: any) => (
                                                        <th key={c.name} className="px-5 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                            {c.name} <span className="opacity-50">/{c.maxMarks}</span>
                                                        </th>
                                                    ))}
                                                    <th className="px-5 py-3 text-center text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Total</th>
                                                    <th className="px-5 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {marks.map((mark: any) => {
                                                    const pct = pattern.totalInternalMax > 0
                                                        ? Math.round((mark.totalObtained / pattern.totalInternalMax) * 100) : 0;
                                                    const grade = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';
                                                    const gradeColor = pct >= 60 ? 'text-emerald-600' : 'text-red-500';

                                                    return (
                                                        <tr key={mark._id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-5 py-3">
                                                                <p className="font-bold text-gray-800 text-sm">
                                                                    {mark.student?.fullName || mark.student?.username || '—'}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 uppercase font-medium">
                                                                    {mark.student?.registerNumber || ''}
                                                                </p>
                                                            </td>
                                                            {pattern.components.map((c: any) => {
                                                                const cm = mark.componentMarks?.find((m: any) => m.componentName === c.name);
                                                                return (
                                                                    <td key={c.name} className="px-5 py-3 text-center font-bold text-gray-700">
                                                                        {cm ? cm.marksObtained : '—'}
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className="px-5 py-3 text-center">
                                                                <span className="inline-flex items-center justify-center w-10 h-8 bg-indigo-50 text-indigo-700 rounded-lg font-extrabold text-sm">
                                                                    {mark.totalObtained}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 text-center">
                                                                <span className={`font-extrabold text-sm ${gradeColor}`}>{grade}</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Unconfigured */}
            {unconfiguredSubjects.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">No Pattern Configured</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {unconfiguredSubjects.map(sub => (
                            <div key={sub._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <p className="font-bold text-gray-700 text-sm">{sub.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase">{sub.code}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/hod/internal-pattern/${sub._id}`)}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    Set up →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {subjects.length === 0 && (
                <div className="text-center py-24 text-gray-400">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No subjects found for {user?.department}</p>
                </div>
            )}
        </div>
    );
};

export default HODInternalMarksView;
