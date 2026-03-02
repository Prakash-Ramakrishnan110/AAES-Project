import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, User, BookOpen, Clock, Activity, Target, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export interface StaffIntelligence {
    staff: {
        _id: string;
        username: string;
        email: string;
        department: string;
    };
    metrics: {
        totalSubjectsAssigned: number;
        currentSemesterSubjects: number;
        totalStudentsLoad: number;
        pendingEvaluations: number;
        averagePerformance: number;
        passPercentage: number;
        evaluationCompletionRate: number;
    };
}

interface StaffAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: any;
    onAssignSuccess: (message?: string) => void;
}

const StaffAssignmentModal: React.FC<StaffAssignmentModalProps> = ({ isOpen, onClose, subject, onAssignSuccess }) => {
    const { token } = useContext(AuthContext)!;
    const [staffList, setStaffList] = useState<StaffIntelligence[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffIntelligence | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && subject) {
            fetchEligibleStaff();
            setSelectedStaff(null);
            setShowConfirm(false);
            setError('');
        }
    }, [isOpen, subject]);

    const fetchEligibleStaff = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/subjects/${subject._id}/eligible-staff`, config);
            // Sort by simple heuristic: least subjects assigned first
            const sorted = data.sort((a: StaffIntelligence, b: StaffIntelligence) => a.metrics.totalSubjectsAssigned - b.metrics.totalSubjectsAssigned);
            setStaffList(sorted);
        } catch (err: any) {
            setError('Failed to load eligible staff.');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedStaff) return;
        setAssigning(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`http://localhost:5000/api/subjects/${subject._id}/assign`, { staffId: selectedStaff.staff._id }, config);

            // Handle 202 Accepted (Pending Request) vs 200 OK (Direct Assignment)
            if (response.status === 202) {
                onAssignSuccess(response.data.message || 'Assignment request sent to primary HOD.');
            } else {
                onAssignSuccess('Staff assigned successfully!');
            }

            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error assigning staff');
            setShowConfirm(false);
        } finally {
            setAssigning(false);
        }
    };

    const getWorkloadColor = (count: number) => {
        if (count <= 3) return 'bg-green-100 text-green-800 border-green-200';
        if (count <= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    const isHighLoad = (staff: StaffIntelligence) => {
        return staff.metrics.totalSubjectsAssigned > 5 || staff.metrics.pendingEvaluations > 30;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-indigo-600/90 backdrop-blur p-6 flex justify-between items-center shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <User size={24} /> Assign Staff
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                Select faculty for {subject?.name} ({subject?.code})
                            </p>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-grow bg-transparent">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex flex-col justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                <p className="mt-4 text-gray-500 font-medium animate-pulse">Analyzing staff capacity & performance metrics...</p>
                            </div>
                        ) : showConfirm && selectedStaff ? (
                            <div className="py-8 px-4 text-center">
                                <AlertTriangle size={64} className="mx-auto text-yellow-500 mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Assignment</h3>
                                <p className="text-gray-600 mb-6">
                                    You are about to assign <span className="font-bold">{selectedStaff.staff.username}</span> to <span className="font-bold">{subject?.name}</span>.
                                </p>

                                {isHighLoad(selectedStaff) && (
                                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl inline-block text-left">
                                        <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
                                            <ShieldAlert size={20} /> High Teaching Load Detected
                                        </div>
                                        <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                                            {selectedStaff.metrics.totalSubjectsAssigned > 5 && <li>Staff already handles {selectedStaff.metrics.totalSubjectsAssigned} subjects.</li>}
                                            {selectedStaff.metrics.pendingEvaluations > 30 && <li>Staff has {selectedStaff.metrics.pendingEvaluations} pending evaluations.</li>}
                                        </ul>
                                        <p className="text-xs text-red-600 mt-2 font-medium">Assignment is still permitted, but advisory limits are exceeded.</p>
                                    </div>
                                )}

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAssign}
                                        disabled={assigning}
                                        className={`px-6 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2
                                            ${assigning ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    >
                                        {assigning ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <CheckCircle size={20} />}
                                        {assigning ? 'Assigning...' : 'Confirm Assignment'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {staffList.map((item, index) => {
                                    const bestCandidate = index === 0 && item.metrics.totalSubjectsAssigned < 4;
                                    const workloadColor = getWorkloadColor(item.metrics.totalSubjectsAssigned);

                                    return (
                                        <div
                                            key={item.staff._id}
                                            className={`bg-white/80 backdrop-blur-md rounded-xl border-2 transition-all p-5 hover:shadow-xl flex flex-col h-full
                                                ${selectedStaff?.staff._id === item.staff._id ? 'border-indigo-500 shadow-md transform scale-[1.02] bg-white' : 'border-gray-100/50 hover:border-indigo-200'}`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                        {item.staff.username}
                                                        {bestCandidate && <span title="Recommended based on low workload" className="text-yellow-500"><Target size={16} /></span>}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">{item.staff.department}</p>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-xs font-bold border ${workloadColor} flex items-center gap-1`}>
                                                    <BookOpen size={12} /> {item.metrics.totalSubjectsAssigned} Subjects
                                                </div>
                                            </div>

                                            <div className="space-y-3 flex-grow my-4 pb-4 border-b border-gray-100">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 flex items-center gap-1"><User size={14} /> Total Students:</span>
                                                    <span className="font-semibold text-gray-800">{item.metrics.totalStudentsLoad}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 flex items-center gap-1"><Clock size={14} /> Pending Evals:</span>
                                                    <span className={`font-semibold ${item.metrics.pendingEvaluations > 20 ? 'text-red-600' : 'text-gray-800'}`}>
                                                        {item.metrics.pendingEvaluations}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 flex items-center gap-1"><Activity size={14} /> Avg Performance:</span>
                                                    <span className="font-semibold text-gray-800">{item.metrics.averagePerformance.toFixed(1)}%</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedStaff(item);
                                                    setShowConfirm(true);
                                                }}
                                                className={`w-full py-2.5 rounded-lg font-semibold transition-colors mt-auto
                                                    ${selectedStaff?.staff._id === item.staff._id
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'}`}
                                            >
                                                Select Stack
                                            </button>
                                        </div>
                                    );
                                })}

                                {staffList.length === 0 && !loading && (
                                    <div className="col-span-full py-12 text-center text-gray-500">
                                        <User size={48} className="mx-auto mb-4 opacity-30" />
                                        <p>No eligible staff found for this department.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default StaffAssignmentModal;
