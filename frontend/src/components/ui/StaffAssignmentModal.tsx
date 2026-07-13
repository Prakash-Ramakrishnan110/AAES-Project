import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { X, CheckCircle, AlertTriangle, User, Search, Users, ChevronRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface StaffIntelligence {
    staff: {
        _id: string;
        username: string;
        fullName?: string;
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
    const [searchTerm, setSearchTerm] = useState('');
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
            const { data } = await axios.get(`${API}/api/subjects/${subject._id}/eligible-staff`, config);
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
            const response = await axios.put(`${API}/api/subjects/${subject._id}/assign`, { staffId: selectedStaff.staff._id }, config);

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

    const isHighLoad = (staff: StaffIntelligence) => {
        return staff.metrics.totalSubjectsAssigned > 5 || staff.metrics.pendingEvaluations > 30;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all font-sans antialiased">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[550px] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                
                {/* Small Header */}
                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow shadow-indigo-100">
                            <Users size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Assign Faculty</h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{subject?.code}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-300 hover:text-slate-900 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex flex-col justify-center items-center py-12">
                            <div className="w-6 h-6 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-3 underline decoration-indigo-100">Syncing</p>
                        </div>
                    ) : showConfirm && selectedStaff ? (
                        <div className="flex-1 p-6 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                                    <User size={20} />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1 leading-tight">Assign {selectedStaff.staff.fullName || selectedStaff.staff.username}?</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 px-4">Subject Node: {subject?.name}</p>

                                {isHighLoad(selectedStaff) && (
                                    <div className="w-full bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center gap-3 text-left mb-6">
                                        <AlertTriangle size={14} className="text-rose-600" />
                                        <div>
                                            <p className="text-[8px] font-black text-rose-700 uppercase tracking-widest leading-none mb-1 underline decoration-rose-200">Load Alert</p>
                                            <p className="text-[10px] text-rose-600 font-bold leading-tight">Units: {selectedStaff.metrics.totalSubjectsAssigned} | Backlog: {selectedStaff.metrics.pendingEvaluations}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 mt-auto">
                                <button
                                    onClick={handleAssign}
                                    disabled={assigning}
                                    className="w-full h-11 bg-indigo-600 hover:bg-slate-900 text-white rounded-[10px] font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                >
                                    {assigning ? 'Assigning...' : 'Assign Faculty'}
                                    <CheckCircle size={14} />
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="w-full p-2 text-slate-400 font-bold hover:text-slate-600 text-[10px] uppercase tracking-widest transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="px-5 py-3 border-b border-slate-50 shrink-0 bg-slate-50/20 backdrop-blur-md">
                                <div className="relative group">
                                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                    <input 
                                        type="text"
                                        placeholder="Quick Search Registry..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-transparent pl-7 pr-4 py-1 text-xs font-bold text-slate-700 placeholder:text-slate-300 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-1 py-3 custom-scrollbar">
                                {Object.entries(
                                    staffList
                                        .filter(item => 
                                            (item.staff.fullName || item.staff.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            item.staff.username.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .reduce((groups, item) => {
                                            const dept = item.staff.department || 'GLOBAL STAFF';
                                            if (!groups[dept]) groups[dept] = [];
                                            groups[dept].push(item);
                                            return groups;
                                        }, {} as Record<string, StaffIntelligence[]>)
                                ).map(([dept, members]) => (
                                    <div key={dept} className="mb-4 last:mb-0">
                                        <div className="px-4 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            {dept}
                                            <div className="h-[1px] flex-1 bg-slate-50" />
                                        </div>
                                        <div className="space-y-0.5">
                                            {members.map((item) => (
                                                <div
                                                    key={item.staff._id}
                                                    onClick={() => {
                                                        setSelectedStaff(item);
                                                        setShowConfirm(true);
                                                    }}
                                                    className="group cursor-pointer p-3 rounded-xl flex items-center justify-between hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100/30"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors border border-transparent group-hover:border-indigo-100 shadow-inner">
                                                            <User size={14} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[12px] font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">{item.staff.fullName || item.staff.username}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mt-1">ID: {item.staff.username}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 pr-1">
                                                        <div className="text-right">
                                                            <p className="text-[7px] font-black text-slate-200 uppercase tracking-widest mb-0.5">Load</p>
                                                            <p className={`text-[11px] font-black leading-none ${item.metrics.totalSubjectsAssigned > 4 ? 'text-rose-500' : 'text-slate-800'}`}>
                                                                {item.metrics.totalSubjectsAssigned} Units
                                                            </p>
                                                        </div>
                                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {error && (
                    <div className="px-4 py-2 bg-rose-50 text-rose-700 text-[8px] font-black flex items-center gap-2 border-t border-rose-100 uppercase tracking-widest shrink-0">
                        <AlertTriangle size={12} /> {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffAssignmentModal;
