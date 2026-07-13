import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    Search, Users, 
    ShieldCheck, Activity, ChevronRight, Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';
import { StatCard } from '../../ui/StatCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (path: string) => {
    if (!path) return '';
    const cleanAPI = API.endsWith('/') ? API.slice(0, -1) : API;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanAPI}${cleanPath}`;
};

interface Student {
    _id: string;
    username: string;
    fullName?: string;
    email: string;
    department: string;
    academicYear?: string;
    batch?: string;
    semester?: number;
    section?: string;
    isActive: boolean;
    profileImage?: string;
    registerNumber?: string;
}

const StaffStudents = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/users/staff-students`, config);
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchStudents();
        }
    }, [token]);

    const filteredStudents = students.filter(s =>
        (s.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.registerNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center text-text-muted">Loading students...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-text">Students</h1>
                    <p className="text-[13px] text-text-muted mt-1">View and manage students in your assigned department and subjects.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="default">Total Students: {students.length}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Active Students" 
                    value={students.filter(s => s.isActive).length} 
                    icon={<Users />} 
                    trend={{value: '100%', isUp: true}}
                    description="Students currently active"
                />
                <StatCard 
                    label="Semesters" 
                    value={new Set(students.map(s => s.semester).filter(Boolean)).size} 
                    icon={<Database size={18} />} 
                    trend={{value: '0', isUp: true}}
                    description="Active semester groups"
                />
                <StatCard 
                    label="Batches" 
                    value={new Set(students.map(s => s.batch).filter(Boolean)).size} 
                    icon={<Activity size={18} />} 
                    trend={{value: '0', isUp: true}}
                    description="Unique student batches"
                />
                <StatCard 
                    label="Compliance" 
                    value="Verified" 
                    icon={<ShieldCheck />} 
                    trend={{value: 'OK', isUp: true}}
                    description="Registry status"
                />
            </div>

            <Card className="flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-background/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-[14px] font-semibold text-text">Student List</h2>
                    <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e: any) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 !py-1.5"
                        icon={<Search size={14} className="text-text-muted" />}
                    />
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-background/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Reg Number</th>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Academic Info</th>
                                <th className="px-6 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-[13px] text-text-muted">No students found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredStudents.map((s) => (
                                    <tr 
                                        key={s._id} 
                                        className="hover:bg-background transition-colors cursor-pointer" 
                                        onClick={() => navigate(`/profile/${s._id}`)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-background border border-border rounded flex items-center justify-center text-text-muted overflow-hidden">
                                                    {s.profileImage ? (
                                                        <img src={getImageUrl(s.profileImage)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users size={16} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-semibold text-text">{s.fullName || s.username}</div>
                                                    <div className="text-[11px] text-text-muted mt-0.5">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[13px] font-medium text-text">
                                            {s.registerNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] px-2 py-0">SEM {s.semester}</Badge>
                                                    <Badge variant="secondary" className="text-[10px] px-2 py-0">Batch: {s.batch || 'N/A'}</Badge>
                                                </div>
                                                <div className="text-[11px] text-text-muted">{s.department}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {s.isActive ? (
                                                    <Badge variant="default" className="bg-success/10 text-success border-success/20">Active</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Inactive</Badge>
                                                )}
                                                <ChevronRight size={14} className="text-text-muted" />
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

export default StaffStudents;
