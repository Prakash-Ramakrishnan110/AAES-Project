import { useState, useEffect } from 'react';
import Card from "../../components/ui/Card";
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface TimetableEntry {
    _id: string;
    day: string;
    period: number;
    startTime: string;
    endTime: string;
    semester?: number;
    subjectId: { _id: string, name: string, code: string };
    department: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const StaffTimetable = () => {
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchMyTimetable();
    }, []);

    const fetchMyTimetable = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/timetable/staff/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setTimetable(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff timetable:', error);
            setErrorMsg('Failed to fetch your personalized timetable.');
        } finally {
            setIsLoading(false);
        }
    };

    const getEntryForSlot = (day: string, period: number) => {
        return timetable.find(entry => entry.day === day && entry.period === period);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Teaching Timetable</h1>
                <p className="text-gray-500 mt-1">View your personalized schedule across all assigned departments and subjects.</p>
            </div>

            {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
            )}

            <Card
                title="Weekly Schedule"
                action={<CalendarIcon className="w-5 h-5 text-indigo-600" />}
                className="shadow-md h-full overflow-hidden"
            >
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
                                                <td key={`${day}-${period}`} className="border border-gray-200 p-2 text-center align-top min-h-[90px]">
                                                    {entry ? (
                                                        <div
                                                            className="flex flex-col gap-1 items-center justify-center w-full h-full p-1.5 bg-indigo-50 rounded border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-colors shadow-sm cursor-help"
                                                            title={`${entry.subjectId.name}\nCode: ${entry.subjectId.code}\nDepartment: ${entry.department || 'N/A'}\nSemester: ${entry.semester || 'N/A'}\nTime: ${entry.startTime} - ${entry.endTime}`}
                                                        >
                                                            <span className="text-xs text-indigo-800 font-bold max-w-full truncate">
                                                                {entry.subjectId.code}
                                                            </span>
                                                            <span className="text-[10px] bg-white px-1 py-0.5 rounded shadow-sm text-gray-600 font-medium truncate max-w-full block">
                                                                {entry.department || 'Dept'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-300 text-xs flex items-center justify-center h-full min-h-[70px]">
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

export default StaffTimetable;
