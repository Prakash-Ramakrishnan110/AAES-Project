import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { ChevronLeft, Save, Check, AlertTriangle, FileText } from 'lucide-react';

import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Component {
    name: string;
    maxMarks: number;
}

interface Pattern {
    _id: string;
    components: Component[];
    totalInternalMax: number;
    marksLocked: boolean;
    published: boolean;
}

interface StudentMark {
    studentId: string;
    name: string;
    registerNumber: string;
    marks: { [key: string]: number | '' }; // componentName -> marks ('' = blank/untouched)
}

const InternalMarksEntry = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const { token, user } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const [pattern, setPattern] = useState<Pattern | null>(null);
    const [students, setStudents] = useState<StudentMark[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const academicYear = user?.academicYear || '2023-24';
    const semester = user?.semester || '1';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get pattern by subjectId alone (no academicYear/semester dependency)
                let currentPattern: Pattern | null = null;
                try {
                    const patternRes = await axios.get(`${API}/api/internal/pattern/subject/${subjectId}`, config);
                    currentPattern = patternRes.data;
                } catch (patternErr: any) {
                    if (patternErr.response?.status === 404) {
                        setError('Internal Pattern not defined by HOD for this subject.');
                        setLoading(false);
                        return;
                    }
                    throw patternErr;
                }

                setPattern(currentPattern);

                // 2. Get students enrolled in subject
                const studentRes = await axios.get(`${API}/api/attendance/subject/${subjectId}/students`, config);

                // 3. Get existing marks — if call fails just start with blank marks
                let existingMarks: any[] = [];
                try {
                    const patYear = (currentPattern as any).academicYear || academicYear;
                    const patSem = (currentPattern as any).semester || semester;
                    const marksRes = await axios.get(
                        `${API}/api/internal/subject-marks?subjectId=${subjectId}&academicYear=${patYear}&semester=${patSem}`,
                        config
                    );
                    existingMarks = marksRes.data.marks || [];
                } catch {
                    existingMarks = [];
                }

                // 4. Map marks onto student list (blank = no default 0)
                const studentList = studentRes.data.students.map((s: any) => {
                    const existing = existingMarks.find((m: any) => m.student._id === s._id);
                    const marksMap: { [key: string]: number | '' } = {};

                    currentPattern!.components.forEach((c: Component) => {
                        const m = existing?.componentMarks.find((cm: any) => cm.componentName === c.name);
                        marksMap[c.name] = m ? m.marksObtained : '';
                    });

                    return {
                        studentId: s._id,
                        name: s.fullName || s.username,
                        registerNumber: s.registerNumber || '',
                        marks: marksMap
                    };
                });

                setStudents(studentList);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        if (token && subjectId) fetchData();
    }, [subjectId, token]);

    const handleMarkChange = (studentId: string, componentName: string, value: string) => {
        if (value !== '' && !/^\d*$/.test(value)) return; // digits only
        const numVal = value === '' ? '' : parseInt(value, 10);
        const comp = pattern?.components.find(c => c.name === componentName);

        if (comp && typeof numVal === 'number' && numVal > comp.maxMarks) return; // Prevent over-limit

        setStudents(prev => prev.map(s => {
            if (s.studentId === studentId) {
                return { ...s, marks: { ...s.marks, [componentName]: numVal } };
            }
            return s;
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        try {
            const marksData = students.map(s => ({
                studentId: s.studentId,
                componentMarks: Object.entries(s.marks).map(([name, marks]) => ({ name, marks: Number(marks) || 0 }))
            }));

            await axios.post(`${API}/api/internal/marks`, {
                subjectId,
                academicYear,
                semester,
                marksData
            }, config);

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save marks');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error && !pattern) return (
        <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-3xl border border-dashed border-gray-200 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Pattern Missing</h2>
            <p className="text-gray-500">{error}</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                Go Back
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl hover:bg-gray-100 transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Internal Mark Entry</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                {academicYear} | SEM {semester}
                            </span>
                        </div>
                    </div>
                </div>

                {pattern?.marksLocked ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-semibold">
                        <AlertTriangle className="w-4 h-4" /> Marks Locked by HOD
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={saving || students.length === 0}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200"
                    >
                        {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Marks</>}
                    </button>
                )}
            </div>

            {/* Pattern Summary Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Assessment Pattern</p>
                        <p className="text-lg font-bold text-gray-800">Dynamic Structure</p>
                    </div>
                </div>

                <div className="h-10 w-px bg-gray-100 hidden md:block" />

                <div className="flex flex-wrap gap-4">
                    {pattern?.components.map(c => (
                        <div key={c.name} className="px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{c.name}</p>
                            <p className="text-sm font-extrabold text-gray-700">Max: {c.maxMarks}</p>
                        </div>
                    ))}
                    <div className="px-4 py-2 bg-indigo-600 rounded-2xl text-white shadow-md">
                        <p className="text-[10px] font-bold opacity-70 uppercase">Total Internals</p>
                        <p className="text-sm font-extrabold">{pattern?.totalInternalMax} Marks</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Student</th>
                                {pattern?.components.map(c => (
                                    <th key={c.name} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">
                                        {c.name} <span className="block opacity-50 font-normal">({c.maxMarks})</span>
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider border-b border-gray-100 text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map((s, idx) => {
                                const total = Object.values(s.marks).reduce((a: number, b) => a + (Number(b) || 0), 0);
                                return (
                                    <motion.tr
                                        key={s.studentId}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.01 }}
                                        className="hover:bg-indigo-50/20 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{s.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium uppercase">{s.registerNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {pattern?.components.map(c => (
                                            <td key={c.name} className="px-6 py-4 text-center">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={s.marks[c.name] === '' ? '' : s.marks[c.name]}
                                                    placeholder="—"
                                                    disabled={pattern?.marksLocked}
                                                    onChange={(e) => handleMarkChange(s.studentId, c.name, e.target.value)}
                                                    className="w-16 h-10 text-center border border-gray-200 bg-gray-50 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition-all disabled:opacity-50 placeholder:text-gray-300"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center w-12 h-10 bg-indigo-50 text-indigo-700 rounded-xl font-extrabold text-sm">
                                                {total}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">{error}</div>}
        </div>
    );
};

export default InternalMarksEntry;
