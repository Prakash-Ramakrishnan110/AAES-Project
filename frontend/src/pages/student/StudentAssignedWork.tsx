import { useState, useEffect, cloneElement } from 'react';
import { useOutletContext } from 'react-router-dom';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import SectionCard from '../../components/ui/SectionCard';
import { 
    CheckCircle, Clock, Calendar, CheckSquare, 
    Briefcase, AlertCircle, TrendingUp, CheckCircle2 
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Skeleton from '../../components/ui/Skeleton';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

interface AssignedWork {
    _id: string;
    taskId: string;
    title: string;
    description: string;
    assignedBy: { fullName?: string; username?: string; _id: string };
    startDate: string;
    dueDate: string;
    priority: string;
    status: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 260,
            damping: 20
        }
    }
} as const;

const StudentAssignedWork = () => {
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();
    const [tasks, setTasks] = useState<AssignedWork[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setHeaderOptions({
            title: 'Operational Tasks',
            subtitle: 'Review and manage your delegated campus responsibilities',
            actions: (
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md uppercase tracking-wider">
                        {tasks.length} Total Tasks
                    </span>
                </div>
            )
        });
    }, [tasks.length, setHeaderOptions]);

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
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            alert('Could not update task status.');
        }
    };

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'Pending').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
    };

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} height={110} className="w-full rounded-2xl" />
                        ))}
                    </div>
                    <Skeleton height={400} className="w-full rounded-3xl" />
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {errorMsg && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            {errorMsg}
                        </div>
                    )}

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Workload" value={stats.total} icon={<Briefcase />} color="blue" />
                        <StatCard label="Pending" value={stats.pending} icon={<Clock />} color="amber" />
                        <StatCard label="Active" value={stats.inProgress} icon={<TrendingUp />} color="blue" />
                        <StatCard label="Finished" value={stats.completed} icon={<CheckCircle2 />} color="green" />
                    </div>

                    <SectionCard 
                        title="Task Queue" 
                        subtitle="Operational delegation list"
                        icon={<CheckSquare />}
                    >
                        {tasks.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                                <p className="text-slate-500 text-sm max-w-xs mt-1">You have no operational tasks assigned to you at this moment.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table-compact">
                                    <thead>
                                        <tr>
                                            <th>Task Details</th>
                                            <th>Timeline</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map(task => (
                                            <tr key={task._id} className="group transition-all hover:bg-slate-50/50">
                                                <td className="max-w-md">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase">{task.taskId}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded uppercase tracking-wider">HOD</span>
                                                    </div>
                                                    <div className="font-bold text-slate-900 truncate">{task.title}</div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{task.description}</div>
                                                </td>

                                                <td>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                                            <Clock className="w-3 h-3" /> Start: {new Date(task.startDate).toLocaleDateString()}
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${
                                                            new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-rose-600' : 'text-indigo-600'
                                                        }`}>
                                                            <Calendar className="w-3 h-3" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                        task.priority === 'Urgent' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        task.priority === 'High' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {task.priority}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                                                        'bg-amber-50 text-amber-600 border border-amber-100'
                                                    }`}>
                                                        {task.status}
                                                    </span>
                                                </td>

                                                <td className="text-right">
                                                    {task.status === 'Completed' ? (
                                                        <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold text-xs">
                                                            <CheckCircle2 className="w-4 h-4" /> Finalized
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            {task.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => handleStatusUpdate(task._id, 'In Progress')}
                                                                    className="btn-saas px-3 py-1.5 text-[10px]"
                                                                >
                                                                    Engage
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleStatusUpdate(task._id, 'Completed')}
                                                                className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all shadow-sm"
                                                            >
                                                                Complete
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
                    </SectionCard>
                </motion.div>
            )}
        </div>
    );
};

// Internal StatCard component to match dashboard style
const StatCard = ({ label, value, icon, color }: any) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        amber: 'text-amber-600 bg-amber-50',
        red: 'text-red-600 bg-red-50'
    };

    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card premium-lift p-5 rounded-2xl flex items-center gap-4 cursor-default"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                {cloneElement(icon as any, { size: 20, strokeWidth: 2.5 })}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 leading-none mt-1">{value}</h3>
            </div>
        </motion.div>
    );
};

export default StudentAssignedWork;

