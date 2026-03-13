import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Upload, Trash2, FileText, FileImage, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudyResources = () => {
    const { user } = useContext(AuthContext)!;
    const [materials, setMaterials] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        subjectId: '',
        title: '',
        unit: '',
        type: 'Lecture Notes',
        academicYear: '2023-2024',
        semester: '1'
    });
    const [file, setFile] = useState<File | null>(null);

    const resourceTypes = ['Lecture Notes', 'Important Questions', 'PYQ', 'Model Paper'];

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Watch for subject selection to fetch materials
    useEffect(() => {
        if (formData.subjectId) {
            fetchMaterials(formData.subjectId);
        } else {
            setMaterials([]);
        }
    }, [formData.subjectId]);

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            // Assuming the staff might want to upload to any assigned subject.
            // Adjust endpoint if needed to match Staff's restricted subjects.
            const res = await axios.get(`${API}/api/subjects`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Only show subjects assigned to this staff if 'teacher' field matches.
            // Assuming 'teacher._id' or similar exists, else show all for now.
            const staffSubjects = res.data.filter((s: any) => s.teacher === user?._id || s.teacher?._id === user?._id);
            // Fallback to all subjects if strict assignment isn't loaded/enforced here for simplicity
            const displaySubjects = staffSubjects.length > 0 ? staffSubjects : res.data;

            setSubjects(displaySubjects);
            if (displaySubjects.length > 0) {
                setFormData(prev => ({ ...prev, subjectId: displaySubjects[0]._id }));
            }
            setIsLoading(false);
        } catch (err: any) {
            console.error('Error fetching subjects:', err);
            setError('Failed to load subjects.');
            setIsLoading(false);
        }
    };

    const fetchMaterials = async (subjectId: string) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Using the new study-materials endpoint
            const res = await axios.get(`${API}/api/study-materials/subject/${subjectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(res.data);
        } catch (err: any) {
            console.error('Error fetching materials:', err);
            setMaterials([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setError('');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        if (!formData.subjectId || !formData.title || !formData.unit) {
            setError('Please fill in all required fields');
            return;
        }

        setIsUploading(true);

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('subjectId', formData.subjectId);
        uploadData.append('title', formData.title);
        uploadData.append('unit', formData.unit);
        uploadData.append('type', formData.type);
        uploadData.append('academicYear', formData.academicYear);
        uploadData.append('semester', formData.semester);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/study-materials/upload`, uploadData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Study material uploaded and processed with AI successfully.');
            setFile(null);
            setFormData(prev => ({ ...prev, title: '', unit: '' }));

            fetchMaterials(formData.subjectId);

            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            console.error('Upload Error:', err);
            setError(err.response?.data?.message || 'Failed to upload material');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API}/api/study-materials/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(materials.filter(m => m._id !== id));
            setSuccess('Material deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Delete Error:', err);
            setError('Failed to delete material');
        }
    };

    const getFileIcon = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
        if (ext === 'doc' || ext === 'docx') return <FileText className="w-5 h-5 text-blue-500" />;
        if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return <ImageIcon className="w-5 h-5 text-green-500" />;
        return <FileText className="w-5 h-5 text-gray-500" />;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Study Resources (AAES AI)</h1>
                    <p className="text-gray-500 text-sm mt-1">Upload notes, question papers, and materials to be processed by AAES AI for student doubt resolution.</p>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">{error}</div>}
            {success && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-sm font-medium">{success}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Upload Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-indigo-600" /> Upload Material
                    </h2>

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                            <select
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                                required
                            >
                                <option value="" disabled>Select Subject</option>
                                {subjects.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Chapter 1: Introduction"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit/Chapter</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Unit 1"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                                >
                                    {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Academic Year</label>
                                <input
                                    type="text"
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 2024-2025"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester</label>
                                <select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document File</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:border-indigo-400 transition-colors bg-gray-50 hover:bg-indigo-50/30">
                                <div className="space-y-1 text-center">
                                    <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 justify-center mt-2">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                            <span>Click to browse files</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, JPG up to 10MB</p>
                                    {file && <p className="text-sm font-semibold text-indigo-600 truncate max-w-[200px] mt-3 bg-indigo-50 inline-block px-3 py-1 rounded-full">{file.name}</p>}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isUploading}
                            disabled={!file || !formData.subjectId || isUploading}
                            className="w-full bg-indigo-600 text-white rounded-xl py-3 mt-6 font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
                        >
                            {isUploading ? 'Uploading & AI Extracting...' : 'Upload & Process with AI'}
                        </Button>
                    </form>
                </div>

                {/* Uploaded Materials List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" /> Subject Library
                            </h2>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {materials.length} Document(s) active
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-gray-900 font-semibold mb-1">No materials yet</h3>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto">Upload course materials, question banks, or notes to populate the AI Assistant's knowledge base.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {materials.map((mat) => (
                                    <div key={mat._id} className="relative p-5 bg-white border border-gray-200 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                                    {getFileIcon(mat.fileUrl)}
                                                </div>
                                                <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                                                    {mat.type}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight mb-2" title={mat.title}>{mat.title}</h4>

                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                    {mat.unit}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                                                Extracted text ready for AI queries. Uploaded by {mat.uploadedBy?.fullName || "Staff"}.
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                            <span className="text-xs text-gray-400">
                                                {new Date(mat.createdAt).toLocaleDateString()}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`${API}${mat.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                    title="View Source File"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(mat._id)}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                    title="Delete Material"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyResources;
