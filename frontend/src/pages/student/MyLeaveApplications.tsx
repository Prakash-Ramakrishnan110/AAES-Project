import React, { useState, useEffect } from 'react';
import Card from "../../components/ui/Card";
import { Plus, CheckCircle, Clock, XCircle, FileText, Upload } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const MyLeaveApplications = () => {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form Inputs
    const [leaveType, setLeaveType] = useState('Casual');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchMyLeaves();
    }, []);

    const fetchMyLeaves = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/student-leaves/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setLeaves(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching leaves:', error);
        }
    };

    const handleApplyLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/student-leaves/me`, {
                leaveType,
                startDate,
                endDate,
                reason,
                attachmentUrl: '' // File upload placeholder
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setSuccessMsg('Leave application submitted successfully.');
                setLeaveType('Casual');
                setStartDate('');
                setEndDate('');
                setReason('');
                fetchMyLeaves();
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Failed to submit leave application.');
        } finally {
            setIsLoading(false);
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

    return (
        <div className="space-y-10 pb-10">
            {/* Full-Width Standardized Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-indigo-600 rounded-lg">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Absence Telemetry</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
                                Leave Applications
                            </h1>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                Manage institutional absence protocols and approval tracking
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Application Form */}
                    <div className="lg:col-span-1 border-gray-200">
                        <Card
                            title="New Leave Request"
                            action={<Plus className="w-5 h-5 text-indigo-600" />}
                            className="shadow-md border-t-4 border-t-indigo-600 p-0"
                        >
                            <div className="pt-2 px-6 pb-6 mt-4">
                                {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">{successMsg}</div>}
                                {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{errorMsg}</div>}

                                <form onSubmit={handleApplyLeave} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                                        <select
                                            required value={leaveType} onChange={(e) => setLeaveType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Casual">Casual Leave</option>
                                            <option value="Medical">Medical Leave</option>
                                            <option value="OD">On-Duty (OD)</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">From *</label>
                                            <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
                                            <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave *</label>
                                        <textarea required value={reason} onChange={(e) => setReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                                            placeholder="Briefly state your reason..." />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-gray-500 opacity-60">Attachment (Optional Proof)</label>
                                        <div className="flex items-center gap-2 border border-gray-300 border-dashed rounded-md px-3 py-2 bg-gray-50 justify-center opacity-60 cursor-not-allowed">
                                            <Upload className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-500 font-medium">Upload File (PDF/Image)</span>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={isLoading}
                                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm disabled:opacity-50">
                                        {isLoading ? 'Submitting...' : 'Submit to Advisor'}
                                    </button>
                                </form>
                            </div>
                        </Card>
                    </div>

                    {/* Leave History List */}
                    <div className="lg:col-span-2">
                        <Card
                            title="History & Status"
                            action={<FileText className="w-5 h-5 text-gray-600" />}
                            className="shadow-md h-full p-0"
                        >
                            <div className="pt-2 max-h-[600px] overflow-y-auto">
                                {leaves.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">
                                        <p>You haven't applied for any leaves yet.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {leaves.map(req => (
                                            <div key={req._id} className="p-5 hover:bg-gray-50 transition-colors flex gap-4">
                                                <div className="mt-1">
                                                    {getStatusIcon(req.status)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 text-lg">{req.leaveType} Leave</h3>
                                                            <div className="text-sm text-gray-600 mt-1 bg-gray-100 px-2 py-0.5 rounded-md inline-block">
                                                                {new Date(req.startDate).toLocaleDateString()}  -  {new Date(req.endDate).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${getStatusStyle(req.status)}`}>
                                                            {req.status}
                                                        </span>
                                                    </div>
                                                    <p className="mt-3 text-sm text-gray-700 bg-white border border-gray-200 p-3 rounded-md shadow-sm">
                                                        "{req.reason}"
                                                    </p>
                                                    {req.remarks && (
                                                        <div className="mt-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 p-2 text-xs rounded">
                                                            <span className="font-bold">Advisor Notes:</span> {req.remarks}
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] text-gray-400 font-mono mt-3 uppercase tracking-wider">
                                                        Submitted on {new Date(req.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyLeaveApplications;
