import { useState, useEffect } from 'react';
import Card from "../../components/ui/Card";
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
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Student Leave History</h1>
                    <p className="text-gray-500 mt-1">Monitor all recorded leaves across your department</p>
                </div>
            </div>

            <Card
                title="Department Master Log"
                action={<FileText className="w-5 h-5 text-gray-600" />}
                className="shadow-md h-full p-0"
            >
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or register number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <div className="flex bg-white rounded border border-gray-200 p-1 w-fit">
                        {['All', 'Approved', 'Pending', 'Rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${filterStatus === status
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">Loading department leaves...</div>
                    ) : filteredLeaves.length === 0 ? (
                        <div className="p-16 text-center text-gray-400">
                            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p>No matching leave applications found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Student Details</th>
                                    <th className="px-6 py-4">Leave Duration</th>
                                    <th className="px-6 py-4">Leave Type</th>
                                    <th className="px-6 py-4">Handled By</th>
                                    <th className="px-6 py-4 min-w-[140px]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredLeaves.map(leave => (
                                    <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-gray-900 text-base">{leave.studentId?.name}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">{leave.studentId?.registerNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-medium text-gray-800">{new Date(leave.startDate).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">to {new Date(leave.endDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                                                {leave.leaveType} Leave
                                            </span>
                                            <div className="mt-2 text-xs text-gray-600 line-clamp-2 max-w-[200px]" title={leave.reason}>
                                                "{leave.reason}"
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                                {leave.classAdvisorId?.name}
                                                <span className="text-[10px] text-gray-400 border px-1 rounded uppercase tracking-wide">Advisor</span>
                                            </div>
                                            {leave.remarks && (
                                                <div className="mt-1 text-xs text-gray-500 italic">
                                                    "{leave.remarks}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(leave.status)}
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getStatusStyle(leave.status)}`}>
                                                    {leave.status}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-mono mt-2">
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
