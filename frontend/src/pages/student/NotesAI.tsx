import { useState, useEffect, useContext, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import { 
    Send, 
    Sparkles, 
    ChevronRight, 
    Loader2, 
    User,
    Bot,
    BookOpen,
    RefreshCw,
    Layers,
    File
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface NoteItem {
    _id: string;
    fileUrl: string;
    staffId: { fullName: string };
    createdAt: string;
}

const NotesAI = () => {
    const { token, user } = useContext(AuthContext)!;
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();
    const toast = useToast();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setHeaderOptions({
            title: 'NOTES AI ASSISTANT',
            subtitle: 'INTEGRATED READER & KNOWLEDGE ENGINE',
            actions: (
                <div className="flex gap-2">
                    <button 
                        onClick={() => { setMessages([]); toast.success('Protocol Session Reset'); }}
                        className="p-2 border border-slate-200 rounded text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm bg-white"
                        title="Reset Session"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded shadow-sm">
                        <Layers size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Sources: {notes.length}</span>
                    </div>
                </div>
            )
        });
    }, [user, setHeaderOptions, toast, notes.length]);

    useEffect(() => {
        fetchSubjects();
    }, [token]);

    useEffect(() => {
        if (selectedSubject) {
            fetchNotes();
        }
    }, [selectedSubject]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchSubjects = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/subjects/my-enrolled`, config);
            setSubjects(data);
            if (data.length > 0) setSelectedSubject(data[0]._id);
        } catch (error) {
            toast.error('Failed to load subjects');
        }
    };

    const fetchNotes = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/notes/subject/${selectedSubject}`, config);
            setNotes(data);
            if (data.length > 0) {
                setSelectedNote(data[0]);
            } else {
                setSelectedNote(null);
            }
        } catch (error) {
            console.error('Failed to fetch notes', error);
        }
    };

    const sendMessage = async (content: string) => {
        if (!content.trim() || !selectedSubject) return;

        const userMsg: Message = { role: 'user', content: content };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API}/api/notes/ask`, {
                subjectId: selectedSubject,
                question: content
            }, config);

            const aiMsg: Message = { role: 'assistant', content: data.answer };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            toast.error('AI Assistant is processing... (Neural Node Busy)');
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const suggestedTopics = [
        'Summarize this document',
        'Key definitions to remember',
        'Explain the core concepts',
        'Create a study guide'
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-[1400px] mx-auto w-full animate-in pb-4">
            {/* Subject Selector & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-slate-900 text-white p-4 rounded-sm shadow-xl border-b-4 border-primary/40">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Active Subject Protocol</span>
                        <div className="relative">
                            <select 
                                value={selectedSubject} 
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold uppercase tracking-widest focus:ring-0 appearance-none cursor-pointer pr-8"
                            >
                                {subjects.length > 0 ? (
                                    subjects.map(s => <option key={s._id} value={s._id} className="bg-slate-900">{s.name}</option>)
                                ) : (
                                    <option className="bg-slate-900">SYSTEM OFFLINE: ENROLL REQUIRED</option>
                                )}
                            </select>
                            <ChevronRight size={12} className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90 opacity-40 pointer-events-none" />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Encryption Status</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 font-mono">
                            <Sparkles size={10} /> SECURE RAG-LINK
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Left Pane: PDF Viewer */}
                <div className="w-1/2 bg-slate-50 border border-slate-200 shadow-sm rounded-sm flex flex-col overflow-hidden">
                    <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Document Viewer</span>
                            {selectedNote && (
                                <a 
                                    href={`${API}${selectedNote.fileUrl}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs text-primary hover:underline"
                                >
                                    Open in new tab
                                </a>
                            )}
                        </div>
                        {notes.length > 1 && (
                            <select
                                className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 font-medium max-w-[200px]"
                                value={selectedNote?._id || ''}
                                onChange={(e) => {
                                    const n = notes.find(n => n._id === e.target.value);
                                    if (n) setSelectedNote(n);
                                }}
                            >
                                {notes.map(n => (
                                    <option key={n._id} value={n._id}>
                                        {n.fileUrl.split('/').pop()}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden relative bg-slate-200 flex items-center justify-center">
                        {selectedNote ? (
                            <embed 
                                src={`${API}${selectedNote.fileUrl}?t=${Date.now()}`}
                                type="application/pdf"
                                className="w-full h-full border-none"
                            />
                        ) : (
                            <div className="text-center opacity-40 p-12">
                                <File size={48} className="mx-auto mb-4 opacity-20" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">No Documents Available</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Staff has not uploaded notes for this subject.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Main Chat Area */}
                <div className="w-1/2 bg-white border border-border shadow-2xl rounded-sm flex flex-col overflow-hidden relative">
                    {/* Background Decor */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
                        <AnimatePresence mode="popLayout">
                            {subjects.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center p-12"
                                >
                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-sm flex items-center justify-center mb-6 border border-red-100 shadow-inner">
                                        <BookOpen size={28} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Matrix Access Denied</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                                        Protocol requires active subject enrollment to initialize knowledge synthesis.
                                    </p>
                                    <Button onClick={fetchSubjects} variant="outline" className="mt-8 px-8 py-3 text-[10px] font-black uppercase border-primary/20 text-primary">
                                        Initialize Re-Sync
                                    </Button>
                                </motion.div>
                            ) : messages.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-12"
                                >
                                    <div className="w-16 h-16 bg-slate-50 text-primary rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm relative">
                                        <Bot size={32} className="relative z-10" />
                                        <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Neural Hub Active</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 mb-8 opacity-60">
                                        Querying knowledge from {notes.length} uploaded protocols
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md w-full">
                                        {suggestedTopics.map((topic, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => sendMessage(topic)}
                                                className="p-4 text-left bg-slate-50 border border-slate-200 rounded hover:border-primary hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600 group flex items-center justify-between"
                                            >
                                                {topic}
                                                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                messages.map((msg, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-7 h-7 rounded shrink-0 flex items-center justify-center text-[10px] font-black ${
                                            msg.role === 'user' ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white shadow-lg'
                                        }`}>
                                            {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                        </div>
                                        <div className={`max-w-[85%] px-5 py-3 rounded text-[13px] font-medium leading-loose shadow-sm border ${
                                            msg.role === 'user' 
                                                ? 'bg-white text-slate-900 border-slate-200 rounded-tr-none' 
                                                : 'bg-slate-50 text-slate-900 border-slate-100 rounded-tl-none relative before:content-[""] before:absolute before:left-[-1px] before:top-2 before:bottom-2 before:w-1 before:bg-primary'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
                                    <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center animate-pulse">
                                        <Loader2 size={12} className="animate-spin" />
                                    </div>
                                    <div className="px-5 py-3 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                                        Synthesizing Active Knowledge Bases...
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={chatEndRef} />
                    </div>

                    {/* Footer Input */}
                    <div className="p-5 bg-slate-50 border-t border-slate-100 relative z-10">
                        {messages.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar-hide mb-1 no-scrollbar">
                               {suggestedTopics.map((topic, i) => (
                                   <button key={i} onClick={() => sendMessage(topic)} className="shrink-0 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm active:scale-95">
                                       {topic}
                                   </button>
                               ))}
                            </div>
                        )}
                        
                        <form onSubmit={handleSend} className="flex gap-3 w-full">
                            <div className="flex-1 relative">
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask the AI about these notes..."
                                    className="w-full bg-white h-11 pl-5 pr-12 text-[11px] font-bold uppercase tracking-widest border border-slate-200 focus:border-primary transition-all rounded shadow-sm outline-none placeholder:opacity-30"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                                    <Sparkles size={14} className="text-primary" />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isTyping || !selectedSubject}
                                className="bg-slate-900 hover:bg-black text-white px-6 h-11 rounded font-black text-[9px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Send size={12} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesAI;
