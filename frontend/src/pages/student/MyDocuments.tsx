import React, { useState, useEffect, useContext } from 'react';
import Card from "../../components/ui/Card";
import { AuthContext } from '../../context/AuthContext';
import { 
    Upload, FileText, FileBadge, 
    CreditCard, User, Shield, Receipt
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const MyDocuments = () => {
    const { user } = useContext(AuthContext)!;
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form Inputs
    const [category, setCategory] = useState('Personal');
    const [documentType, setDocumentType] = useState('Aadhaar Card');
    const [semester, setSemester] = useState(user?.semester || '5');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchMyDocuments();
    }, []);

    const fetchMyDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/student-documents/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setDocuments(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleUploadDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!selectedFile) {
            setErrorMsg('Please select a file to upload.');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('category', category);
            formData.append('documentType', documentType);
            formData.append('semester', semester.toString());
            formData.append('academicYear', user?.academicYear || '2023-2024');
            formData.append('file', selectedFile);

            const res = await axios.post(`${API_URL}/student-documents/me`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                setSuccessMsg('Document securely uploaded and sent for administrative verification.');
                setSelectedFile(null);
                // Reset file input
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                fetchMyDocuments();
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (error: any) {
            const serverData = error.response?.data;
            const message = serverData?.message || 'Failed to upload document.';
            const debugInfo = serverData?.debug ? ` \nDEBUG: ${serverData.debug.split('\n')[0]}` : '';
            setErrorMsg(`${message}${debugInfo}`);
        } finally {
            setIsLoading(false);
        }
    };


    const getCategoryIcon = (cat: string, type: string) => {
        if (cat === 'Financial') return <CreditCard className="w-5 h-5" />;
        if (type.includes('Aadhaar') || type.includes('TC') || type.includes('Photo')) return <User className="w-5 h-5" />;
        return <FileText className="w-5 h-5" />;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Verified': return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Student Digital Vault</h1>
                    <p className="text-gray-500 mt-1">Upload and manage your official certificates and fee receipts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="lg:col-span-1 border-gray-200">
                    <Card
                        title="Upload New Document"
                        action={<Upload className="w-5 h-5 text-indigo-600" />}
                        className="shadow-md border-t-4 border-t-indigo-600 p-0"
                    >
                        <div className="pt-2 px-6 pb-6 mt-4">
                            {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">{successMsg}</div>}
                            {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{errorMsg}</div>}

                            <form onSubmit={handleUploadDocument} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 text-[11px] uppercase tracking-wider">Document Category</label>
                                    <div className="flex p-0.5 bg-gray-100 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => { setCategory('Personal'); setDocumentType('Aadhaar Card'); }}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${category === 'Personal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <User className="w-3.5 h-3.5 inline-block mr-1.5" /> Personal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setCategory('Financial'); setDocumentType('Tuition Fee Receipt'); }}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${category === 'Financial' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <Receipt className="w-3.5 h-3.5 inline-block mr-1.5" /> Financial
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                                    <select
                                        required value={documentType} onChange={(e) => setDocumentType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                    >
                                        {category === 'Personal' ? (
                                            <>
                                                <option value="Aadhaar Card">Aadhaar Card Copy</option>
                                                <option value="TC">Transfer Certificate (TC)</option>
                                                <option value="Bonafide">Bonafide Request Form</option>
                                                <option value="Medical Certificate">Medical Certificate</option>
                                                <option value="Profile Photo">Passport Size Photo</option>
                                                <option value="Tenth Marksheet">10th Marksheet</option>
                                                <option value="Twelfth Marksheet">12th Marksheet</option>
                                                <option value="Other">Other Personal Doc</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Tuition Fee Receipt">Tuition Fee Receipt</option>
                                                <option value="Semester Fee Receipt">Semester Fee Receipt</option>
                                                <option value="Exam Fee Receipt">Exam Fee Receipt</option>
                                                <option value="Bus Fee Receipt">Bus/Transport Fee</option>
                                                <option value="Library Fine">Library Fine Receipt</option>
                                                <option value="Hostel Fee">Hostel Fee Receipt</option>
                                                <option value="Other Fee">Other Financial Record</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                        <select value={semester} onChange={(e) => setSemester(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">File Upload (PDF/Image) *</label>
                                    <input
                                        id="file-upload"
                                        type="file" required
                                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-blue-50/50 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <div className="mt-2 p-2 bg-indigo-50 rounded-lg flex items-center justify-between border border-indigo-100">
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase">Academic Year</span>
                                        <span className="text-[10px] font-black text-slate-700">{user?.academicYear || '2023-2024'}</span>
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading}
                                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                    <Upload className="w-4 h-4" /> {isLoading ? 'Securely Uploading...' : 'Upload & Verify'}
                                </button>
                            </form>
                        </div>
                    </Card>
                </div>

                {/* Secure Vault List */}
                <div className="lg:col-span-2">
                    <Card
                        title="My Uploaded Documents"
                        action={<FileBadge className="w-5 h-5 text-gray-600" />}
                        className="shadow-md h-full p-0"
                    >
                        <div className="pt-2 max-h-[1000px] overflow-y-auto bg-gray-50/30">
                            {documents.length === 0 ? (
                                <div className="p-16 text-center text-gray-500">
                                    <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-700 mb-1">Vault is Empty</p>
                                    <p>You haven't uploaded any administrative documents yet.</p>
                                </div>
                            ) : (
                                <div className="p-4 space-y-10">
                                    {/* Personal Vault Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Personal Digital Vault</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {documents.filter(d => !d.category || d.category === 'Personal').map(doc => (
                                                <div key={doc._id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className={`p-2 rounded-md bg-indigo-50 text-indigo-600`}>
                                                            {getCategoryIcon(doc.category, doc.documentType)}
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${getStatusStyle(doc.status)}`}>
                                                            {doc.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{doc.documentType}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium mb-3">
                                                        <span>{doc.academicYear}</span>
                                                    </div>
                                                    {doc.rejectionReason && (
                                                        <div className="mb-3 text-[10px] text-red-700 bg-red-50 border border-red-100 p-2 rounded">
                                                            <span className="font-bold">Admin:</span> {doc.rejectionReason}
                                                        </div>
                                                    )}
                                                    <div className="mt-4 flex gap-2 w-full pt-3 border-t border-gray-100">
                                                        <a href={`${API_URL.replace('/api', '')}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="flex-1 bg-gray-50 hover:bg-indigo-50 text-indigo-700 border border-indigo-200 py-1.5 rounded text-[10px] font-bold text-center transition-colors uppercase tracking-wider">
                                                            Review File
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                            {documents.filter(d => !d.category || d.category === 'Personal').length === 0 && (
                                                <p className="text-xs text-gray-400 italic px-2">No personal documents found.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Financial Records Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                                <Receipt className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Financial Records & Fee Receipts</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {documents.filter(d => d.category === 'Financial').map(doc => (
                                                <div key={doc._id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border-l-4 border-l-emerald-500">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className={`p-2 rounded-md bg-emerald-50 text-emerald-600`}>
                                                            <CreditCard className="w-5 h-5" />
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${getStatusStyle(doc.status)}`}>
                                                            {doc.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{doc.documentType}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium mb-3">
                                                        <span>Sem {doc.semester}</span> • <span>{doc.academicYear}</span>
                                                    </div>
                                                    <div className="mt-4 flex gap-2 w-full pt-3 border-t border-gray-100">
                                                        <a href={`${API_URL.replace('/api', '')}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="flex-1 bg-gray-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200 py-1.5 rounded text-[10px] font-bold text-center transition-colors uppercase tracking-wider">
                                                            Print Receipt
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                            {documents.filter(d => d.category === 'Financial').length === 0 && (
                                                <p className="text-xs text-gray-400 italic px-2">No financial records found.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MyDocuments;
