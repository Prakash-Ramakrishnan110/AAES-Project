import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { MessageSquare, Search, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface MentorshipNote {
    _id: string;
    student?: {
        fullName?: string;
        username: string;
        registerNumber?: string;
    };
    content: string;
    noteType: string;
    createdAt: string;
    advisor?: {
        username: string;
    };
}

const AdvisorNotes = () => {
    const { token } = useContext(AuthContext)!;
    const [notes, setNotes] = useState<MentorshipNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchNotes = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/advisor/all-notes`, config);
            setNotes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const filteredNotes = notes.filter(n =>
        (n.student?.fullName || n.student?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const noteTypeStyle = (type: string) => {
        if (type === 'Counseling Done') return 'bg-green-100 text-green-700 border-green-200';
        if (type === 'Parent Contacted') return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-gray-100 text-gray-600 border-gray-200';
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mentorship Notes</h1>
                    <p className="text-gray-500 text-sm">Consolidated record of all mentorship and counseling logs for your class.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by student or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredNotes.length === 0 ? (
                    <div className="bg-gray-50 rounded-3xl border border-dashed border-gray-200 p-16 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No mentorship logs found for this search.</p>
                    </div>
                ) : filteredNotes.map((note, idx) => (
                    <motion.div
                        key={note._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                        {(note.student?.fullName || note.student?.username || 'U').charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{note.student?.fullName || note.student?.username}</h3>
                                        <p className="text-[10px] text-gray-400 font-medium">Reg No: {note.student?.registerNumber || 'N/A'}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ml-2 ${noteTypeStyle(note.noteType)}`}>
                                        {note.noteType}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed pl-11">{note.content}</p>
                            </div>
                            <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-50 pt-3 md:pt-0 md:pl-5">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[10px] font-medium">{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-indigo-400">
                                    <User className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">{note.advisor?.username || 'Advisor'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdvisorNotes;
