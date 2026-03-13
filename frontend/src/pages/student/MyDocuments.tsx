import React, { useState, useEffect, useContext } from 'react';
import { Card } from "../../components/ui/Card";
import { AuthContext } from '../../context/AuthContext';
import { 
    Upload, FileText, FileBadge, 
    CreditCard, User, Shield, Receipt
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

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
                    <h1 className="text-2xl font-bold text-slate-900">Student Digital Vault</h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">Upload and manage your official certificates and fee receipts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="lg:col-span-1 border-gray-200">
                    <Card
                        title="Upload New Document"
                        action={<Upload className="w-5 h-5 text-slate-600" />}
                        className="shadow-sm border border-slate-200 p-0"
                    >
                        <div className="pt-2 px-6 pb-6 mt-4">
                            {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">{successMsg}</div>}
                            {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{errorMsg}</div>}

                            <form onSubmit={handleUploadDocument} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Document Category</label>
                                    <div className="flex p-0.5 bg-slate-100 rounded-md">
                                        <button
                                            type="button"
                                            onClick={() => { setCategory('Personal'); setDocumentType('Aadhaar Card'); }}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${category === 'Personal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <User className="w-3.5 h-3.5 inline-block mr-1.5" /> Personal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setCategory('Financial'); setDocumentType('Tuition Fee Receipt'); }}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${category === 'Financial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <Receipt className="w-3.5 h-3.5 inline-block mr-1.5" /> Financial
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Document Type *</label>
                                    <select
                                        required value={documentType} onChange={(e) => setDocumentType(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-medium transition-colors"
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
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Semester</label>
                                        <select value={semester} onChange={(e) => setSemester(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-medium transition-colors">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">File Upload (PDF/Image) *</label>
                                    <input
                                        id="file-upload"
                                        type="file" required
                                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm bg-slate-50 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer transition-colors"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <div className="mt-2 p-2 bg-slate-50 rounded-md flex items-center justify-between border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Academic Year</span>
                                        <span className="text-[10px] font-bold text-slate-900">{user?.academicYear || '2023-2024'}</span>
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading}
                                    className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
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
                        action={<FileBadge className="w-5 h-5 text-slate-600" />}
                        className="shadow-sm border border-slate-200 h-full p-0"
                    >
                        <div className="pt-2 max-h-[1000px] overflow-y-auto bg-slate-50/30">
                            {documents.length === 0 ? (
                                <div className="p-16 text-center text-slate-500">
                                    <Shield className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <p className="text-lg font-bold text-slate-700 mb-1">Vault is Empty</p>
                                    <p className="font-medium">You haven't uploaded any administrative documents yet.</p>
                                </div>
                            ) : (
                                <div className="p-4 space-y-10">
                                    {/* Personal Vault Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Personal Digital Vault</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {documents.filter(d => !d.category || d.category === 'Personal').map(doc => (
                                                <div key={doc._id} className="bg-white rounded-md border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className={`p-2 rounded-md bg-slate-50 text-slate-600 border border-slate-200`}>
                                                            {getCategoryIcon(doc.category, doc.documentType)}
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${getStatusStyle(doc.status)}`}>
                                                            {doc.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 text-sm mb-1">{doc.documentType}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mb-3">
                                                        <span>{doc.academicYear}</span>
                                                    </div>
                                                    {doc.rejectionReason && (
                                                        <div className="mb-3 text-[10px] text-red-700 bg-red-50 border border-red-200 p-2 rounded-md">
                                                            <span className="font-bold">Admin:</span> {doc.rejectionReason}
                                                        </div>
                                                    )}
                                                    <div className="mt-4 flex gap-2 w-full pt-3 border-t border-slate-100">
                                                        <a href={`${API_URL.replace('/api', '')}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-1.5 rounded-md text-[10px] font-bold text-center transition-colors uppercase tracking-wider">
                                                            Review File
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                            {documents.filter(d => !d.category || d.category === 'Personal').length === 0 && (
                                                <p className="text-xs text-slate-400 font-medium px-2">No personal documents found.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Financial Records Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-200">
                                                <Receipt className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Financial Records & Fee Receipts</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {documents.filter(d => d.category === 'Financial').map(doc => (
                                                <div key={doc._id} className="bg-white rounded-md border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border-l-4 border-l-emerald-500">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className={`p-2 rounded-md bg-emerald-50 text-emerald-600`}>
                                                            <CreditCard className="w-5 h-5" />
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${getStatusStyle(doc.status)}`}>
                                                            {doc.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 text-sm mb-1">{doc.documentType}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mb-3">
                                                        <span>Sem {doc.semester}</span> • <span>{doc.academicYear}</span>
                                                    </div>
                                                    <div className="mt-4 flex gap-2 w-full pt-3 border-t border-slate-100">
                                                        <a href={`${API_URL.replace('/api', '')}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200 py-1.5 rounded-md text-[10px] font-bold text-center transition-colors uppercase tracking-wider">
                                                            Print Receipt
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                            {documents.filter(d => d.category === 'Financial').length === 0 && (
                                                <p className="text-xs text-slate-400 font-medium px-2">No financial records found.</p>
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
