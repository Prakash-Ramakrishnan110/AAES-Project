import { useState, useEffect, useContext } from 'react';
import {
    Plus, Save, Trash2, Calendar,
    Download, X, Copy,
    Layers, FileText, ChevronLeft, ChevronRight,
    Check, User
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const PERIOD_OPTIONS = [
    { id: 1, label: 'P1', time: '09:00 - 10:00' },
    { id: 2, label: 'P2', time: '10:00 - 11:00' },
    { id: 3, label: 'P3', time: '11:00 - 12:00' },
    { id: 4, label: 'P4', time: '12:15 - 13:15' },
    { id: 5, label: 'P5', time: '13:15 - 14:15' },
    { id: 6, label: 'P6', time: '14:15 - 15:15' },
    { id: 7, label: 'P7', time: '15:15 - 16:15' },
    { id: 8, label: 'P8', time: '16:15 - 17:15' },
];

const ClassActivityLog = () => {
    const { user, token } = useContext(AuthContext)!;
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyLogs, setDailyLogs] = useState<any[]>([]);
    const [pendingRows, setPendingRows] = useState<any[]>([]);
    const [reminders, setReminders] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const isStaff = (user?.role as string) === 'staff' || (user?.role as string) === 'class advisor';
    const isPrincipalOrAdmin = user?.role === 'principal' || user?.role === 'admin';
    const isHOD = user?.role === 'hod';

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchDailyLogs();
        fetchRemindersForDate();
    }, [selectedDate]);

    const fetchInitialData = async () => {
        try {
            const url = isStaff
                ? `${API_URL}/subjects?staffId=${user?._id || user?.id}`
                : `${API_URL}/subjects`; // Fetch all for management
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubjects(res.data);
        } catch (error) { console.error('Init error:', error); }
    };

    const fetchDailyLogs = async () => {
        try {
            const res = await axios.get(`${API_URL}/timetable/activity-log/history`, {
                params: { startDate: selectedDate, endDate: selectedDate },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setDailyLogs(res.data.data);
                setPendingRows([]);
            }
        } catch (error) { console.error('Error fetching logs:', error); }
    };

    const fetchRemindersForDate = async () => {
        if (!isStaff) return; // Only staff/class advisor get reminders
        try {
            const res = await axios.get(`${API_URL}/timetable/activity-log/reminders?date=${selectedDate}&staffId=${user?._id || user?.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setReminders(res.data.data);
        } catch (error) { console.error('Error reminders:', error); }
    };

    const handleAddRows = (count = 1) => {
        const newRows = Array.from({ length: count }).map((_, i) => ({
            tempId: `${Date.now()}_${i}`,
            subjectId: '',
            periodId: '',
            time: '',
            topicCovered: '',
            remarks: '',
        }));
        setPendingRows([...pendingRows, ...newRows]);
    };

    const handleImportSchedule = () => {
        if (reminders.length === 0) {
            setMessage({ type: 'error', text: 'No scheduled classes found.' });
            return;
        }
        const loggedPeriods = dailyLogs.filter(l => l.staffId?._id === user?._id || l.staffId === user?._id).map(l => l.period);
        const missing = reminders.filter(r => !loggedPeriods.includes(r.period));
        if (missing.length === 0) {
            setMessage({ type: 'info', text: 'Schedule already synced.' });
            return;
        }
        const imported = missing.map(rem => ({
            tempId: `exp_${rem._id}_${Date.now()}`,
            subjectId: rem.subjectId._id,
            periodId: rem.period,
            time: `${rem.startTime} - ${rem.endTime}`,
            topicCovered: '',
            remarks: '',
        }));
        setPendingRows([...pendingRows, ...imported]);
    };

    const updatePendingRow = (tempId: string, field: string, value: any) => {
        setPendingRows(pendingRows.map(row => {
            if (row.tempId === tempId) {
                const updated = { ...row, [field]: value };
                if (field === 'periodId') {
                    const opt = PERIOD_OPTIONS.find(p => p.id === value);
                    if (opt) updated.time = opt.time;
                }
                return updated;
            }
            return row;
        }));
    };

    const handleSaveAll = async () => {
        const validRows = pendingRows.filter(r => r.subjectId && r.topicCovered && r.periodId);
        if (validRows.length === 0) {
            setMessage({ type: 'error', text: 'Please fill Subject and Topic for the new rows.' });
            return;
        }
        setIsSavingAll(true);
        let count = 0;
        for (const row of validRows) {
            try {
                const payload = {
                    subjectId: row.subjectId,
                    date: selectedDate,
                    period: row.periodId,
                    time: row.time,
                    topicCovered: row.topicCovered,
                    remarks: row.remarks
                };
                const res = await axios.post(`${API_URL}/timetable/activity-log`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) count++;
            } catch (e) { console.error('Save failed', e); }
        }
        if (count > 0) {
            setMessage({ type: 'success', text: `Successfully registered ${count} log entries.` });
            fetchDailyLogs();
        }
        setIsSavingAll(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleDeleteLog = async (id: string) => {
        if (!window.confirm('Confirm deletion of this record?')) return;
        try {
            await axios.delete(`${API_URL}/timetable/activity-log/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDailyLogs();
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || 'Error deleting log.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const res = await axios.get(`${API_URL}/timetable/activity-log/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.data;
            const headers = "Date,Period,Time,Staff,Subject,Topic,Remarks\n";
            const rows = data.map((log: any) =>
                `${new Date(log.date).toLocaleDateString()},P${log.period},${log.time},${log.staffId?.fullName || 'N/A'},${log.subjectId?.name},${log.topicCovered},${log.remarks || ''}`
            ).join("\n");
            const blob = new Blob([headers + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Class_Log_${selectedDate}.csv`;
            a.click();
        } catch (e) { setMessage({ type: 'error', text: 'Export failed.' }); }
    };

    const navigateDate = (offset: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const allRows = [
        ...dailyLogs.map(l => ({ ...l, type: 'registered' })),
        ...pendingRows.map(p => ({ ...p, type: 'new' }))
    ].sort((a, b) => (a.period || a.periodId) - (b.period || b.periodId));

    return (
        <div className="min-h-screen bg-[#F5F7F9] p-4 md:p-8 font-sans text-slate-800">
            <div className="max-w-[1400px] mx-auto bg-white border border-slate-300 shadow-sm rounded-sm">

                <div className="bg-[#1D4ED8] text-white p-3 flex items-center justify-between border-b border-slate-300">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2 rounded-sm">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold uppercase tracking-wider">
                                {isStaff ? 'Staff Daily Class Ledger' : 'Departmental Activity Overview'}
                            </h1>
                            <p className="text-[10px] opacity-80 uppercase">Official Academic Record System</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => navigateDate(-1)} className="p-1.5 hover:bg-white/10 rounded-sm">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="bg-white text-slate-900 flex items-center gap-2 px-3 py-1 rounded-sm border border-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="text-xs font-bold outline-none border-0 p-0 cursor-pointer"
                            />
                        </div>
                        <button onClick={() => navigateDate(1)} className="p-1.5 hover:bg-white/10 rounded-sm">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleDownloadCSV} className="bg-white/10 hover:bg-white/20 p-2 rounded-sm" title="Download Excel">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-[#F8FAFC] border-b border-slate-300 p-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {isStaff && (
                            <>
                                <button onClick={() => handleAddRows(8)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold rounded-sm text-slate-700">
                                    <Layers className="w-3.5 h-3.5 text-indigo-600" /> Prepare 8 Slots
                                </button>
                                <button onClick={handleImportSchedule} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold rounded-sm text-slate-700">
                                    <Copy className="w-3.5 h-3.5 text-emerald-600" /> Sync Schedule
                                </button>
                                <button onClick={() => handleAddRows(1)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold rounded-sm text-slate-700">
                                    <Plus className="w-3.5 h-3.5 text-slate-500" /> Insert Row
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {message.text && (
                            <div className={`text-[11px] font-bold px-3 py-1 rounded-full ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {message.text}
                            </div>
                        )}
                        {isStaff && (
                            <button onClick={handleSaveAll} disabled={isSavingAll || pendingRows.length === 0} className="flex items-center gap-2 px-6 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-sm shadow-sm disabled:opacity-30 uppercase tracking-wider">
                                {isSavingAll ? 'PROCESSING...' : <><Save className="w-3.5 h-3.5" /> Commit to Ledger</>}
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#F1F5F9] text-[11px] font-black text-slate-600 uppercase border-b border-slate-300">
                                <th className="w-12 border-r border-slate-200"></th>
                                <th className="px-3 py-2 text-left border-r border-slate-300 w-24">Period</th>
                                <th className="px-3 py-2 text-left border-r border-slate-300 w-32">Time Index</th>
                                {!isStaff && <th className="px-3 py-2 text-left border-r border-slate-300 w-48">Faculty Member</th>}
                                <th className="px-3 py-2 text-left border-r border-slate-300 w-64">Subject / Course</th>
                                <th className="px-3 py-2 text-left border-r border-slate-300">Topic of Instruction</th>
                                <th className="px-3 py-2 text-left border-r border-slate-300 w-48">Remarks</th>
                                <th className="px-3 py-2 text-center w-20">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            {allRows.map((row, idx) => {
                                const isNew = row.type === 'new';
                                const period = isNew ? row.periodId : row.period;
                                const subjectName = isNew ? (subjects.find(s => s._id === row.subjectId)?.name || '') : (row.subjectId?.name || 'N/A');
                                const staffName = row.staffId?.fullName || user?.fullName;

                                return (
                                    <tr key={isNew ? row.tempId : row._id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#FDFDFD]'} border-b border-slate-200 hover:bg-blue-50/50 transition-colors`}>
                                        <td className="border-r border-slate-200 flex items-center justify-center py-2 h-full min-h-[44px]">
                                            {isNew ? <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div> : <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />}
                                        </td>
                                        <td className="px-3 py-1 border-r border-slate-200 font-bold">P{period}</td>
                                        <td className="px-3 py-2 border-r border-slate-200 text-slate-400">{row.time || '-- : --'}</td>
                                        {!isStaff && (
                                            <td className="px-3 py-2 border-r border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                    <span className="font-bold text-slate-700">{staffName}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-3 py-1 border-r border-slate-200">
                                            {isNew ? (
                                                <select value={row.subjectId} onChange={e => updatePendingRow(row.tempId, 'subjectId', e.target.value)} className="w-full bg-transparent text-slate-700 font-medium outline-none p-1 border border-transparent focus:border-slate-300">
                                                    <option value="">Select Course</option>
                                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                                </select>
                                            ) : <span className="font-bold text-slate-900">{subjectName}</span>}
                                        </td>
                                        <td className="px-3 py-1 border-r border-slate-200">
                                            {isNew ? (
                                                <input type="text" placeholder="Enter topic..." value={row.topicCovered} onChange={e => updatePendingRow(row.tempId, 'topicCovered', e.target.value)} className="w-full bg-white text-slate-700 outline-none px-2 py-1.5 border border-slate-200 focus:border-indigo-300 rounded-sm" />
                                            ) : <span className="text-slate-700 leading-relaxed font-medium">{row.topicCovered}</span>}
                                        </td>
                                        <td className="px-3 py-1 border-r border-slate-200">
                                            {isNew ? (
                                                <input type="text" placeholder="Notes..." value={row.remarks} onChange={e => updatePendingRow(row.tempId, 'remarks', e.target.value)} className="w-full bg-transparent text-slate-500 italic outline-none px-2 py-1" />
                                            ) : <span className="text-slate-400 italic">{row.remarks || '-'}</span>}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            {(isNew || isStaff || isHOD || isPrincipalOrAdmin) && (
                                                <button onClick={() => isNew ? setPendingRows(pendingRows.filter(r => r.tempId !== row.tempId)) : handleDeleteLog(row._id)} className="p-1.5 text-slate-200 hover:text-rose-500 transition-all">
                                                    {isNew ? <X className="w-4 h-4 text-slate-300" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClassActivityLog;
