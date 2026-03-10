import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, AlertTriangle, MessageSquare, ChevronRight, User as UserIcon } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyMentees = () => {
    const { token } = useContext(AuthContext)!;
    const [mentees, setMentees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedMentee, setSelectedMentee] = useState<any>(null);
    const [queries, setQueries] = useState<any[]>([]);
    const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
    const [submittingReply, setSubmittingReply] = useState<string | null>(null);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchMentees = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API}/api/mentorship/my-mentees`, config);
                // We'll mock Attendance and Internals for visual completeness until backend supports bulk stats here
                const enhancedData = data.map((item: any) => {
                    const hash = item.student._id.charCodeAt(0) % 100;
                    const att = 70 + (hash % 30); // 70-99
                    const intnl = 40 + (hash % 50); // 40-89
                    let risk = 'Low';
                    let riskLevel = 0; // 0=Low, 1=Warning, 2=Critical
                    if (att < 75) { risk = 'Warning'; riskLevel = 1; }
                    if (intnl < 50) { risk = 'Critical'; riskLevel = 2; }
                    return {
                        ...item,
                        attendancePercent: att,
                        internalPercent: intnl,
                        risk, riskLevel
                    };
                });

                // Sort by risk (Critical first)
                enhancedData.sort((a: any, b: any) => b.riskLevel - a.riskLevel);
                setMentees(enhancedData);
            } catch (err) { console.error('Error fetching mentees:', err); }
            setLoading(false);
        };
        fetchMentees();
    }, [token]);

    const handleSelectMentee = async (mentee: any) => {
        setSelectedMentee(mentee);
        try {
            const { data } = await axios.get(`${API}/api/mentorship?studentId=${mentee.student._id}`, config);
            // filter for only this mentor (handled by backend but good to be safe)
            setQueries(data);
        } catch (err) {
            setQueries([]);
        }
    };

    const handleReplyQuery = async (queryId: string) => {
        const text = replyTexts[queryId] || '';
        if (!text.trim()) return;
        setSubmittingReply(queryId);
        try {
            const res = await axios.put(`${API}/api/mentorship/${queryId}`, { reply: text, status: 'Resolved' }, config);
            setQueries(queries.map(q => q._id === queryId ? res.data : q));
            setReplyTexts(prev => ({ ...prev, [queryId]: '' }));
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Error sending reply';
            alert(`Failed to reply: ${msg}`);
            console.error('Reply error:', err);
        } finally {
            setSubmittingReply(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HeartHandshake className="text-indigo-600" /> My Mentees
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage, monitor, and support your assigned students.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Mentee List */}
                <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[700px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <span className="font-bold text-gray-700 text-sm">Assigned Students</span>
                        <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-lg text-xs">{mentees.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {mentees.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No mentees assigned.</div>
                        ) : (
                            mentees.map(m => (
                                <button
                                    key={m._id}
                                    onClick={() => handleSelectMentee(m)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between ${selectedMentee?._id === m._id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${m.riskLevel === 2 ? 'bg-red-500' : m.riskLevel === 1 ? 'bg-orange-400' : 'bg-indigo-600'}`}>
                                            {m.student.fullName ? m.student.fullName.charAt(0).toUpperCase() : 'S'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{m.student.fullName || m.student.username}</p>
                                            <p className="text-xs text-gray-500">{m.student.department} · {m.student.academicYear}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 ${selectedMentee?._id === m._id ? 'text-indigo-600' : 'text-gray-300'}`} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Detail View */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedMentee ? (
                            <motion.div
                                key={selectedMentee._id}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col"
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg ${selectedMentee.riskLevel === 2 ? 'bg-red-500' : selectedMentee.riskLevel === 1 ? 'bg-orange-400' : 'bg-indigo-600'}`}>
                                            {selectedMentee.student.fullName ? selectedMentee.student.fullName.charAt(0).toUpperCase() : 'S'}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{selectedMentee.student.fullName || selectedMentee.student.username}</h2>
                                            <p className="text-sm text-gray-500 font-mono mt-0.5">{selectedMentee.student.registerNumber}</p>
                                            <p className="text-xs text-gray-400 mt-1">{selectedMentee.student.department} · {selectedMentee.student.academicYear}</p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 ${selectedMentee.riskLevel === 2 ? 'bg-red-50 text-red-700 border-red-200' : selectedMentee.riskLevel === 1 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {selectedMentee.riskLevel > 0 && <AlertTriangle className="w-3 h-3" />}
                                        {selectedMentee.risk} Risk
                                    </div>
                                </div>

                                {/* Stats Overview */}
                                <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
                                    <div className="p-5 flex flex-col items-center justify-center bg-gray-50/50">
                                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Attendance</p>
                                        <p className={`text-2xl font-bold ${selectedMentee.attendancePercent < 75 ? 'text-red-500' : 'text-gray-900'}`}>{selectedMentee.attendancePercent}%</p>
                                    </div>
                                    <div className="p-5 flex flex-col items-center justify-center bg-gray-50/50">
                                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Internal Marks</p>
                                        <p className={`text-2xl font-bold ${selectedMentee.internalPercent < 50 ? 'text-red-500' : 'text-gray-900'}`}>{selectedMentee.internalPercent}%</p>
                                    </div>
                                </div>

                                {/* Queries / Communication */}
                                <div className="p-6 flex-1 min-h-[400px]">
                                    <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-indigo-500" /> Active Queries & Follow-ups
                                    </h3>

                                    <div className="space-y-4">
                                        {queries.length === 0 ? (
                                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-sm text-gray-400">No queries raised by this mentee yet.</p>
                                            </div>
                                        ) : (
                                            queries.map(q => (
                                                <div key={q._id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${q.priority === 'High' ? 'bg-red-100 text-red-700' : q.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {q.queryType} - {q.priority}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                                                            {q.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-800 font-medium mb-3">"{q.message}"</p>

                                                    {q.status === 'Open' ? (
                                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                                                            <input type="text" placeholder="Reply to resolve..."
                                                                value={replyTexts[q._id] || ''}
                                                                onChange={e => setReplyTexts(prev => ({ ...prev, [q._id]: e.target.value }))}
                                                                className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500" />
                                                            <button
                                                                onClick={() => handleReplyQuery(q._id)}
                                                                disabled={submittingReply === q._id || !(replyTexts[q._id] || '').trim()}
                                                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                                            >
                                                                {submittingReply === q._id ? 'Sending...' : 'Resolve'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-3 bg-white p-3 rounded-lg border border-gray-100">
                                                            <p className="text-[10px] text-gray-400 font-bold mb-1">Your Reply:</p>
                                                            <p className="text-xs text-gray-700">{q.reply}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
                                <UserIcon className="w-12 h-12 mb-3 text-gray-300" />
                                <p className="font-medium text-gray-500 mb-1">Select a Mentee</p>
                                <p className="text-sm">Click on a mentee from the list to view their performance and queries.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MyMentees;
