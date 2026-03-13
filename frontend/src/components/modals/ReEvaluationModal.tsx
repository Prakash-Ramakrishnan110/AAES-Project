import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Send, X } from 'lucide-react';
import { Button } from '../ui/Button';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ReEvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    submission: {
        _id: string;
        assignment: {
            _id: string;
            title: string;
            subject: string;
        };
        marks: number;
    };
    onSuccess?: () => void;
}

const ReEvaluationModal: React.FC<ReEvaluationModalProps> = ({ isOpen, onClose, submission, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return setError('Please provide a reason for re-evaluation');

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const assignmentId = typeof submission.assignment === 'string' ? submission.assignment : submission.assignment._id;
            const subjectObj = (submission.assignment as any).subject;
            const subjectId = typeof subjectObj === 'string' ? subjectObj : subjectObj?._id;

            await axios.post(`${API}/api/re-evaluation`, {
                submissionId: submission._id,
                assignmentId: assignmentId,
                subjectId: subjectId,
                originalScore: submission.marks,
                reason: reason.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReason('');
            if (onSuccess) onSuccess();
            onClose();
            alert('Re-evaluation request submitted successfully.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error submitting request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 border-none">Request Re-evaluation</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{submission.assignment.title}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-indigo-900">Current Score: {submission.marks}</p>
                                    <p className="text-xs text-indigo-700 mt-1">
                                        Re-evaluation requests should be made within 48 hours of marks publication.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Reason for Request</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Explain why you are requesting a re-evaluation (e.g., missed mark, calculation error)..."
                                    className="w-full rounded-2xl border-gray-200 border p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[120px] resize-none"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-xl border border-red-100 italic">
                                    {error}
                                </p>
                            )}

                            <div className="flex space-x-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 rounded-xl"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-lg"
                                    isLoading={loading}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Request
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReEvaluationModal;
