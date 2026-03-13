import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Bell, CheckCircle, Info, AlertTriangle, Megaphone, Send, X, Users } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    Info: {
        icon: <Info className="w-4 h-4" />,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
    },
    Success: {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200'
    },
    Warning: {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200'
    },
    Alert: {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
    },
    Grading: {
        icon: <Megaphone className="w-4 h-4" />,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200'
    },
};

const StaffCommunications = () => {
    const { token, user } = useContext(AuthContext)!;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [showCompose, setShowCompose] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Compose form state
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        targetGroup: 'all_students'
    });

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const canSend = user && ['admin', 'hod', 'staff', 'principal'].includes(user.role);

    useEffect(() => {
        fetchNotifications();
    }, [token]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API}/api/notifications`, config);
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.post(`${API}/api/notifications/send`, formData, config);
            setSuccess('Announcement sent successfully!');
            setFormData({ title: '', message: '', targetGroup: 'all_students' });
            fetchNotifications();

            // Close modal after delay on success
            setTimeout(() => {
                setShowCompose(false);
                setSuccess(null);
            }, 2000);
        } catch (err: any) {
            console.error('Failed to send announcement:', err);
            setError(err.response?.data?.message || 'Failed to send announcement. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.put(`${API}/api/notifications/read-all`, {}, config);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const markRead = async (id: string) => {
        try {
            await axios.put(`${API}/api/notifications/${id}/read`, {}, config);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const displayed = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Bell className="w-7 h-7 text-indigo-600" />
                        Communications
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        All notifications and system messages for your account
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {canSend && (
                        <button
                            onClick={() => setShowCompose(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-all text-sm"
                        >
                            <Send className="w-4 h-4" />
                            Compose
                        </button>
                    )}
                    {/* Filter Tabs */}
                    <div className="flex bg-gray-100 rounded-xl p-1 text-sm font-medium">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-1.5 rounded-lg transition-all ${filter === 'unread' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Unread {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full">{unreadCount}</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mark All Read */}
            {unreadCount > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={markAllRead}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center gap-1"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Mark all as read
                    </button>
                </div>
            )}

            {/* Notifications List */}
            {displayed.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Bell className="w-14 h-14 mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium text-lg">
                        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                    <p className="text-gray-300 text-sm mt-1">Check back later for updates</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map((notif) => {
                        const cfg = typeConfig[notif.type] || typeConfig['Info'];
                        return (
                            <div
                                key={notif._id}
                                onClick={() => !notif.read && markRead(notif._id)}
                                className={`
                                    flex gap-4 p-5 rounded-2xl border transition-all cursor-pointer group
                                    ${notif.read
                                        ? 'bg-white border-gray-100 opacity-70 hover:opacity-100'
                                        : `${cfg.bg} ${cfg.border} shadow-sm hover:shadow-md hover:-translate-y-0.5`
                                    }
                                `}
                            >
                                {/* Icon */}
                                <div className={`flex-shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color} border ${cfg.border} shadow-sm`}>
                                    {cfg.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`font-bold text-base ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                            {notif.title}
                                        </p>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {!notif.read && (
                                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                                            )}
                                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                                {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <p className={`text-sm mt-1 mb-1 leading-relaxed whitespace-pre-wrap ${notif.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                        {notif.message}
                                    </p>
                                    {notif.link && (
                                        <a
                                            href={notif.link}
                                            onClick={e => e.stopPropagation()}
                                            className={`inline-flex items-center gap-1 text-xs font-bold mt-2 ${cfg.color} hover:underline transition-all`}
                                        >
                                            View Details →
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Compose Modal */}
            {showCompose && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Send className="w-5 h-5 text-indigo-600" />
                                Send Announcement
                            </h2>
                            <button
                                onClick={() => setShowCompose(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSend} className="p-6 space-y-4">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-in slide-in-from-top-2">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm animate-in slide-in-from-top-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="font-medium">{success}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    Target Group
                                </label>
                                <select
                                    value={formData.targetGroup}
                                    onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                                    required
                                >
                                    <option value="all_students">All Students {user?.role !== 'admin' && `(Dept: ${user?.department})`}</option>
                                    <option value="all_staff">All Staff {user?.role !== 'admin' && `(Dept: ${user?.department})`}</option>
                                    <option value="all_department">Everyone in Department</option>
                                    <option value="class_advisors">Class Advisors Only</option>
                                    {(user?.role === 'admin' || user?.role === 'principal') && (
                                        <option value="all_hods">All HODs</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subject / Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter circular title..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Message Content</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Type your announcement here..."
                                    rows={5}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                                    required
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCompose(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffCommunications;
