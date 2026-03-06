import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { ChevronLeft, Send, Sparkles, FileText, AlertCircle, Loader2 } from 'lucide-react';
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

    useEffect(() => {
        fetchResource();
    }, [id, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    const quickActions = [
        "Summarize this document",
        "Generate 5 important questions",
        "Explain the key concepts simply",
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!resource) {
        return <div className="text-center py-20 text-gray-500">Resource not found.</div>;
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-gray-50 -m-4 sm:-m-6 lg:-m-8">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-colors text-gray-500">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1">{resource.title}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                {resource.type}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                {resource.subjectId?.name} • {resource.unit}
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <a href={`${API}${resource.fileUrl}`} download className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 shadow-sm transition-all hover:border-gray-300">
                        Download Original
                    </a>
                </div>
            </div>

            {/* Content Area - Split View */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Side: Document Viewer */}
                <div className="flex-1 border-r border-gray-200 bg-gray-100 overflow-hidden relative shadow-inner">
                    {resource.fileUrl ? (
                        <iframe
                            src={`${API}${resource.fileUrl}`}
                            title={resource.title}
                            className="w-full h-full border-none bg-white"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-white m-4 rounded-2xl border border-dashed border-gray-300">
                            <FileText className="w-16 h-16 mb-4 opacity-50 text-indigo-300" />
                            <h3 className="text-gray-900 font-bold mb-1">Preview Unavailable</h3>
                            <p className="max-w-xs mx-auto">Document preview is not available for this file type in the browser.</p>
                            <a href={`${API}${resource.fileUrl}`} download className="mt-6 px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
                                Download File securely
                            </a>
                        </div>
                    )}
                </div>

                {/* Right Side: AI Assistant Chat */}
                <div className="w-full lg:w-[450px] flex flex-col bg-white shrink-0 relative shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-10">
                    <div className="px-5 py-4 border-b border-indigo-50 bg-white flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-md shadow-indigo-200/50">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-[15px] tracking-tight">AAES AI</h2>
                            <p className="text-[11px] text-indigo-600 uppercase tracking-wider font-bold mt-0.5">Secure Document Query</p>
                        </div>
                    </div>

                    {!resource.extractedText && (
                        <div className="mx-5 my-4 p-4 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start gap-3 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[13px] font-bold text-amber-900">AI Context Pending / Unavailable</p>
                                <p className="text-[12px] text-amber-700/80 mt-1 leading-relaxed">
                                    Text extraction for this document is processing or unsupported. The AI AI may not be fully able to answer questions yet.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-sm ${msg.sender === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]'
                                    }`}>
                                    {msg.loading ? (
                                        <div className="flex items-center gap-1.5 h-6 px-1">
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75" />
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150" />
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-white max-w-none text-current markdown-body">
                                            {msg.sender === 'user' ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 mt-1.5 px-1 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                    {msg.sender === 'user' ? 'You' : 'AAES AI'}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} className="h-2" />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-5 py-3 flex flex-wrap gap-2 border-t border-gray-100 bg-white">
                        {quickActions.map(action => (
                            <button
                                key={action}
                                onClick={() => handleSend(action)}
                                disabled={isAiLoading}
                                className="px-3 py-1.5 bg-indigo-50/50 border border-indigo-100 text-indigo-700 text-[11px] font-bold rounded-full hover:bg-indigo-100 hover:border-indigo-200 transition-all shadow-sm disabled:opacity-50 hover:-translate-y-0.5"
                            >
                                {action}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 pt-2 bg-white pb-safe">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                            className="relative flex items-end gap-2 group"
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
                                className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-3.5 pl-4 pr-12 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32 transition-all group-hover:border-indigo-200"
                                rows={1}
                                style={{ minHeight: '48px' }}
                                disabled={isAiLoading}
                                maxLength={3000}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isAiLoading}
                                className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-400 transition-all shadow-md shadow-indigo-200 active:scale-95 flex items-center justify-center h-10 w-10 disabled:shadow-none"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </button>
                        </form>
                        <div className="flex items-center justify-center gap-1 mt-3">
                            <AlertCircle className="w-3 h-3 text-gray-400" />
                            <p className="text-[10px] text-gray-400 font-medium">
                                AI responses are generated strictly from the provided document context.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDocumentViewer;
