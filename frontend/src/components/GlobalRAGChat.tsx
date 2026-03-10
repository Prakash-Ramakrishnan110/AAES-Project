import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, BookOpen, AlertCircle, Info, Trash2 } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Message {
    sender: 'user' | 'ai';
    text: string;
    loading?: boolean;
    sources?: any[];
}

interface GlobalRAGChatProps {
    isOpen: boolean;
    onClose: () => void;
}

const GlobalRAGChat: React.FC<GlobalRAGChatProps> = ({ isOpen, onClose }) => {
    const [chatMode, setChatMode] = useState<'study' | 'system'>('study');
    const [messages, setMessages] = useState<Message[]>([
        {
            sender: 'ai',
            text: "Hello! I'm your Global AAES Assistant. I can answer questions across ALL your study materials. What would you like to know today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (chatMode === 'system' && messages.length === 1) {
            setMessages([{
                sender: 'ai',
                text: "I'm now in **System Help** mode. You can ask me about AAES features, how the evaluation works, or technical details about our AI and OCR pipelines."
            }]);
        } else if (chatMode === 'study' && messages.length === 1) {
            setMessages([{
                sender: 'ai',
                text: "Back in **Study Materials** mode. I'm ready to help you with your notes and subjects!"
            }]);
        }
    }, [chatMode]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isAiLoading) return;

        const userMsg: Message = { sender: 'user', text: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsAiLoading(true);

        const aiMsg: Message = { sender: 'ai', text: '', loading: true };
        setMessages(prev => [...prev, aiMsg]);

        try {
            const token = localStorage.getItem('token');
            const endpoint = chatMode === 'study' ? '/api/ai-chat/global-ask' : '/api/ai-chat/system-ask';

            const res = await axios.post(`${API}${endpoint}`, {
                question: text.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    sender: 'ai',
                    text: res.data.answer,
                    sources: res.data.sources,
                    loading: false
                };
                return updated;
            });
        } catch (error: any) {
            console.error("Global Chat Error:", error);
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    sender: 'ai',
                    text: error.response?.data?.message || "Sorry, I'm having trouble connecting to the AI brain right now. Please try again soon.",
                    loading: false
                };
                return updated;
            });
        } finally {
            setIsAiLoading(false);
        }
    };

    const clearChat = () => {
        if (window.confirm('Clear current conversation?')) {
            setMessages([{
                sender: 'ai',
                text: "Conversation cleared. How else can I help you across your study materials?"
            }]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-indigo-100/50 animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-6 py-5 border-b border-indigo-50 bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex items-center justify-between shrink-0 shadow-lg relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 shadow-inner">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg tracking-tight">Global AAES Assistant</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <button
                                    onClick={() => setChatMode('study')}
                                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md transition-all ${chatMode === 'study' ? 'bg-white text-indigo-700 shadow-sm' : 'bg-white/10 text-indigo-100 hover:bg-white/20'}`}
                                >
                                    Study Materials
                                </button>
                                <button
                                    onClick={() => setChatMode('system')}
                                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md transition-all ${chatMode === 'system' ? 'bg-white text-indigo-700 shadow-sm' : 'bg-white/10 text-indigo-100 hover:bg-white/20'}`}
                                >
                                    System Help
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearChat}
                            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                            title="Clear Chat"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden bg-slate-50/30">
                    {/* Chat Messages */}
                    <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-[14px] leading-relaxed shadow-sm transition-all ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-200'
                                        : 'bg-white text-gray-800 rounded-tl-sm border border-indigo-50 shadow-gray-100'
                                        }`}>
                                        {msg.loading ? (
                                            <div className="flex items-center gap-2 h-7 px-2">
                                                <div className="flex gap-1.5">
                                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="prose prose-sm prose-indigo prose-p:leading-relaxed max-w-none text-current markdown-body">
                                                    {msg.sender === 'user' ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                                                </div>

                                                {msg.sources && msg.sources.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-indigo-50">
                                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                            <BookOpen className="w-3 h-3" /> Sources Found
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {msg.sources.map((source, sIdx) => (
                                                                <div key={sIdx} className="px-2 py-1 bg-indigo-50/50 border border-indigo-100/60 rounded-lg text-[10px] font-bold text-indigo-600 flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                                                    {source.title}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 mt-2 px-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        {msg.sender === 'user' ? 'Student' : 'AAES AI'}
                                    </span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-indigo-50/50 relative">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                                className="relative flex items-end gap-3 group"
                            >
                                <div className="relative flex-1">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend(input);
                                            }
                                        }}
                                        placeholder="Ask a global question (e.g., 'Compare Unit 1 and Unit 2' or 'Summarize OOSE topics')..."
                                        className="w-full bg-slate-50/80 border border-indigo-100/80 rounded-2xl py-4 pl-5 pr-14 text-[14px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none max-h-40 transition-all shadow-inner"
                                        rows={1}
                                        style={{ minHeight: '56px' }}
                                        disabled={isAiLoading}
                                    />
                                    <div className="absolute left-0 -top-6 flex items-center gap-1.5">
                                        <Info className="w-3 h-3 text-indigo-400" />
                                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">
                                            {chatMode === 'study' ? 'AI searches all your notebooks' : 'AI searches system documentation'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isAiLoading}
                                    className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center shrink-0"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </form>
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <AlertCircle className="w-3 h-3 text-gray-400" />
                                <p className="text-[10px] text-gray-400 font-medium">
                                    Context is retrieved from all subject materials associated with your semester.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalRAGChat;
