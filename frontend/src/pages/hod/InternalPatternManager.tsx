import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    ChevronLeft, Plus, Trash2, Lock, Save,
    Check, AlertCircle, Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Component {
    name: string;
    maxMarks: number;
}

interface Pattern {
    _id?: string;
    subjectId: string;
    components: Component[];
    totalInternalMax: number;
    patternLocked: boolean;
    marksLocked: boolean;
    published: boolean;
}

const InternalPatternManager = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext)!;

    const [pattern, setPattern] = useState<Pattern>({
        subjectId: subjectId || '',
        components: [],
        totalInternalMax: 0,
        patternLocked: false,
        marksLocked: false,
        published: false
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchPattern();
    }, [subjectId, token]);

    const fetchPattern = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API}/api/internal/pattern/subject/${subjectId}`, config);
            if (res.data) {
                setPattern(res.data);
            }
        } catch (err: any) {
            console.error('Error fetching pattern', err);
            // If 404, we just stay with empty pattern
            if (err.response?.status !== 404) {
                setError('Failed to fetch pattern configuration.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddComponent = () => {
        if (pattern.patternLocked) return;
        setPattern({
            ...pattern,
            components: [...pattern.components, { name: '', maxMarks: 0 }]
        });
    };

    const handleRemoveComponent = (index: number) => {
        if (pattern.patternLocked) return;
        const newComponents = [...pattern.components];
        newComponents.splice(index, 1);
        setPattern({ ...pattern, components: newComponents });
    };

    const handleComponentChange = (index: number, field: keyof Component, value: string | number) => {
        if (pattern.patternLocked) return;
        const newComponents = [...pattern.components];
        (newComponents[index] as any)[field] = value;
        setPattern({ ...pattern, components: newComponents });
    };

    const handleSavePattern = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        const totalMax = pattern.components.reduce((sum, c) => sum + (Number(c.maxMarks) || 0), 0);
        const payload = { ...pattern, totalInternalMax: totalMax };

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(`${API}/api/internal/pattern`, payload, config);
            // Backend returns the pattern object directly
            setPattern(res.data);
            setSuccess('Pattern saved successfully.');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save pattern.');
        } finally {
            setIsSaving(false);
        }
    };

    const togglePatternLock = async () => {
        if (!pattern._id) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(`${API}/api/internal/pattern/${pattern._id}/lock`, {}, config);
            setPattern(res.data.pattern || res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update lock state.');
        }
    };

    const toggleMarksLock = async () => {
        if (!pattern._id) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const newLocked = !pattern.marksLocked;
            const res = await axios.put(`${API}/api/internal/pattern/${pattern._id}/toggle-lock`, { locked: newLocked }, config);
            setPattern(res.data.pattern || res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update marks lock state.');
        }
    };

    const togglePublish = async () => {
        if (!pattern._id) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const newPublished = !pattern.published;
            const res = await axios.put(`${API}/api/internal/pattern/${pattern._id}/toggle-publish`, { published: newPublished }, config);
            setPattern(res.data.pattern || res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update publish state.');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-400">Loading Configuration...</div>;

    const totalCalculated = pattern.components.reduce((sum, c) => sum + (Number(c.maxMarks) || 0), 0);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assessment Configuration</h1>
                        <p className="text-sm text-gray-500">Subject: {subjectId}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {pattern._id && (
                        <>
                            <button
                                onClick={togglePatternLock}
                                title={pattern.patternLocked ? 'Click to unlock and edit components' : 'Click to lock component structure'}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${pattern.patternLocked
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                                    }`}
                            >
                                {pattern.patternLocked ? <Lock className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
                                {pattern.patternLocked ? 'Unlock Structure' : 'Lock Structure'}
                            </button>

                            <button
                                onClick={toggleMarksLock}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${pattern.marksLocked ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white text-gray-600 border-gray-200 hover:border-rose-400 hover:text-rose-600'}`}
                            >
                                <Lock className="w-4 h-4" />
                                {pattern.marksLocked ? 'Entry Locked' : 'Lock Marks Entry'}
                            </button>

                            <button
                                onClick={togglePublish}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${pattern.published ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-400 hover:text-emerald-600'}`}
                            >
                                {pattern.published ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {pattern.published ? 'Published' : 'Publish Marks'}
                            </button>
                        </>
                    )}
                </div>
            </header>

            {(error || success) && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl flex items-center gap-3 border ${error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {error ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                    <span className="text-sm font-bold">{error || success}</span>
                </motion.div>
            )}

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Pattern Components</h3>
                        <p className="text-sm text-gray-400">Define parts of the internal assessment (e.g. CIA 1, Assignment).</p>
                    </div>
                    {!pattern.patternLocked && (
                        <button onClick={handleAddComponent} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                            <Plus className="w-4 h-4" /> Add Component
                        </button>
                    )}
                </div>

                <div className="p-8 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {pattern.components.map((comp, idx) => (
                            <motion.div
                                key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="flex gap-4 items-center group"
                            >
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={comp.name}
                                        disabled={pattern.patternLocked}
                                        onChange={(e) => handleComponentChange(idx, 'name', e.target.value)}
                                        placeholder="Component Name (e.g. Midterm)"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        value={comp.maxMarks}
                                        disabled={pattern.patternLocked}
                                        onChange={(e) => handleComponentChange(idx, 'maxMarks', parseInt(e.target.value))}
                                        placeholder="Max Marks"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all disabled:opacity-60"
                                    />
                                </div>
                                {!pattern.patternLocked && (
                                    <button onClick={() => handleRemoveComponent(idx)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {pattern.components.length === 0 && (
                        <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                            <p className="text-gray-400 font-medium">No components defined yet.</p>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Max Marks</p>
                            <h4 className="text-2xl font-black text-gray-900">{totalCalculated}</h4>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${pattern._id ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {pattern._id ? 'Configured' : 'New Pattern'}
                            </span>
                        </div>
                    </div>

                    {!pattern.patternLocked && (
                        <button
                            onClick={handleSavePattern}
                            disabled={isSaving || pattern.components.length === 0}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                        >
                            {isSaving ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {pattern._id ? 'Update Configuration' : 'Create Configuration'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Lock className="w-5 h-5" /></div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">Pattern Locking Policy</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Once a pattern is locked, its structure (components and max marks) cannot be changed to ensure consistency during evaluation.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Check className="w-5 h-5" /></div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">Publishing Marks</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Publishing marks will make the internal scores visible to students. Ensure all audits are complete before publishing.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Activity icon for loading state
const Activity = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default InternalPatternManager;
