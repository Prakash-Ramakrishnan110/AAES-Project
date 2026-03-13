import { useState, useEffect } from 'react';
import { Card } from "../../components/ui/Card";
import { Clock, FileBadge, Download, Search, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const HODDocumentVerification = () => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Search & Filter
    const [yearFilter, setYearFilter] = useState('');
    const [docTypeFilter, setDocTypeFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Predefined document types for filtering
    const DOCUMENT_TYPES = [
        'Aadhaar Card',
        'PAN Card',
        '10th Marksheet',
        '12th Marksheet',
        'Transfer Certificate',
        'Community Certificate',
        'Income Certificate',
        'Tuition Fee Receipt',
        'Semester Fee Receipt',
        'Hostel Fee Receipt'
    ];
    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            // Simplified fetch: just get all documents
            const res = await axios.get(`${API_URL}/student-documents/department?status=All`, {
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

    const handleDeleteDocument = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this document? This will remove the file permanently for the student and advisor.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${API_URL}/student-documents/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setDocuments(prev => prev.filter(d => d._id !== id));
                alert('Document deleted successfully.');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document.');
        }
    };





    const handleDownloadAll = async (studentId: string, registerNumber: string) => {
        try {
            const token = localStorage.getItem('token');
            const requestUrl = `${API_URL}/student-documents/download-all/${studentId.trim()}`;
            
            // DIAGNOSTICS: Check if router is even reachable
            try {
                const pingRes = await axios.get(`${API_URL}/student-documents/test-ping`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('[ZIP] Router Ping Success:', pingRes.data);
            } catch (pErr) {
                console.warn('[ZIP] Router Ping Failed:', pErr);
                alert('Warning: Backend router seems unreachable. Check if server is running!');
            }

            console.log(`[ZIP] Requesting: ${requestUrl}`);
            const res = await axios.get(requestUrl, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            // Create a link to download the blob
            const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `${registerNumber}_Documents.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error: any) {
            console.error('Error downloading ZIP:', error);
            
            const errorMessage = 'The folder might be empty or a server error occurred.';
            
            // Try to extract error message from Blob if available
            if (error.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const jsonData = JSON.parse(reader.result as string);
                        if (jsonData.message) {
                            alert(`Failed to generate ZIP: ${jsonData.message}`);
                        } else {
                            alert(`Failed to generate ZIP. Server returned status ${error.response.status}`);
                        }
                    } catch (e) {
                        alert(`Failed to generate ZIP. Server returned status ${error.response.status}`);
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                alert(`Failed to generate ZIP. ${errorMessage}`);
            }
        }
    };

    const handleBulkDownload = async () => {
        if (filteredDocuments.length === 0) {
            alert('No documents found in the current filtered view.');
            return;
        }

        if (!window.confirm(`Do you want to download all ${filteredDocuments.length} documents matching your current filters?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const documentIds = filteredDocuments.map(d => d._id);

            if (documentIds.length === 0) {
                alert('No documents to download. Please adjust your filters.');
                return;
            }

            const res = await axios.post(`${API_URL}/student-documents/bulk-download`, { documentIds }, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            // Handle potential JSON error responses sent as blob
            if (res.data.type === 'application/json') {
                const text = await res.data.text();
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || 'Server error generating ZIP');
            }

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bulk_Documents_${new Date().toISOString().split('T')[0]}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            console.error('Error downloading bulk ZIP:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to generate bulk ZIP. Please check server logs.';
            alert(errorMessage);
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.studentId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.studentId?.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = yearFilter === '' || doc.academicYear === yearFilter;
        const matchesType = docTypeFilter === '' || doc.documentType === docTypeFilter;
        return matchesSearch && matchesYear && matchesType;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
                    <p className="text-slate-500 mt-1">Manage and audit student records, certificates, and fee receipts</p>
                </div>
            </div>

            <Card
                title="Verification Queue"
                action={<FileBadge className="w-5 h-5 text-slate-600" />}
                className="shadow-sm border-slate-200 h-full p-0"
            >
                <div className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Verification Queue</h2>
                            <p className="text-sm text-slate-500">Manage and audit student records, certificates, and fee receipts</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-xs font-bold border border-slate-200 uppercase tracking-wider">
                                <FileBadge className="w-4 h-4" />
                                Management View
                            </div>
                            <button
                                onClick={handleBulkDownload}
                                disabled={filteredDocuments.length === 0}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-md flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download Filtered ({filteredDocuments.length})
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search student or document type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors outline-none"
                            />
                        </div>

                        <select
                            value={docTypeFilter}
                            onChange={(e) => setDocTypeFilter(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none cursor-pointer transition-colors"
                        >
                            <option value="">All Document Types</option>
                            {DOCUMENT_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setYearFilter('')}
                            className={`px-5 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-colors border ${yearFilter === '' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        >
                            All Years
                        </button>
                        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(year => (
                            <button
                                key={year}
                                onClick={() => setYearFilter(year)}
                                className={`px-5 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-colors border ${yearFilter === year ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rounded-b-[inherit]">
                    {isLoading ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 p-12 text-center text-slate-500 font-medium">Loading documents from secure vault...</div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 p-16 text-center text-slate-500">
                            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-lg font-bold text-slate-700">No documents found.</p>
                            <p className="text-sm">Try adjusted your search or check back later.</p>
                        </div>
                    ) : (
                        filteredDocuments.map(doc => (
                            <div key={doc._id} className="bg-white rounded-md border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-slate-300 transition-colors">
                                <div className="absolute top-0 w-full h-1 bg-slate-900 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300"></div>

                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-100 p-2.5 rounded-md text-slate-700 border border-slate-200">
                                                <FileBadge className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 leading-tight text-sm">{doc.documentType}</h3>
                                                <div className="text-xs text-slate-500 mt-1 font-medium">Sem {doc.semester} • {doc.academicYear}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteDocument(doc._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Delete Document"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                                        <div className="font-bold text-slate-800 text-sm">{doc.studentId?.fullName}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{doc.studentId?.registerNumber}</div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <a
                                            href={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `${API_URL.replace('/api', '')}${doc.fileUrl?.startsWith('/') ? doc.fileUrl : `/${doc.fileUrl}`}`}
                                            target="_blank" rel="noreferrer"
                                            className="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold py-2 rounded-md shadow-sm transition-colors text-xs uppercase tracking-wider"
                                        >
                                            <Download className="w-3.5 h-3.5" /> View File
                                        </a>
                                        <button
                                            onClick={() => handleDownloadAll(doc.studentId?._id, doc.studentId?.registerNumber)}
                                            className="flex-1 flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-md shadow-sm transition-colors text-xs uppercase tracking-wider"
                                            title="Download all documents for this student"
                                        >
                                            <FileBadge className="w-3.5 h-3.5" /> Download All
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 bg-slate-50/50 p-4 shrink-0 mt-auto">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200`}>
                                            File Available
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono font-medium">
                                            Securely Stored
                                        </span>
                                    </div>
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
