import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, Clock, MessageSquare, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface TimelineEvent {
    type: 'submission' | 'mentorship' | 'attendance';
    date: string;
    title: string;
    category?: string;
    status?: string;
    marks?: number;
    maxMarks?: number;
    content?: string;
    advisor?: string;
    feedback?: string;
}

interface StudentTimelineProps {
    studentId: string;
    token: string;
}

const StudentTimeline: React.FC<StudentTimelineProps> = ({ studentId, token }) => {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/advisor/student/${studentId}/timeline`, config);
                setEvents(data);
            } catch (err) {
                console.error("Failed to fetch timeline", err);
            } finally {
                setLoading(false);
            }
        };

        if (studentId && token) fetchTimeline();
    }, [studentId, token]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'submission': return <BookOpen className="w-4 h-4 text-blue-500" />;
            case 'mentorship': return <MessageSquare className="w-4 h-4 text-purple-500" />;
            case 'attendance': return <Calendar className="w-4 h-4 text-orange-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status?: string) => {
        if (!status) return 'text-gray-500';
        switch (status.toLowerCase()) {
            case 'evaluated':
            case 'graded':
            case 'present': return 'text-green-600';
            case 'pending':
            case 'submitted': return 'text-blue-600';
            case 'absent': return 'text-red-600';
            default: return 'text-gray-500';
        }
    };

    if (loading) return <div className="py-8 text-center text-gray-400 text-sm animate-pulse">Loading timeline activities...</div>;

    if (events.length === 0) return (
        <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-4">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No activity recorded for this period</p>
        </div>
    );

    return (
        <div className="mt-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-indigo-600" /> Academic Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                {events.map((event, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        className="relative"
                    >
                        {/* Dot */}
                        <div className="absolute -left-[23px] top-1 w-5 h-5 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center z-10 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        </div>

                        {/* Content Card */}
                        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md ${expandedEvent === idx ? 'ring-1 ring-indigo-500 border-transparent' : ''}`}>
                            <div
                                className="p-4 cursor-pointer flex items-center gap-4"
                                onClick={() => setExpandedEvent(expandedEvent === idx ? null : idx)}
                            >
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    {getIcon(event.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <h4 className="font-bold text-gray-900 text-sm">{event.title}</h4>
                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                            {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 ${getStatusColor(event.status)} uppercase tracking-wider`}>
                                            {event.status || event.type}
                                        </span>
                                        {event.marks !== undefined && (
                                            <span className="text-[10px] font-bold text-indigo-600">
                                                {event.marks}/{event.maxMarks} Marks
                                            </span>
                                        )}
                                        {event.advisor && (
                                            <span className="text-[10px] text-gray-500 font-semibold">• {event.advisor}</span>
                                        )}
                                    </div>
                                </div>
                                {expandedEvent === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>

                            {/* Expanded Details */}
                            {expandedEvent === idx && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="px-4 pb-4 pt-1 border-t border-gray-50 bg-gray-50/30"
                                >
                                    {event.content && (
                                        <p className="text-xs text-gray-700 leading-relaxed font-medium bg-white p-3 rounded-lg border border-gray-100">
                                            {event.content}
                                        </p>
                                    )}
                                    {event.feedback && (
                                        <div className="mt-2">
                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 italic">Feedback</p>
                                            <p className="text-xs text-indigo-700 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                                "{event.feedback}"
                                            </p>
                                        </div>
                                    )}
                                    {!event.content && !event.feedback && (
                                        <p className="text-[10px] text-gray-400 italic">No additional details recorded for this activity.</p>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StudentTimeline;
