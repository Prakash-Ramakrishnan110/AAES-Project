import { useState, useEffect } from 'react';
import { Card } from "../../components/ui/Card";
import { CheckCircle, Clock, XCircle, FileText, Search } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const HODLeaveHistory = () => {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchDepartmentLeaves();
    }, []);

    const fetchDepartmentLeaves = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/student-leaves/department`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setLeaves(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching department leaves:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'Rejected': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    const filteredLeaves = leaves.filter(leave => {
        const matchesSearch =
            leave.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leave.studentId?.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || leave.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8">
            <Card
                title="Department Master Log"
                action={<FileText className="w-5 h-5 text-slate-600" />}
                className="shadow-sm border-slate-200 h-full p-0"
            >
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or register number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm outline-none transition-colors"
                        />
                    </div>
                    <div className="flex bg-slate-100 rounded-md p-1 w-fit">
                        {['All', 'Approved', 'Pending', 'Rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${filterStatus === status
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-500 font-medium">Loading department leaves...</div>
                    ) : filteredLeaves.length === 0 ? (
                        <div className="p-16 text-center text-slate-500 font-medium">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p>No matching leave applications found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Student Details</th>
                                    <th className="px-6 py-4">Leave Duration</th>
                                    <th className="px-6 py-4">Leave Type</th>
                                    <th className="px-6 py-4">Handled By</th>
                                    <th className="px-6 py-4 min-w-[140px]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredLeaves.map(leave => (
                                    <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-slate-900 text-sm">{leave.studentId?.name}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5 font-medium">{leave.studentId?.registerNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-slate-800 text-sm">{new Date(leave.startDate).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 font-medium">to {new Date(leave.endDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs">
                                                {leave.leaveType} Leave
                                            </span>
                                            <div className="mt-2 text-xs text-slate-600 line-clamp-2 max-w-[200px] font-medium" title={leave.reason}>
                                                "{leave.reason}"
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                {leave.classAdvisorId?.name}
                                                <span className="text-[10px] text-slate-500 border border-slate-200 bg-slate-50 px-1 py-0.5 rounded uppercase font-bold tracking-wider">Advisor</span>
                                            </div>
                                            {leave.remarks && (
                                                <div className="mt-1 text-xs text-slate-500 italic font-medium">
                                                    "{leave.remarks}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(leave.status)}
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(leave.status)}`}>
                                                    {leave.status}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium font-mono mt-2">
                                                Logged: {new Date(leave.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default HODLeaveHistory;
