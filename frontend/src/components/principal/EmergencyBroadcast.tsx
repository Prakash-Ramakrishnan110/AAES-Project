import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface EmergencyBroadcastProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EmergencyBroadcast: React.FC<EmergencyBroadcastProps> = ({ isOpen, onClose, token }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setLoading(true);
        try {
            await axios.post(
                `${API}/api/notifications/emergency`,
                { title, message },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                setTitle('');
                setMessage('');
            }, 2000);
        } catch (err) {
            console.error('Broadcast failed', err);
            alert('Emergency broadcast failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-red-600 px-6 py-6 text-white text-center relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-widest italic">Institutional Emergency Broadcast</h2>
                            <p className="text-red-100 text-xs mt-2 font-medium">This alert will bypass all user filters and appear as a high-priority notification to everyone.</p>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            {success ? (
                                <div className="py-10 text-center space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Broadcast Sent Successfully</h3>
                                    <p className="text-gray-500 text-sm">Every user across the institution has been notified.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleBroadcast} className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Alert Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Campus Lockdown / Urgent Faculty Meeting"
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-red-500 rounded-2xl outline-none text-sm font-semibold transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Broadcast Message</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={4}
                                            placeholder="Enter the detailed instruction or alert message..."
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-red-500 rounded-2xl outline-none text-sm font-semibold transition-all resize-none"
                                            required
                                        />
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                                            <strong>Warning:</strong> Use this feature only for critical institutional alerts. Excessive use may lead to notification fatigue among students and faculty.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest mt-4"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                                        Initialize Broadcast
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EmergencyBroadcast;
