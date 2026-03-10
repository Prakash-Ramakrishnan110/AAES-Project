import { useState, useEffect } from 'react';
import Card from "../../components/ui/Card";
import { CheckCircle, Clock, XCircle, FileText, Download } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const StudentLeaveRequests = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Status Filter State
    const [filter, setFilter] = useState('Pending');

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const fetchLeaveRequests = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/student-leaves/advisor`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching student leaves:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/student-leaves/${id}/status`,
                { status: newStatus, remarks: newStatus === 'Rejected' ? 'Rejected by Class Advisor' : 'Approved by Class Advisor' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                // Optimistic local update
                setRequests(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
            }
        } catch (error) {
            console.error(`Error updating leave status to ${newStatus}:`, error);
            alert('Failed to update request.');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'Rejected': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    const filteredRequests = requests.filter(r => r.status === filter || filter === 'All');

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Student Leave Requests</h1>
                    <p className="text-gray-500 mt-1">Review and approve applications from your advisees</p>
                </div>

                <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    {['Pending', 'Approved', 'Rejected', 'All'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === status
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <Card
                title="Application Action Center"
                action={<FileText className="w-5 h-5 text-gray-600" />}
                className="shadow-md h-full p-0"
            >
                <div className="pt-2">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">Loading requests...</div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                            <CheckCircle className="w-16 h-16 text-gray-200 mb-4" />
                            <p className="text-lg font-medium text-gray-600">All caught up!</p>
                            <p>No '{filter}' leave requests to review.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 border-t border-gray-100 mt-2">
                            {filteredRequests.map(req => (
                                <div key={req._id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="mt-1">
                                            {getStatusIcon(req.status)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-gray-900 text-lg">{req.studentId?.fullName || req.studentId?.username || 'Unknown Student'}</h3>
                                                <span className="text-xs font-mono text-gray-500 border rounded px-1.5 py-0.5 bg-white">
                                                    {req.studentId?.registerNumber || 'N/A'}
                                                </span>
                                                <span className={`px-2 py-[2px] rounded text-xs font-bold uppercase border ${getStatusStyle(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mt-1.5 text-sm">
                                                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 rounded">
                                                    {req.leaveType} Leave
                                                </span>
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    from <strong className="text-gray-700">{new Date(req.startDate).toLocaleDateString()}</strong>
                                                    to <strong className="text-gray-700">{new Date(req.endDate).toLocaleDateString()}</strong>
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm text-gray-700 bg-white border border-gray-200 p-3 rounded shadow-sm max-w-2xl">
                                                "{req.reason}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                                        {req.status === 'Pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(req._id, 'Approved')}
                                                    className="w-full md:w-[120px] bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded shadow-sm transition-colors text-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                                                    className="w-full md:w-[120px] bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium py-1.5 px-3 rounded shadow-sm transition-colors text-sm"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="w-full md:w-[120px] bg-gray-100 text-gray-400 font-medium py-1.5 px-3 rounded text-sm cursor-not-allowed border outline-none"
                                            >
                                                Resolved
                                            </button>
                                        )}

                                        {req.attachmentUrl && (
                                            <button className="w-full md:w-[120px] flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium py-1.5 px-3 rounded transition-colors text-xs mt-1">
                                                <Download className="w-3.5 h-3.5" /> Proof
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default StudentLeaveRequests;
