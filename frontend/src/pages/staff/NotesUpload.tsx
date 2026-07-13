import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    Upload, FileText, Trash2, BookOpen, 
    Sparkles, Loader2, Info,
    Calendar, Layers, Filter
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const NotesUpload = () => {
    const { token } = useContext(AuthContext)!;
    const toast = useToast();
    const [notes, setNotes] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // Filtering states
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSem, setSelectedSem] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, [token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [subjRes, notesRes] = await Promise.all([
                axios.get(`${API}/api/subjects/my-assigned`, config),
                axios.get(`${API}/api/notes/my`, config)
            ]);
            
            const assignedSubjects = subjRes.data;
            setSubjects(assignedSubjects);
            setNotes(notesRes.data);

            if (assignedSubjects.length > 0) {
                // Initialize filters with first available subject values
                const first = assignedSubjects[0];
                setSelectedYear(first.academicYear || '');
                setSelectedSem(first.semester?.toString() || '');
                setSelectedSubject(first._id);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Derived lists based on selection
    const availableYears = [...new Set(subjects.map(s => s.academicYear))].filter(Boolean).sort();
    
    const availableSems = [...new Set(
        subjects
            .filter(s => !selectedYear || s.academicYear === selectedYear)
            .map(s => s.semester?.toString())
    )].filter(Boolean).sort((a,b) => Number(a) - Number(b));

    const filteredSubjects = subjects.filter(s => 
        (!selectedYear || s.academicYear === selectedYear) && 
        (!selectedSem || s.semester?.toString() === selectedSem)
    );

    // Update subject selection when filters change
    useEffect(() => {
        if (filteredSubjects.length > 0) {
            if (!filteredSubjects.find(s => s._id === selectedSubject)) {
                setSelectedSubject(filteredSubjects[0]._id);
            }
        } else {
            setSelectedSubject('');
        }
    }, [selectedYear, selectedSem, subjects]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedSubject) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('subjectId', selectedSubject);

            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };
            
            await axios.post(`${API}/api/notes/upload`, formData, config);
            toast.success('Notes uploaded and indexed for AI Assistant!');
            setFile(null);
            fetchData();
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this material?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API}/api/notes/${id}`, config);
            toast.success('Deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-in">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Knowledge Base</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Power the AI Assistant by uploading subject materials</p>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded shadow-lg">
                    <Sparkles size={14} className="text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Index Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-2 border-primary/5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Layers size={80} />
                        </div>
                        
                        <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                            <div className="flex items-center gap-3 border-b border-border pb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Upload size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Add Knowledge</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">New Protocol Entry</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Academic Year</label>
                                        <div className="relative">
                                            <select 
                                                value={selectedYear} 
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                className="w-full h-10 px-3 pr-8 rounded border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none appearance-none transition-all"
                                            >
                                                <option value="">All Years</option>
                                                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                                            </select>
                                            <Calendar size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Semester</label>
                                        <div className="relative">
                                            <select 
                                                value={selectedSem} 
                                                onChange={(e) => setSelectedSem(e.target.value)}
                                                className="w-full h-10 px-3 pr-8 rounded border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none appearance-none transition-all"
                                            >
                                                <option value="">All Sems</option>
                                                {availableSems.map(sem => <option key={sem} value={sem}>Sem {sem}</option>)}
                                            </select>
                                            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Subject Target</label>
                                    <select 
                                        value={selectedSubject} 
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="w-full h-12 px-4 rounded border-2 border-slate-100 bg-slate-50 text-[12px] font-black uppercase tracking-tighter focus:border-primary focus:bg-white outline-none transition-all disabled:opacity-50"
                                        disabled={filteredSubjects.length === 0}
                                    >
                                        {filteredSubjects.length > 0 ? (
                                            filteredSubjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)
                                        ) : (
                                            <option value="">No Subjects Found</option>
                                        )}
                                    </select>
                                </div>

                                <div className="relative group">
                                    <input type="file" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" id="note-upload" />
                                    <label htmlFor="note-upload" className="block p-8 border-2 border-dashed border-slate-200 rounded-lg text-center cursor-pointer hover:border-primary hover:bg-primary/[0.02] transition-all bg-slate-50/50 group">
                                        <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 transition-all group-hover:scale-110 group-hover:text-primary">
                                            <Upload size={20} />
                                        </div>
                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                            {file ? file.name : "Protocol Source Selection"}
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-widest">PDF, PNG, JPG Accepted (Max 50MB)</p>
                                    </label>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all mt-4" 
                                disabled={uploading || !file || !selectedSubject}
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Sparkles className="w-4 h-4 mr-3 text-primary" />}
                                Initialize Upload
                            </Button>
                        </form>
                    </Card>

                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={14} className="text-primary" />
                            <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Upload Guide</span>
                        </div>
                        <ul className="space-y-2">
                            {['Select Year & Sem first to filter subjects', 'Ensure text is clear for OCR extraction', 'Uploaded files feed the Student AI Assistant'].map((item, i) => (
                                <li key={i} className="text-[9px] font-bold text-slate-500 uppercase flex items-start gap-2 leading-tight">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <Card className="p-0 overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BookOpen size={18} className="text-primary" />
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Resource Registry</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Active Synthesis Data Points</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                                {notes.length} Documents Active
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {loading ? (
                                <div className="space-y-4">
                                    {Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="h-20 bg-slate-50 rounded-lg animate-pulse border border-slate-100" />
                                    ))}
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="py-24 text-center opacity-30">
                                    <BookOpen className="w-12 h-12 mx-auto mb-6" />
                                    <p className="text-[11px] font-black uppercase tracking-widest">Awaiting Knowledge Inputs</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notes.map((note) => (
                                        <motion.div 
                                            key={note._id} 
                                            initial={{ opacity: 0, x: -10 }} 
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-4 bg-white border border-slate-100 rounded-lg flex items-center justify-between group hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-border flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-tighter">{note.subjectId?.name || 'General Notes'}</h4>
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded">
                                                            {note.subjectId?.code}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Calendar size={10} /> {new Date(note.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> RAG_SYNCED
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleDelete(note._id)} 
                                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                    title="Remove Resource"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NotesUpload;
