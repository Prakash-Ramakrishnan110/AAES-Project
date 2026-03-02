import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { Users, FileText, CheckCircle, ChevronRight, Check } from 'lucide-react';


const StaffCCM = () => {
    const { token } = useContext(AuthContext)!;
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // CCM State
    const [ccms, setCCMs] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail'>('list');

    const [ccmData, setCCMData] = useState({
        meetingDate: '',
        category: 'Academic',
        agenda: '',
        notes: '',
        decisions: '',
        studentReps: '',
        studentRepsPresent: 0,
        absentCount: 0,
    });
    const [ccmFile, setCcmFile] = useState<File | null>(null);
    const [isSubmittingCCM, setIsSubmittingCCM] = useState(false);

    // View CCM State
    const [selectedCCM, setSelectedCCM] = useState<any>(null);
    const [newActionItem, setNewActionItem] = useState({ task: '', assignedTo: '', targetDate: '' });
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);

    const API = 'http://localhost:5000';

    const fetchStatsAndCCMs = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const statsRes = await axios.get(`${API}/api/advisor/my-class-stats`, config);
            setStats(statsRes.data);

            if (statsRes.data?.department && statsRes.data?.academicYear) {
                const ccmRes = await axios.get(`${API}/api/ccm?department=${statsRes.data.department}&academicYear=${statsRes.data.academicYear}`, config);
                setCCMs(ccmRes.data);
            }
        } catch (err) {
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchStatsAndCCMs();
    }, [token]);

    const handleCreateCCM = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingCCM(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
            const formData = new FormData();
            formData.append('academicYear', stats.academicYear);
            formData.append('meetingDate', ccmData.meetingDate);
            formData.append('category', ccmData.category);
            formData.append('agenda', ccmData.agenda);
            formData.append('notes', ccmData.notes);
            formData.append('decisions', ccmData.decisions);
            formData.append('studentReps', ccmData.studentReps);
            formData.append('studentRepsPresent', ccmData.studentRepsPresent.toString());
            formData.append('absentCount', ccmData.absentCount.toString());
            if (ccmFile) formData.append('minutesPDF', ccmFile);

            await axios.post(`${API}/api/ccm`, formData, config);
            setViewMode('list');
            setCCMData({ meetingDate: '', category: 'Academic', agenda: '', notes: '', decisions: '', studentReps: '', studentRepsPresent: 0, absentCount: 0 });
            setCcmFile(null);
            fetchStatsAndCCMs();
            alert("CCM Created Successfully");
        } catch (err: any) {
            alert(err.response?.data?.message || "Error creating CCM");
        } finally {
            setIsSubmittingCCM(false);
        }
    };

    const handleAddActionItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCCM) return;
        setIsSubmittingAction(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(`${API}/api/ccm/${selectedCCM._id}/actions`, newActionItem, config);
            const updatedCCM = res.data;
            setSelectedCCM(updatedCCM);
            setCCMs(ccms.map(c => c._id === updatedCCM._id ? updatedCCM : c));
            setNewActionItem({ task: '', assignedTo: '', targetDate: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || "Error adding action item");
        } finally {
            setIsSubmittingAction(false);
        }
    };

    const handleUpdateActionStatus = async (ccmId: string, actionId: string, newStatus: string) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(`${API}/api/ccm/${ccmId}/actions/${actionId}`, { status: newStatus }, config);
            const updatedCCM = res.data;
            if (selectedCCM && selectedCCM._id === ccmId) setSelectedCCM(updatedCCM);
            setCCMs(ccms.map(c => c._id === updatedCCM._id ? updatedCCM : c));
        } catch (err) {
            console.error("Error updating action status", err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!stats) return (
        <div className="flex flex-col items-center justify-center p-16 text-center h-[70vh]">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Assigned as Class Advisor</h2>
            <p className="text-gray-500 max-w-md text-sm">
                You haven't been assigned as a Class Advisor for any academic year yet.
                CCM features are restricted to active advisors.
            </p>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Class Committee Meetings (CCM)</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">
                        {stats.department} · {stats.academicYear} · Sem {stats.semester}
                    </p>
                </div>
                {viewMode === 'list' && (
                    <button onClick={() => setViewMode('create')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all text-sm flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> Log New Meeting
                    </button>
                )}
                {viewMode !== 'list' && (
                    <button onClick={() => { setViewMode('list'); setSelectedCCM(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-all text-sm">
                        &larr; Back to CCM List
                    </button>
                )}
            </div>

            {viewMode === 'list' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 max-h-[70vh] overflow-y-auto">
                    {ccms.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="w-16 h-16 text-indigo-100 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-800">No CCM Records</h3>
                            <p className="text-gray-500 text-sm mt-2">Log your first class committee meeting.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {ccms.map(ccm => (
                                <div key={ccm._id} onClick={() => { setSelectedCCM(ccm); setViewMode('detail'); }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:border-indigo-400 transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full text-xs uppercase">{ccm.category}</span>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{new Date(ccm.meetingDate).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 mb-2 line-clamp-1">{ccm.agenda}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{ccm.notes}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{ccm.actionItems?.length || 0} Action Items</span>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'create' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-10 max-w-4xl mx-auto">
                    <div className="mb-8 border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-bold text-gray-800">Log New Class Committee Meeting</h2>
                        <p className="text-sm text-gray-500 mt-1">Record minutes, decisions, and action items from the meeting.</p>
                    </div>
                    <form onSubmit={handleCreateCCM} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Meeting Date</label>
                                <input type="date" required value={ccmData.meetingDate} onChange={e => setCCMData({ ...ccmData, meetingDate: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 hover:bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select value={ccmData.category} onChange={e => setCCMData({ ...ccmData, category: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 hover:bg-white">
                                    <option value="Academic">Academic</option>
                                    <option value="Disciplinary">Disciplinary</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Student Reps List</label>
                                <input type="text" placeholder="e.g. 717821F201, 717821F202" value={ccmData.studentReps} onChange={e => setCCMData({ ...ccmData, studentReps: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 hover:bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reps Present</label>
                                <input type="number" min="0" required value={ccmData.studentRepsPresent} onChange={e => setCCMData({ ...ccmData, studentRepsPresent: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 hover:bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Absent Count</label>
                                <input type="number" min="0" required value={ccmData.absentCount} onChange={e => setCCMData({ ...ccmData, absentCount: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 hover:bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Agenda</label>
                            <textarea required value={ccmData.agenda} onChange={e => setCCMData({ ...ccmData, agenda: e.target.value })} rows={2} placeholder="Main topics discussed..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 hover:bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Meeting Notes / Minutes</label>
                            <textarea required value={ccmData.notes} onChange={e => setCCMData({ ...ccmData, notes: e.target.value })} rows={4} placeholder="Detailed minutes of the meeting..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 hover:bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Decisions Made</label>
                            <textarea required value={ccmData.decisions} onChange={e => setCCMData({ ...ccmData, decisions: e.target.value })} rows={3} placeholder="Conclusions and decisions agreed upon..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 hover:bg-white" />
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
                            <button type="button" onClick={() => setViewMode('list')} className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmittingCCM} className="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50">
                                {isSubmittingCCM ? 'Saving...' : 'Save Meeting Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {viewMode === 'detail' && selectedCCM && (
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Detail Info */}
                    <div className="lg:w-2/3 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                            <div>
                                <span className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full text-xs uppercase mb-3 inline-block">{selectedCCM.category}</span>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedCCM.agenda}</h2>
                            </div>
                            <div className="text-right bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date</h4>
                                <p className="font-bold text-gray-900 text-sm">{new Date(selectedCCM.meetingDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Student Reps List</h4>
                                    <p className="text-sm text-gray-800 font-medium">{selectedCCM.studentReps || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Attendance</h4>
                                    <p className="text-sm text-gray-800 font-medium">{selectedCCM.studentRepsPresent} Present, {selectedCCM.absentCount} Absent</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Minutes / Notes</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">{selectedCCM.notes}</p>
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Decisions</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">{selectedCCM.decisions}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Action Items Tracker */}
                    <div className="lg:w-1/3 flex flex-col gap-6">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden flex flex-col flex-1">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                                <CheckCircle className="w-5 h-5 text-emerald-500" /> Action Items Dashboard
                            </h4>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[400px]">
                                {(!selectedCCM.actionItems || selectedCCM.actionItems.length === 0) ? (
                                    <div className="text-center py-10 opacity-50">
                                        <Check className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-gray-600">No Action Items</p>
                                        <p className="text-xs text-gray-400">Add tasks delegated during the meeting.</p>
                                    </div>
                                ) : (
                                    selectedCCM.actionItems.map((action: any) => (
                                        <div key={action._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3 group transition-all hover:shadow-md hover:bg-white hover:border-indigo-100">
                                            <div className="flex items-start justify-between">
                                                <div className="pr-4">
                                                    <p className="font-bold text-sm text-gray-800 leading-snug">{action.task}</p>
                                                    <div className="flex gap-4 mt-2 text-[10px] text-gray-500 font-bold bg-white inline-flex px-2 py-1 rounded-md border border-gray-100">
                                                        <span>To: {action.assignedTo}</span>
                                                        {action.targetDate && <span>Due: {new Date(action.targetDate).toLocaleDateString()}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-right">
                                                <select
                                                    value={action.status}
                                                    onChange={(e) => handleUpdateActionStatus(selectedCCM._id, action._id, e.target.value)}
                                                    className={`text-[10px] font-bold rounded-full px-3 py-1.5 outline-none appearance-none cursor-pointer border ${action.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : action.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : action.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Overdue">Overdue</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-indigo-50/50 rounded-3xl border border-indigo-100 p-6">
                            <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Check className="w-4 h-4" /> Add Action Item</h5>
                            <form onSubmit={handleAddActionItem} className="flex flex-col gap-3">
                                <input type="text" placeholder="Task description..." required value={newActionItem.task} onChange={e => setNewActionItem({ ...newActionItem, task: e.target.value })} className="w-full text-sm px-4 py-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                                <div className="flex gap-3">
                                    <input type="text" placeholder="Assigned To" required value={newActionItem.assignedTo} onChange={e => setNewActionItem({ ...newActionItem, assignedTo: e.target.value })} className="w-1/2 text-sm px-4 py-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                                    <input type="date" value={newActionItem.targetDate} onChange={e => setNewActionItem({ ...newActionItem, targetDate: e.target.value })} className="w-1/2 text-sm px-4 py-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-gray-500" />
                                </div>
                                <button type="submit" disabled={isSubmittingAction || !newActionItem.task} className="w-full mt-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200">
                                    {isSubmittingAction ? 'Adding Task...' : 'Add Task'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffCCM;
