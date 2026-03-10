import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, FileText, Search, Sparkles, MessageSquare, Box, Wand2, Zap } from 'lucide-react';
import GlobalRAGChat from '../../components/GlobalRAGChat';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentStudyResources = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API}/api/study-materials`, config);
                setResources(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [token]);

    const filtered = resources.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-10">
            {/* Full-Width Standardized Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-indigo-600 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Knowledge Base</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
                                Study Resources
                            </h1>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                Access academic telemetry and AI-enhanced lecture materials
                            </p>
                        </div>

                        <div className="w-full md:w-96">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex items-center group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                <Search className="w-5 h-5 text-slate-400 mr-3 group-focus-within:text-indigo-500" />
                                <input
                                    type="text"
                                    placeholder="SEARCH MATERIALS..."
                                    className="flex-1 outline-none text-[10px] font-black text-slate-700 bg-transparent placeholder:text-slate-300 uppercase tracking-widest"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
                {/* Global AI Assistant Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 shadow-xl border border-white/10 group mb-8">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                <Zap className="w-3 h-3 fill-current" /> New Feature Activated
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                                Global Academic <br className="hidden md:block" /> AI Assistant
                            </h2>
                            <p className="text-indigo-100 text-sm md:text-base max-w-xl leading-relaxed font-medium">
                                Search across ALL your study materials simultaneously. Ask complex questions,
                                compare units, or get summaries across multiple subjects with our new RAG-powered engine.
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                <button
                                    onClick={() => setIsGlobalChatOpen(true)}
                                    className="px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 flex items-center gap-3 active:scale-95"
                                >
                                    <Wand2 className="w-5 h-5" /> Launch Global AI
                                </button>
                                <div className="flex items-center gap-3 px-4 py-2 bg-black/10 rounded-2xl border border-white/5 text-indigo-200 text-xs font-semibold backdrop-blur-sm">
                                    <Box className="w-4 h-4" /> Analyzes 10+ Notebooks
                                </div>
                            </div>
                        </div>
                        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center shrink-0">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse" />
                            <Sparkles className="w-32 h-32 md:w-48 md:h-48 text-white/20 animate-bounce duration-[3000ms]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                <MessageSquare className="w-16 h-16 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-[0.03] rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-400 opacity-[0.05] rounded-full blur-3xl" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="font-semibold text-gray-900">No resources available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(r => (
                            <div key={r._id}
                                onClick={() => navigate(`/student/resources/${r._id}`)}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full overflow-hidden"
                            >
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg tracking-wider">
                                            {r.type}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">{r.title}</h3>
                                    <p className="text-sm font-bold text-indigo-500/80 mb-3">{r.subjectId?.name || 'Unknown Subject'}</p>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-3">
                                        {r.description || 'Access full notes and AI-powered doubt clearance for this academic session.'}
                                    </p>
                                </div>

                                <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{r.academicYear}</span>
                                        <span className="text-[9px] text-indigo-400 font-extrabold uppercase mt-0.5">Semester {r.semester}</span>
                                    </div>
                                    {r.extractedText && (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-xl shadow-sm">
                                            <Sparkles className="w-3.5 h-3.5" /> AI READY
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Global RAG Chat Modal */}
            <GlobalRAGChat
                isOpen={isGlobalChatOpen}
                onClose={() => setIsGlobalChatOpen(false)}
            />
        </div>
    );
};

export default StudentStudyResources;
