import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    Clock, Users, BookOpen, Trash2, Activity, Filter, Plus, Search, ClipboardList
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/badge';
import { StatCard } from '../../ui/StatCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Assignments = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const toast = useToast();
    
    const [assignments, setAssignments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAssignments = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API}/assignments/staff`, config);
            setAssignments(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load assignments.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAssignments();
    }, [token]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API}/assignments/${id}`, config);
            toast.success('Assignment deleted');
            fetchAssignments();
        } catch (err) {
            toast.error('Failed to delete assignment');
        }
    };

    const filteredAssignments = assignments.filter(a => 
        (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.subjectId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-text">Assignments</h1>
                    <p className="text-[13px] text-text-muted mt-1">Manage and track student assessments across your subjects.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => navigate('/staff/assignments/create')}>
                        <Plus size={16} className="mr-2" /> Create Assignment
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    label="Total Assignments" 
                    value={assignments.length} 
                    icon={<ClipboardList />} 
                    trend={{value: '0', isUp: true}} 
                    description="Total assigned tasks" 
                />
                <StatCard 
                    label="Submissions" 
                    value={assignments.reduce((acc, a) => acc + (a.submissionCount || 0), 0)} 
                    icon={<Activity />} 
                    trend={{value: '0', isUp: true}} 
                    description="Total received scripts" 
                />
                <StatCard 
                    label="Active Subjects" 
                    value={new Set(assignments.map(a => a.subjectId?._id).filter(Boolean)).size} 
                    icon={<BookOpen />} 
                    trend={{value: 'OK', isUp: true}} 
                    description="Coverage across modules" 
                />
            </div>

            <Card className="flex flex-col overflow-hidden min-h-[500px]">
                <div className="px-6 py-4 border-b border-border bg-background/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-[14px] font-semibold text-text">Assignment List</h2>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input 
                                placeholder="Search by title..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 bg-background border border-border rounded pl-9 pr-4 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="h-9">
                            <Filter size={14} />
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/50 border-b border-border">
                                <th className="px-6 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Assignment Details</th>
                                <th className="px-6 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Deadline</th>
                                <th className="px-6 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Submissions</th>
                                <th className="px-6 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={4} className="py-20 text-center text-text-muted animate-pulse">Loading assignments...</td></tr>
                            ) : filteredAssignments.length === 0 ? (
                                <tr><td colSpan={4} className="py-20 text-center text-text-muted italic">No assignments found.</td></tr>
                            ) : (
                                filteredAssignments.map((a) => (
                                    <tr key={a._id} className="hover:bg-background transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-semibold text-text group-hover:text-primary transition-colors">{a.title}</span>
                                                <span className="text-[11px] text-text-muted mt-0.5">{a.subjectId?.name || 'Unknown Subject'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[12px] font-medium text-text">
                                                <Clock size={12} className="text-primary" />
                                                {new Date(a.submissionDeadline).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="text-[10px]">
                                                {a.submissionCount || 0} Submissions
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 text-[11px]"
                                                    onClick={() => navigate(`/staff/submissions?assignment=${a._id}`)}
                                                >
                                                    Evaluate
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                                                    onClick={() => handleDelete(a._id)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Assignments;
