import { X, User, CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentRecord {
    student: {
        _id: string;
        username: string;
        fullName?: string;
        registerNumber?: string;
        profileImage?: string;
    };
    status: 'Present' | 'Absent' | 'Leave' | 'OD';
    reason: string;
}

interface MorningAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionData: {
        date: string;
        academicYear: string;
        department: string;
        records: StudentRecord[];
    } | null;
}

const MorningAttendanceModal = ({ isOpen, onClose, sessionData }: MorningAttendanceModalProps) => {
    if (!sessionData) return null;

    const presentCount = sessionData.records.filter(r => r.status === 'Present').length;
    const absentCount = sessionData.records.filter(r => r.status === 'Absent').length;
    const odCount = sessionData.records.filter(r => r.status === 'OD').length;
    const leaveCount = sessionData.records.filter(r => r.status === 'Leave').length;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-600" />
                                    Morning Roll Call Details
                                </h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {new Date(sessionData.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                    </p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {sessionData.academicYear} • {sessionData.department}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Summary Bar */}
                        <div className="grid grid-cols-4 gap-4 p-6 bg-white border-b border-slate-50">
                            {[
                                { label: 'Present', value: presentCount, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                                { label: 'Absent', value: absentCount, color: 'text-rose-600', bg: 'bg-rose-50', icon: XCircle },
                                { label: 'On Duty', value: odCount, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Clock },
                                { label: 'Leave', value: leaveCount, color: 'text-amber-600', bg: 'bg-amber-50', icon: Info },
                            ].map((stat) => (
                                <div key={stat.label} className={`${stat.bg} p-4 rounded-2xl border border-white flex flex-col items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color} mb-1`} />
                                    <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color}`}>{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Student List */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sessionData.records.map((record) => (
                                    <div 
                                        key={record.student._id}
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all"
                                    >
                                        <div className="relative">
                                            {record.student.profileImage ? (
                                                <img 
                                                    src={record.student.profileImage} 
                                                    alt={record.student.fullName}
                                                    className="w-12 h-12 rounded-xl object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <User className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                                                record.status === 'Present' ? 'bg-emerald-500' :
                                                record.status === 'Absent' ? 'bg-rose-500' :
                                                record.status === 'OD' ? 'bg-indigo-500' : 'bg-amber-500'
                                            }`}>
                                                {record.status === 'Present' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <XCircle className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                {record.student.fullName || record.student.username}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {record.student.registerNumber || 'No Reg No.'}
                                            </p>
                                            {record.reason && (
                                                <p className="text-[10px] font-medium text-slate-500 mt-1 italic">
                                                    "{record.reason}"
                                                </p>
                                            )}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            record.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            record.status === 'Absent' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            record.status === 'OD' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {record.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/50">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Close View
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MorningAttendanceModal;
