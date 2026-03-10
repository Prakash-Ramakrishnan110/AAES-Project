import { useState, useEffect } from 'react';
import Card from "../../components/ui/Card";
import { CheckCircle, Clock, Calendar, CheckSquare } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface AssignedWork {
    _id: string;
    taskId: string;
    title: string;
    description: string;
    assignedBy: { name: string; _id: string };
    startDate: string;
    dueDate: string;
    priority: string;
    status: string;
}

const MyAssignedWork = () => {
    const [tasks, setTasks] = useState<AssignedWork[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [, setIsLoading] = useState(false);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/work-assignments/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setTasks(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching my tasks:', error);
            setErrorMsg('Failed to fetch your assigned work.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (taskId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/work-assignments/${taskId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                // Update local state instead of full refetch for speed
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            alert('Could not update task status.');
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

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Assigned Work</h1>
                    <p className="text-gray-500 mt-1">Review operational tasks delegated by your Head of Department</p>
                </div>
            </div>

            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                    {errorMsg}
                </div>
            )}

            <Card
                title="Your Task Queue"
                action={<CheckSquare className="w-5 h-5 text-gray-600" />}
                className="shadow-md p-0"
            >
                <div className="pt-2">
                    {tasks.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <CheckCircle className="w-16 h-16 text-gray-200 mb-4" />
                            <p className="text-lg font-medium text-gray-700">All caught up!</p>
                            <p>You have no operational tasks assigned to you right now.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Task Details</th>
                                        <th className="px-6 py-4">Assigned On</th>
                                        <th className="px-6 py-4">Deadline</th>
                                        <th className="px-6 py-4 text-center">Update Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tasks.map(task => (
                                        <tr key={task._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 align-top w-2/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-gray-500 font-mono tracking-wider">{task.taskId}</span>
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${task.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                                        task.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {task.priority}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(task.status)}`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                                <div className="font-semibold text-gray-900 text-base">{task.title}</div>
                                                <div className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">{task.description}</div>
                                                <div className="mt-3 text-xs text-gray-500 italic">
                                                    Delegated by: {task.assignedBy?.name} (HOD)
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-center gap-2 font-medium text-gray-600 border border-gray-200 bg-gray-50 w-fit px-3 py-1.5 rounded-full text-xs">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(task.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top">
                                                <div className={`flex items-center gap-2 font-semibold border w-fit px-3 py-1.5 rounded-full text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'Completed'
                                                    ? 'text-red-700 bg-red-50 border-red-200'
                                                    : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                                                    }`}>
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top text-center vertical-align-middle">
                                                {task.status === 'Completed' ? (
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md font-medium text-sm">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Completed
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-2 max-w-[160px] mx-auto">
                                                        {task.status === 'Pending' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(task._id, 'In Progress')}
                                                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold transition-colors"
                                                            >
                                                                Mark In Progress
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleStatusUpdate(task._id, 'Completed')}
                                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white border border-green-700 rounded text-xs font-semibold transition-colors shadow-sm"
                                                        >
                                                            Mark Completed
                                                        </button>
                                                    </div>
                                                )}
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
    );
};

export default MyAssignedWork;
