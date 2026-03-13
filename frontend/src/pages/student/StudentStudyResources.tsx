import { useState, useEffect, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, FileText, Search, Sparkles, ChevronRight } from 'lucide-react';
import GlobalRAGChat from '../../components/GlobalRAGChat';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentStudyResources = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();
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
 
    useEffect(() => {
        setHeaderOptions({
            title: 'Knowledge Repository',
            subtitle: (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md border border-slate-200">Institutional Study Materials</span>
                </div>
            ),
            actions: (
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search repository..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-10 pr-4 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            )
        });
    }, [setHeaderOptions, searchTerm]);

    const filtered = resources.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            {/* AI Assistant Banner */}
            <div className="bg-slate-900 rounded-md p-8 text-white relative overflow-hidden shadow-sm border border-slate-700">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-md text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/10">
                            <Sparkles className="w-3.5 h-3.5" /> Multi-Subject Intelligence Hub
                        </div>
                        <h2 className="text-2xl font-bold mb-3 tracking-tight">Contextual AI Assistant</h2>
                        <p className="text-white/60 text-sm font-medium max-w-2xl leading-relaxed">
                            Interrogate your academic repository using advanced AI. Our intelligence engine parses 
                            institutional materials to provide verified contextual responses and synthetic summaries.
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsGlobalChatOpen(true)}
                        className="bg-white text-slate-900 px-6 py-3 rounded-md font-bold text-sm hover:bg-slate-100 transition-colors shrink-0 shadow-sm flex items-center gap-2"
                    >
                        Initialize Assistant <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
 
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-md border border-slate-200 p-16 text-center shadow-sm">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-900">No Knowledge Assets Found</h3>
                    <p className="text-slate-500 text-sm font-medium mt-2">The academic repository is currently synchronized but empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(r => (
                        <div 
                            key={r._id}
                            onClick={() => navigate(`/student/resources/${r._id}`)}
                            className="bg-white rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full overflow-hidden p-6 hover:-translate-y-0.5 duration-200"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-100 text-slate-600 rounded-md border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md tracking-wider whitespace-nowrap">
                                    {r.type}
                                </span>
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{r.subjectId?.name || 'Institutional Core'}</p>
                                <h3 className="font-bold text-slate-900 text-lg mb-2 leading-tight group-hover:text-slate-700 transition-colors line-clamp-2">{r.title}</h3>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                    {r.description || 'Verified reference material for the current academic curriculum cycle.'}
                                </p>
                            </div>
 
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{r.academicYear}</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="text-[9px] text-slate-700 font-bold uppercase tracking-wider">Sem {r.semester}</span>
                                </div>
                                {r.extractedText && (
                                    <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3" /> Indexed
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Global RAG Chat Modal */}
            <GlobalRAGChat
                isOpen={isGlobalChatOpen}
                onClose={() => setIsGlobalChatOpen(false)}
            />
        </div>
    );
};

export default StudentStudyResources;
