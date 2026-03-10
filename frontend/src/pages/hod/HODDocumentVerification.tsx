import { useState, useEffect } from 'react';
import Card from "../../components/ui/Card";
import { CheckCircle, Clock, XCircle, FileBadge, Download, Search } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const HODDocumentVerification = () => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Pending');
    const [isRejecting, setIsRejecting] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, [filterStatus]);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/student-documents/department?status=${filterStatus}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setDocuments(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching department documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyStatus = async (id: string, newStatus: string) => {
        if (newStatus === 'Rejected' && !rejectionReason.trim()) {
            alert('Please provide a rejection reason within the input box below the Reject button before submitting.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/student-documents/${id}/verify`,
                { status: newStatus, rejectionReason: newStatus === 'Rejected' ? rejectionReason : undefined },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                // Remove from current view if filtering by 'Pending', else update
                if (filterStatus === 'Pending') {
                    setDocuments(prev => prev.filter(d => d._id !== id));
                } else {
                    setDocuments(prev => prev.map(d => d._id === id ? { ...d, status: newStatus, rejectionReason: newStatus === 'Rejected' ? rejectionReason : null, verifiedBy: { name: 'You' } } : d));
                }

                setIsRejecting(null);
                setRejectionReason('');
            }
        } catch (error) {
            console.error(`Error verifying document:`, error);
            alert('Failed to update verification status.');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Verified': return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Verified': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'Rejected': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch =
            doc.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.studentId?.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
                    <p className="text-gray-500 mt-1">Verify official student records, certificates, and fee receipts</p>
                </div>
            </div>

            <Card
                title="Verification Queue"
                action={<FileBadge className="w-5 h-5 text-gray-600" />}
                className="shadow-md h-full p-0"
            >
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search student or document type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <div className="flex bg-white rounded border border-gray-200 p-1 w-fit">
                        {['All', 'Pending', 'Verified', 'Rejected'].map(status => (
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

                <div className="p-4 bg-gray-50/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 p-12 text-center text-gray-500">Loading documents from secure vault...</div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 p-16 text-center text-gray-400">
                            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-lg font-medium text-gray-600">Verification complete.</p>
                            <p>No '{filterStatus}' documents matched your search parameter.</p>
                        </div>
                    ) : (
                        filteredDocuments.map(doc => (
                            <div key={doc._id} className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 w-full h-1 bg-indigo-500 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300"></div>

                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-700">
                                                <FileBadge className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 leading-tight">{doc.documentType}</h3>
                                                <div className="text-xs text-gray-500 mt-1">Sem {doc.semester} • {doc.academicYear}</div>
                                            </div>
                                        </div>
                                        {getStatusIcon(doc.status)}
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                        <div className="font-semibold text-gray-800">{doc.studentId?.name}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{doc.studentId?.registerNumber}</div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <a
                                            href={doc.fileUrl} target="_blank" rel="noreferrer"
                                            className="w-full flex justify-center items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 rounded shadow-sm transition-colors text-sm"
                                        >
                                            <Download className="w-4 h-4" /> View File
                                        </a>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 bg-gray-50/50 p-4 shrink-0">
                                    {doc.status === 'Pending' ? (
                                        <div className="flex flex-col gap-2">
                                            {isRejecting === doc._id ? (
                                                <div className="animate-in fade-in slide-in-from-top-1">
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        placeholder="Reason for rejection..."
                                                        className="w-full px-3 py-1.5 border border-red-300 rounded text-sm mb-2 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleVerifyStatus(doc._id, 'Rejected')}
                                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 rounded transition-colors text-xs"
                                                        >
                                                            Confirm Reject
                                                        </button>
                                                        <button
                                                            onClick={() => setIsRejecting(null)}
                                                            className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1.5 rounded transition-colors text-xs"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleVerifyStatus(doc._id, 'Verified')}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded transition-colors text-sm shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => { setIsRejecting(doc._id); setRejectionReason(''); }}
                                                        className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium py-2 rounded transition-colors text-sm shadow-sm"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${getStatusStyle(doc.status)}`}>
                                                    {doc.status}
                                                </span>
                                                <span className="text-xs text-gray-500">by <span className="font-semibold text-gray-700">{doc.verifiedBy?.name || 'Admin'}</span></span>
                                            </div>
                                            {doc.status === 'Rejected' && (
                                                <div className="text-xs text-red-700 leading-tight">
                                                    <span className="font-semibold">Reason:</span> {doc.rejectionReason}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default HODDocumentVerification;
