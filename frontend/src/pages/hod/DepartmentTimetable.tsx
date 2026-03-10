import React, { useState, useEffect } from 'react';
import Card from "../../components/ui/Card";
import { Calendar as CalendarIcon, Clock, Plus, AlertCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface TimetableEntry {
    _id: string;
    day: string;
    period: number;
    startTime: string;
    endTime: string;
    staffId: { _id: string, name?: string, fullName?: string, username?: string, department?: string };
    subjectId: { _id: string, name: string, code: string };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const TimeSelector = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => {
    const [hr, min] = value.split(':');
    let hour12 = parseInt(hr || '0', 10);
    const ampm = hour12 >= 12 ? 'PM' : 'AM';
    hour12 = hour12 % 12 || 12;
    const hourStr = hour12 < 10 ? `0${hour12}` : `${hour12}`;

    const handleTimeChange = (type: 'h' | 'm' | 'p', val: string) => {
        let newHr24 = parseInt(hr || '0', 10);
        let newMin = min || '00';

        if (type === 'h') {
            const h = parseInt(val, 10);
            if (ampm === 'PM' && h !== 12) newHr24 = h + 12;
            else if (ampm === 'AM' && h === 12) newHr24 = 0;
            else if (ampm === 'PM' && h === 12) newHr24 = 12;
            else newHr24 = h;
        } else if (type === 'm') {
            newMin = val;
        } else if (type === 'p') {
            if (val === 'PM' && newHr24 < 12) newHr24 += 12;
            if (val === 'AM' && newHr24 >= 12) newHr24 -= 12;
        }

        const finalHr = newHr24 < 10 ? `0${newHr24}` : `${newHr24}`;
        onChange(`${finalHr}:${newMin}`);
    };

    return (
        <div>
            <label className="block text-[10px] text-gray-500 uppercase mb-1">{label}</label>
            <div className="flex gap-1 items-center">
                <select value={hourStr} onChange={e => handleTimeChange('h', e.target.value)} className="w-[45px] border border-gray-300 rounded px-1 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none appearance-none text-center bg-white cursor-pointer">
                    {Array.from({ length: 12 }, (_, i) => {
                        const v = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
                        return <option key={v} value={v}>{v}</option>
                    })}
                </select>
                <span className="text-gray-500 font-bold">:</span>
                <select value={min} onChange={e => handleTimeChange('m', e.target.value)} className="w-[45px] border border-gray-300 rounded px-1 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none appearance-none text-center bg-white cursor-pointer">
                    {Array.from({ length: 60 }, (_, i) => {
                        const m = i < 10 ? `0${i}` : `${i}`;
                        return <option key={m} value={m}>{m}</option>
                    })}
                </select>
                <select value={ampm} onChange={e => handleTimeChange('p', e.target.value)} className="w-[45px] border border-gray-300 rounded px-1 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none appearance-none text-center bg-gray-50 cursor-pointer hover:bg-gray-100">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
        </div>
    );
};

const DepartmentTimetable = () => {
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [semester, setSemester] = useState<number>(5); // default sem

    // Form States
    const [selectedStaff, setSelectedStaff] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchMetadata();
    }, []);

    useEffect(() => {
        if (semester) {
            fetchTimetable();
        }
    }, [semester]);

    const fetchMetadata = async () => {
        try {
            const token = localStorage.getItem('token');
            const [staffRes, subjectRes] = await Promise.all([
                axios.get(`${API_URL}/users?role=staff&global=true`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/subjects`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (staffRes.data) setStaffList(staffRes.data);
            if (subjectRes.data) setSubjectList(subjectRes.data);
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    const fetchTimetable = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/timetable/department/${semester}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setTimetable(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching timetable:', error);
        } finally {
            setIsLoading(false);
        }
    };

    console.log('TIMETABLE STATE:', timetable);

    const formatAmPm = (time24hr: string) => {
        if (!time24hr) return '';
        const [hoursStr, minutes] = time24hr.split(':');
        let hours = parseInt(hoursStr, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hoursFormatted = hours < 10 ? '0' + hours : hours;
        return `${hoursFormatted}:${minutes} ${ampm}`;
    };

    const handleCreateEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/timetable`, {
                semester,
                subjectId: selectedSubject,
                staffId: selectedStaff,
                day: selectedDay,
                period: selectedPeriod,
                startTime: formatAmPm(startTime),
                endTime: formatAmPm(endTime)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setSuccessMsg('Timetable entry added successfully.');
                fetchTimetable(); // refresh grid
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Error creating timetable entry.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEntry = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this class session from the timetable?')) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${API_URL}/timetable/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSuccessMsg('Timetable entry removed successfully.');
                fetchTimetable();
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Error deleting timetable entry.');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to find all entries in the grid for a specific period
    const getEntriesForSlot = (day: string, period: number) => {
        return timetable.filter(entry => entry.day === day && entry.period === period);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Department Master Timetable</h1>
                    <p className="text-gray-500 mt-1">Allocate Staff to Subjects and build the class schedule</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">Target Semester:</label>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(parseInt(e.target.value))}
                        className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>
                                Year {Math.ceil(sem / 2)} - Semester {sem}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="p-3 bg-green-50 text-green-700 rounded border border-green-200 text-sm">
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Timetable Configuration Panel */}
                <div className="lg:col-span-1">
                    <Card
                        title="Add Class Session"
                        action={<Plus className="w-5 h-5 text-indigo-600" />}
                        className="shadow-md"
                    >
                        <form onSubmit={handleCreateEntry} className="space-y-4 pt-2">

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Select Day</label>
                                <select
                                    required value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                    {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Period (1-8)</label>
                                    <select
                                        required value={selectedPeriod} onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                    >
                                        {PERIODS.map(p => <option key={p} value={p}>Period {p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Time Block</label>
                                    <div className="flex items-center text-xs text-gray-500 font-mono mt-2 bg-gray-50 px-2 py-1.5 rounded border border-gray-200">
                                        {formatAmPm(startTime)} - {formatAmPm(endTime)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <TimeSelector label="Start Time" value={startTime} onChange={setStartTime} />
                                <TimeSelector label="End Time" value={endTime} onChange={setEndTime} />
                            </div>

                            <div className="border-t border-gray-100 pt-3 mt-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Assigned Staff</label>
                                    <select
                                        required value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">Select Handled By...</option>
                                        {staffList.map((staff: any) => (
                                            <option key={staff._id} value={staff._id}>{staff.fullName || staff.username} ({staff.department || 'N/A'})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Subject</label>
                                    <select
                                        required value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">Select Handled Subject...</option>
                                        {subjectList.map(subj => (
                                            <option key={subj._id} value={subj._id}>{subj.code} - {subj.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded transition-colors flex justify-center items-center gap-2 text-sm"
                            >
                                <CalendarIcon className="w-4 h-4" /> Adding to Timetable
                            </button>
                        </form>
                    </Card>
                </div>

                {/* Master Timetable Grid View */}
                <div className="lg:col-span-3">
                    <Card
                        title={`Semester ${semester} - Master Timetable`}
                        action={<Clock className="w-5 h-5 text-gray-600" />}
                        className="shadow-md h-full overflow-hidden"
                    >
                        <div className="overflow-x-auto w-full mt-4 rounded border border-gray-200">
                            <table className="w-full min-w-[800px] border-collapse bg-white">
                                <thead>
                                    <tr className="bg-gray-100/80">
                                        <th className="border border-gray-200 p-3 text-sm font-semibold text-gray-700 min-w-[120px]">Day / Period</th>
                                        {PERIODS.map(p => (
                                            <th key={p} className="border border-gray-200 p-2 text-center text-xs text-gray-600 w-[12%]">
                                                Period {p}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAYS.map(day => (
                                        <tr key={day} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="border border-gray-200 p-3 font-semibold text-sm text-gray-800 bg-gray-50/50 relative">
                                                {day}
                                            </td>
                                            {PERIODS.map(period => {
                                                const entries = getEntriesForSlot(day, period);
                                                return (
                                                    <td key={`${day}-${period}`} className="border border-gray-200 p-2 text-center align-top min-h-[80px]">
                                                        {entries.length > 0 ? (
                                                            <div className="flex flex-col gap-2 w-full h-full">
                                                                {entries.map(entry => (
                                                                    <div
                                                                        key={entry._id}
                                                                        className="group relative flex flex-col gap-1 items-center justify-center p-1 bg-indigo-50/50 rounded border border-indigo-100/50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-help"
                                                                        title={`${entry.subjectId?.name || 'Unknown'}\nCode: ${entry.subjectId?.code || 'N/A'}\nStaff: ${entry.staffId?.fullName || entry.staffId?.username || 'Unknown'} (${entry.staffId?.department || 'N/A'})\nTime: ${entry.startTime} - ${entry.endTime}`}
                                                                    >
                                                                        <button
                                                                            onClick={() => handleDeleteEntry(entry._id)}
                                                                            className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-5 h-5 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-full shadow transition-all outline-none"
                                                                            title="Delete session"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                        <span className="text-[10px] text-indigo-800 font-bold bg-indigo-100 px-1.5 py-[2px] rounded truncate max-w-[95%]">
                                                                            {entry.subjectId?.code || '???'}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-300 text-xs flex items-center justify-center h-full min-h-[60px]">
                                                                -
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default DepartmentTimetable;
