import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Users, Search, UserCheck, RefreshCw, ChevronRight, AlertTriangle } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MentorAssignment = () => {
    const { token, user } = useContext(AuthContext)!;
    const toast = useToast();

    const [students, setStudents] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [notAdvisor, setNotAdvisor] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedMentorId, setSelectedMentorId] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        if (token) {
            fetchStaff();
            fetchStudents();
        }
    }, [token]);

    const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/mentorship/staff`, config);
            setStaffList(data);
        } catch {
            toast.error('Could not load staff list. Check if backend is running.');
        } finally {
            setLoadingStaff(false);
        }
    };

    const fetchStudents = async () => {
        setLoadingStudents(true);
        setNotAdvisor(false);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (user?.role === 'hod' || user?.role === 'admin') {
                // HOD/Admin: fetch all students from their department
                const { data } = await axios.get(
                    `${API}/api/users?role=student&status=active`,
                    config
                );
                setStudents(data);
            } else {
                // Staff (Class Advisor): use the advisor students endpoint
                const { data } = await axios.get(`${API}/api/advisor/students`, config);
                setStudents(data);
            }
        } catch (err: any) {
            if (err.response?.status === 403) {
                setNotAdvisor(true);
                setStudents([]);
            } else {
                toast.error('Failed to load students.');
            }
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filtered.map((s: any) => s._id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleToggle = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleAssign = () => {
        if (!selectedMentorId) { toast.warning('Please select a mentor first.'); return; }
        if (selectedIds.size === 0) { toast.warning('Please select at least one student.'); return; }
        setConfirmOpen(true);
    };

    const confirmAssign = async () => {
        setIsAssigning(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API}/api/mentorship/assign`, {
                studentIds: Array.from(selectedIds),
                mentorId: selectedMentorId
            }, config);
            const mentor = staffList.find(s => s._id === selectedMentorId);
            toast.success(`Mentor "${mentor?.fullName || mentor?.username}" assigned to ${selectedIds.size} student(s)!`);
            setSelectedIds(new Set());
            setSelectedMentorId('');
            setConfirmOpen(false);
            fetchStudents();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Assignment failed. Please try again.');
        } finally {
            setIsAssigning(false);
        }
    };

    const filtered = students.filter(s =>
        (s.fullName || s.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.registerNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedMentor = staffList.find(s => s._id === selectedMentorId);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-500 inline-block pb-1">
                    Assign Mentor
                </h1>
                <p className="text-sm text-gray-500 mt-2">Select students from your class and assign a mentor (staff) to them.</p>
            </div>

            {/* Step 1 — Pick Mentor */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    Select a Mentor (Staff)
                </h2>

                {loadingStaff ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm"><div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> Loading staff...</div>
                ) : staffList.length === 0 ? (
                    <p className="text-sm text-red-500 font-medium">⚠️ No staff found. Make sure the backend is restarted after the latest update.</p>
                ) : (
                    <>
                        <select
                            value={selectedMentorId}
                            onChange={e => setSelectedMentorId(e.target.value)}
                            className="w-full md:w-96 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                        >
                            <option value="">-- Choose Staff Member --</option>
                            {staffList.map(staff => (
                                <option key={staff._id} value={staff._id}>
                                    {staff.fullName || staff.username}{staff.department ? ` · ${staff.department}` : ''}
                                </option>
                            ))}
                        </select>

                        {selectedMentor && (
                            <div className="mt-3 flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 w-fit">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                                    {(selectedMentor.fullName || selectedMentor.username).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-indigo-900">{selectedMentor.fullName || selectedMentor.username}</p>
                                    <p className="text-xs text-indigo-600">{selectedMentor.department || 'No department info'}</p>
                                </div>
                                <UserCheck className="w-4 h-4 text-indigo-500 ml-1" />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Step 2 — Pick Students */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                        Select Students {selectedIds.size > 0 && `(${selectedIds.size} selected)`}
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or reg no..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64"
                            />
                        </div>
                        <button onClick={fetchStudents} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {loadingStudents ? (
                    <LoadingSpinner message="Loading students..." />
                ) : notAdvisor ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1">Not Assigned as Class Advisor</h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            You need to be assigned as a Class Advisor by your HOD to view and manage students for mentor assignment.
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState icon={Users} title="No Students Found" message="There are no students in your class yet or none match your search." />
                ) : (
                    <>
                        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={filtered.length > 0 && filtered.every((s: any) => selectedIds.has(s._id))}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-bold text-gray-500 uppercase">Select All ({filtered.length})</span>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                            {filtered.map((student: any) => {
                                const checked = selectedIds.has(student._id);
                                return (
                                    <div
                                        key={student._id}
                                        onClick={() => handleToggle(student._id)}
                                        className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${checked ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => handleToggle(student._id)}
                                            onClick={e => e.stopPropagation()}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${checked ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {(student.fullName || student.username || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-gray-900 truncate">{student.fullName || student.username}</p>
                                            <p className="text-xs text-gray-400">{student.registerNumber || student.email || 'No reg no.'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {student.mentor ? (
                                                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">Has Mentor</span>
                                            ) : (
                                                <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">No Mentor</span>
                                            )}
                                            <ChevronRight className={`w-4 h-4 ${checked ? 'text-indigo-500' : 'text-gray-300'}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Assign Button */}
            {!notAdvisor && (
                <div className="flex justify-end">
                    <button
                        onClick={handleAssign}
                        disabled={selectedIds.size === 0 || !selectedMentorId}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-100"
                    >
                        <UserCheck className="w-5 h-5" />
                        Assign Mentor to {selectedIds.size > 0 ? `${selectedIds.size} Student${selectedIds.size > 1 ? 's' : ''}` : 'Students'}
                    </button>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmOpen}
                title="Confirm Mentor Assignment"
                message={`Assign "${selectedMentor?.fullName || selectedMentor?.username}" as mentor to ${selectedIds.size} student(s)? Any existing mentor assignments will be archived in history.`}
                confirmLabel="Yes, Assign Mentor"
                isDanger={false}
                isLoading={isAssigning}
                onConfirm={confirmAssign}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default MentorAssignment;
