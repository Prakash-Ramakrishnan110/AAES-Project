import React, { useState, useEffect, useContext } from 'react';
import Card from "../../components/ui/Card";
import { UserPlus, Clock, CheckCircle, FileText, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

interface WorkAssignment {
    _id: string;
    taskId: string;
    title: string;
    description: string;
    assignedStaffId: { name?: string; fullName?: string; username?: string; _id: string };
    startDate: string;
    dueDate: string;
    priority: string;
    status: string;
}

const HODWorkAssignments = () => {
    const { token, user } = useContext(AuthContext)!;
    const [tasks, setTasks] = useState<WorkAssignment[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedStaffId, setAssignedStaffId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('Medium');

    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const authHeader = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (token) {
            fetchTasks();
            fetchStaff();
        }
    }, [token]);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${API_URL}/work-assignments/department`, {
                headers: authHeader
            });
            if (res.data.success) setTasks(res.data.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            // Filter staff by HOD's department to ensure only department staff appear
            const dept = user?.department || '';
            const res = await axios.get(`${API_URL}/users?role=staff${dept ? `&department=${encodeURIComponent(dept)}` : ''}`, {
                headers: authHeader
            });
            if (Array.isArray(res.data)) setStaffList(res.data);
        } catch (error) {
            console.error('Error fetching staff list:', error);
        }
    };

    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setIsLoading(true);

        try {
            const res = await axios.post(`${API_URL}/work-assignments`, {
                title,
                description,
                assignedStaffId,
                startDate,
                dueDate,
                priority
            }, {
                headers: authHeader
            });

            if (res.data.success) {
                setSuccessMsg('Work assigned successfully!');
                // Reset form
                setTitle('');
                setDescription('');
                setAssignedStaffId('');
                setStartDate('');
                setDueDate('');
                setPriority('Medium');

                fetchTasks(); // refresh
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Failed to assign work task');
        } finally {
            setIsLoading(false);
        }
    };

    // Format helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getPriorityIcon = (prio: string) => {
        switch (prio) {
            case 'Urgent': return <AlertCircle className="w-3 h-3 text-red-500" />
            case 'High': return <AlertCircle className="w-3 h-3 text-orange-500" />
            default: return null;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Work Assignment</h1>
                    <p className="text-gray-500 mt-1">Assign responsibilities to staff members and track completion</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Task Assignment Form */}
                <div className="lg:col-span-1">
                    <Card
                        title="Delegate New Task"
                        action={<UserPlus className="w-5 h-5 text-indigo-600" />}
                        className="shadow-md border-t-4 border-t-indigo-600 p-0"
                    >
                        <div className="pt-2 px-6 pb-6 mt-4">
                            {successMsg && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
                                    {successMsg}
                                </div>
                            )}
                            {errorMsg && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                                    {errorMsg}
                                </div>
                            )}

                            <form onSubmit={handleAssignTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="E.g., CCM Report Compilation"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                                        placeholder="Detailed instructions..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={assignedStaffId}
                                        onChange={(e) => setAssignedStaffId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Staff Member...</option>
                                        {staffList.map(staff => (
                                            <option key={staff._id} value={staff._id}>{staff.fullName || staff.username}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                                >
                                    {isLoading ? 'Assigning...' : (
                                        <>
                                            <FileText className="w-4 h-4" />
                                            Assign Work
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </Card>
                </div>

                {/* Tracked Assignments List */}
                <div className="lg:col-span-2">
                    <Card
                        title="Department Task Tracker"
                        subtitle="Monitor the progress of assigned operational tasks"
                        action={<Calendar className="w-5 h-5 text-gray-600" />}
                        className="shadow-md h-full p-0"
                    >
                        <div className="pt-2 max-h-[600px] overflow-y-auto">
                            {tasks.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                    <CheckCircle className="w-12 h-12 text-gray-300 mb-3" />
                                    <p>No operational tasks currently tracked.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold uppercase text-xs">
                                            <tr>
                                                <th className="px-5 py-3 rounded-tl-lg">Task Info</th>
                                                <th className="px-5 py-3">Assigned To</th>
                                                <th className="px-5 py-3">Timeline</th>
                                                <th className="px-5 py-3 rounded-tr-lg">Progress Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {tasks.map(task => (
                                                <tr key={task._id} className="hover:bg-gray-50/50">
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs text-gray-400 font-mono tracking-wider">{task.taskId}</span>
                                                            {getPriorityIcon(task.priority)}
                                                        </div>
                                                        <div className="font-semibold text-gray-900">{task.title}</div>
                                                        <div className="text-gray-500 text-xs mt-1 line-clamp-2 md:max-w-xs">{task.description}</div>
                                                    </td>
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="font-medium text-gray-800">{task.assignedStaffId?.fullName || task.assignedStaffId?.username || 'Unknown Staff'}</div>
                                                    </td>
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="flex flex-col gap-1 text-xs">
                                                            <div className="flex items-center gap-1 text-gray-500">
                                                                <Clock className="w-3 h-3" /> Start: {new Date(task.startDate).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-1 font-medium text-indigo-700">
                                                                <Calendar className="w-3 h-3" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 align-top">
                                                        <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${getStatusColor(task.status)}`}>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default HODWorkAssignments;
