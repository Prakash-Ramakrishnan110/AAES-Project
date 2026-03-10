import { useState, useEffect, useContext } from 'react';
import Card from "../../components/ui/Card";
import { Clock, AlertCircle, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface TimetableEntry {
    _id: string;
    day: string;
    period: number;
    startTime: string;
    endTime: string;
    subjectId: { _id: string, name: string, code: string };
    staffId: { _id: string, fullName: string, username: string };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const SEMESTER_OPTIONS = [
    { value: 1, label: '1st Year - Semester 1' },
    { value: 2, label: '1st Year - Semester 2' },
    { value: 3, label: '2nd Year - Semester 3' },
    { value: 4, label: '2nd Year - Semester 4' },
    { value: 5, label: '3rd Year - Semester 5' },
    { value: 6, label: '3rd Year - Semester 6' },
    { value: 7, label: '4th Year - Semester 7' },
    { value: 8, label: '4th Year - Semester 8' },
];

const StaffDepartmentTimetable = () => {
    const { user, token } = useContext(AuthContext)!;
    const [semester, setSemester] = useState<number>(1);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const isAdvisor = user?.isAdvisor || false;

    // Filter semesters based on advisor year
    const filteredSemesterOptions = isAdvisor ?
        SEMESTER_OPTIONS.filter(opt => opt.label.toLowerCase().includes((user?.advisorYear || '').toLowerCase())) :
        SEMESTER_OPTIONS;

    useEffect(() => {
        if (filteredSemesterOptions.length > 0 && !filteredSemesterOptions.find(o => o.value === semester)) {
            setSemester(filteredSemesterOptions[0].value);
        }
    }, [filteredSemesterOptions, semester]);

    useEffect(() => {
        if (isAdvisor) {
            fetchTimetable();
        }
    }, [semester, isAdvisor]);

    const fetchTimetable = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${API_URL}/timetable/department/${semester}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setTimetable(res.data.data);
            }
        } catch (error: any) {
            console.error('Error fetching timetable:', error);
            const msg = error.response?.data?.message || 'Failed to load department timetable.';
            setErrorMsg(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const getEntryForSlot = (day: string, period: number) => {
        return timetable.find(entry => entry.day === day && entry.period === period);
    };

    if (!isAdvisor) {
        return (
            <div className="p-10 flex flex-col items-center justify-center text-center h-[70vh]">
                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-6">
                    <ShieldAlert className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
                <p className="text-gray-500 max-w-md">
                    The Department Master Timetable is only accessible to Class Advisors and HODs.
                    If you are a Class Advisor and cannot see this, please contact your HOD.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Department Master Timetable</h1>
                    <p className="text-gray-500 mt-1">Read-only view of your home department's class schedule</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Target Semester:</label>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    >
                        {filteredSemesterOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
            )}

            <Card
                title={`Semester ${semester} - Master Timetable`}
                action={<Clock className="w-5 h-5 text-gray-600" />}
                className="shadow-md overflow-hidden"
            >
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
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
                                        <td className="border border-gray-200 p-3 font-semibold text-sm text-gray-800 bg-gray-50/50">
                                            {day}
                                        </td>
                                        {PERIODS.map(period => {
                                            const entry = getEntryForSlot(day, period);
                                            return (
                                                <td key={`${day}-${period}`} className="border border-gray-200 p-2 text-center align-top min-h-[80px]">
                                                    {entry ? (
                                                        <div
                                                            className="flex flex-col gap-1 items-center justify-center w-full h-full p-1 bg-indigo-50/50 rounded border border-indigo-100/50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-help"
                                                            title={`${entry.subjectId.name}\nCode: ${entry.subjectId.code}\nStaff: ${entry.staffId?.fullName || entry.staffId?.username || 'N/A'}\nTime: ${entry.startTime} - ${entry.endTime}`}
                                                        >
                                                            <span className="text-[10px] text-indigo-800 font-bold bg-indigo-100 px-1.5 py-[2px] rounded truncate max-w-[95%]">
                                                                {entry.subjectId.code}
                                                            </span>
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
                )}
            </Card>
        </div>
    );
};

export default StaffDepartmentTimetable;
