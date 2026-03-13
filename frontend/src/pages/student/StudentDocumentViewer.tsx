import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { ChevronLeft, Send, Sparkles, FileText, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    loading?: boolean;
}

const StudentDocumentViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext)!;

    const [resource, setResource] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hi! I'm AAES AI. I've read this document and I'm ready to help answer any questions you have about it.", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasAutoSummarized = useRef(false);

    const fetchResource = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Using the new robust backend endpoint created earlier
            const res = await axios.get(`${API}/api/study-materials/${id}`, config);
            setResource(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to load resource');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (text: string) => {
        if (!text.trim() || isAiLoading) return;

        const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
        const loadingMsg: Message = { id: 'loading', text: '', sender: 'ai', loading: true };

        setMessages(prev => [...prev, userMsg, loadingMsg]);
        setInput('');
        setIsAiLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Using the newly created precise chat route
            const res = await axios.post(`${API}/api/ai-chat/ask`, { materialId: id, question: text }, config);

            setMessages(prev => prev.filter(m => !m.loading).concat({
                id: Date.now().toString(),
                text: res.data.answer,
                sender: 'ai'
            }));
        } catch (err: any) {
            setMessages(prev => prev.filter(m => !m.loading).concat({
                id: Date.now().toString(),
                text: err.response?.data?.message || "Sorry, I encountered an error while connecting to the AI brain.",
                sender: 'ai'
            }));
        } finally {
            setIsAiLoading(false);
        }
    };

    useEffect(() => {
        fetchResource();
    }, [id, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (resource && resource.extractedText && !hasAutoSummarized.current && messages.length === 1) {
            hasAutoSummarized.current = true;
            // Delay slightly for better UX feel
            setTimeout(() => {
                handleSend("Please provide a very brief, 3-bullet point summary of this document and suggest what I should focus on.");
            }, 1000);
        }
    }, [resource]);

    const quickActions = [
        "Summarize this document",
        "Generate 5 important questions",
        "Explain the key concepts simply",
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!resource) {
        return <div className="text-center py-20 text-slate-500 font-medium">Resource not found.</div>;
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-50 -m-4 sm:-m-6 lg:-m-8">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-500">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">{resource.title}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200">
                                {resource.type}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                                {resource.subjectId?.name} • {resource.unit}
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <a href={`${API}${resource.fileUrl}`} download className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md border border-slate-200 shadow-sm transition-colors">
                        Download Original
                    </a>
                </div>
            </div>

            {/* Content Area - Split View */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Side: Document Viewer */}
                <div className="flex-1 border-r border-slate-200 bg-slate-100 overflow-hidden relative">
                    {resource.fileUrl ? (
                        <iframe
                            src={`${API}${resource.fileUrl}`}
                            title={resource.title}
                            className="w-full h-full border-none bg-white"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-white m-4 rounded-md border border-dashed border-slate-300">
                            <FileText className="w-14 h-14 mb-4 opacity-50 text-slate-300" />
                            <h3 className="text-slate-900 font-bold mb-1">Preview Unavailable</h3>
                            <p className="max-w-xs mx-auto text-sm">Document preview is not available for this file type in the browser.</p>
                            <a href={`${API}${resource.fileUrl}`} download className="mt-6 px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-md hover:bg-slate-200 transition-colors border border-slate-200 text-sm">
                                Download File
                            </a>
                        </div>
                    )}
                </div>

                {/* Right Side: AI Assistant Chat */}
                <div className="w-full lg:w-[450px] flex flex-col bg-white shrink-0 relative z-10">
                    <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 text-white rounded-md relative">
                                <Sparkles className="w-4 h-4" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 text-sm tracking-tight">AAES AI Assistant</h2>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-slate-400 rounded-full" />
                                    Document RAG Active
                                </p>
                            </div>
                        </div>
                    </div>

                    {!resource.extractedText && (
                        <div className="mx-5 my-4 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-900">AI Context Pending</p>
                                <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                                    Text extraction for this document is processing or unsupported. The AI may not be fully able to answer questions yet.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} group`}>
                                <div className={`max-w-[88%] rounded-md px-4 py-3 text-sm leading-relaxed ${msg.sender === 'user'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-800 border border-slate-100 shadow-sm'
                                    }`}>
                                    {msg.loading ? (
                                        <div className="flex items-center gap-1.5 h-6 px-1">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-white max-w-none text-current markdown-body">
                                            {msg.sender === 'user' ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 mt-1.5 px-1 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                    {msg.sender === 'user' ? 'You' : 'AAES AI'}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} className="h-2" />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-5 py-3 flex flex-wrap gap-2 border-t border-slate-100 bg-white">
                        {quickActions.map(action => (
                            <button
                                key={action}
                                onClick={() => handleSend(action)}
                                disabled={isAiLoading}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50"
                            >
                                {action}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 pt-2 bg-white pb-safe">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                            className="relative flex items-end gap-2"
                        >
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(input);
                                    }
                                }}
                                placeholder="Ask a question about this material..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-md py-3 pl-4 pr-12 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 resize-none max-h-32 transition-colors font-medium"
                                rows={1}
                                style={{ minHeight: '48px' }}
                                disabled={isAiLoading}
                                maxLength={3000}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isAiLoading}
                                className="absolute right-2 bottom-2 p-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-400 transition-colors shadow-sm flex items-center justify-center h-9 w-9"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                        <div className="flex items-center justify-center gap-1.5 mt-3">
                            <div className="flex gap-1">
                                <span className="w-1 h-1 bg-slate-400 rounded-full animate-pulse" />
                                <span className="w-1 h-1 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]" />
                                <span className="w-1 h-1 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]" />
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                AI searches specific segments of this document
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDocumentViewer;
