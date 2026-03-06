import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Mail, Trash2, RotateCcw,
    Upload, Download, FileText, CheckCircle, AlertTriangle, X, Users
} from 'lucide-react';

interface Student {
    _id: string;
    username: string;
    fullName?: string;
    email: string;
    department: string;
    semester?: string;
    academicYear?: string;
    registerNumber?: string;
    batch?: string;
    section?: string;
    isActive: boolean;
    profileImage?: string;
}

interface BulkResult {
    success: number;
    failed: number;
    errors: string[];
}

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HODStudents = () => {
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext)!;

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkUpdateData, setBulkUpdateData] = useState({
        batch: '', section: '', academicYear: '', classAdvisor: '', isActive: ''
    });
    const [bulkUpdating, setBulkUpdating] = useState(false);

    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
    const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Single add form
    const [formData, setFormData] = useState<{
        username: string; fullName: string; email: string;
        password: string; registerNumber: string;
        semester: string; academicYear: string;
        profileImage: File | null;
    }>({
        username: '', fullName: '', email: '',
        password: 'password123', registerNumber: '',
        semester: '1', academicYear: '1st Year',
        profileImage: null
    });
    const [submitting, setSubmitting] = useState(false);

    // Bulk upload
    const fileRef = useRef<HTMLInputElement>(null);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);

    const showToast = (text: string, type: 'success' | 'error') => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 4000);
    };

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchStudents();
    }, [token]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            let url = `${API}/api/users?role=student&department=${user?.department}&status=all`;
            if (batchFilter) url += `&batch=${batchFilter}`;
            if (sectionFilter) url += `&section=${sectionFilter}`;

            const { data } = await axios.get(url, config);
            setStudents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Filtering ---
    useEffect(() => {
        // Trigger refetch when backend filters change
        fetchStudents();
    }, [batchFilter, sectionFilter]);

    // --- Bulk Update ---
    const handleSelectAll = () => {
        if (selectedIds.size === filteredStudents.length && filteredStudents.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredStudents.map(s => s._id)));
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const submitBulkUpdate = async () => {
        setBulkUpdating(true);
        try {
            const updates: any = {};
            if (bulkUpdateData.batch) updates.batch = bulkUpdateData.batch;
            if (bulkUpdateData.section) updates.section = bulkUpdateData.section;
            if (bulkUpdateData.academicYear) updates.academicYear = bulkUpdateData.academicYear;
            if (bulkUpdateData.classAdvisor) updates.classAdvisor = bulkUpdateData.classAdvisor;
            if (bulkUpdateData.isActive !== '') updates.isActive = bulkUpdateData.isActive === 'true';

            if (Object.keys(updates).length === 0) {
                showToast('Please specify at least one field to update', 'error');
                return;
            }

            const res = await axios.post(`${API}/api/users/bulk-update`, {
                studentIds: Array.from(selectedIds),
                updates
            }, config);

            showToast(res.data.message || 'Students updated successfully', 'success');
            setShowBulkModal(false);
            setBulkUpdateData({ batch: '', section: '', academicYear: '', classAdvisor: '', isActive: '' });
            setSelectedIds(new Set());
            fetchStudents();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Error updating students', 'error');
        } finally {
            setBulkUpdating(false);
        }
    };

    // --- Single Add ---
    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('username', formData.username);
            formDataToSubmit.append('fullName', formData.fullName);
            formDataToSubmit.append('email', formData.email);
            formDataToSubmit.append('password', formData.password);
            formDataToSubmit.append('role', 'student');
            formDataToSubmit.append('semester', formData.semester);
            formDataToSubmit.append('academicYear', formData.academicYear);
            formDataToSubmit.append('registerNumber', formData.registerNumber);
            formDataToSubmit.append('department', user?.department || '');
            if (formData.profileImage) {
                formDataToSubmit.append('profileImage', formData.profileImage);
            }

            await axios.post(`${API}/api/users`, formDataToSubmit, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setToast({ text: 'Student enrolled successfully!', type: 'success' });
            setFormData({
                username: '', fullName: '', email: '',
                password: 'password123', registerNumber: '',
                semester: '1', academicYear: '1st Year',
                profileImage: null
            });
            fetchStudents();
        } catch (err: any) {
            setToast({
                text: err.response?.data?.message || 'Error enrolling student. Please check fields.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    // --- Bulk CSV Upload ---
    const downloadTemplate = () => {
        const csv = 'username,fullName,email,registerNumber,semester,academicYear,password\n' +
            'john_doe,John Doe,john@example.com,2024CS001,1,1st Year,password123\n' +
            'jane_smith,Jane Smith,jane@example.com,2024CS002,1,1st Year,password123';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'students_template.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const handleBulkUpload = async () => {
        if (!csvFile) return;
        setBulkLoading(true);
        setBulkResult(null);
        try {
            const text = await csvFile.text();
            const lines = text.trim().split('\n').filter(Boolean);
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const col = (row: string[], name: string) => {
                const i = headers.indexOf(name);
                return i >= 0 ? row[i]?.trim() : '';
            };

            const results: BulkResult = { success: 0, failed: 0, errors: [] };

            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(',');
                const username = col(row, 'username');
                const email = col(row, 'email');

                if (!username || !email) {
                    results.failed++;
                    results.errors.push(`Row ${i + 1}: Missing username or email`);
                    continue;
                }

                try {
                    await axios.post(`${API}/api/users`, {
                        username,
                        fullName: col(row, 'fullname') || col(row, 'full_name') || col(row, 'name') || username,
                        email,
                        password: col(row, 'password') || 'password123',
                        registerNumber: col(row, 'registernumber') || col(row, 'register_number') || col(row, 'rollno') || '',
                        role: 'student',
                        semester: col(row, 'semester') || '1',
                        academicYear: col(row, 'academicyear') || col(row, 'academic_year') || '1st Year',
                        department: user?.department
                    }, {
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
                    });
                    results.success++;
                } catch (err: any) {
                    results.failed++;
                    results.errors.push(`Row ${i + 1} (${email}): ${err.response?.data?.message || 'Failed'}`);
                }
            }

            setBulkResult(results);
            if (results.success > 0) fetchStudents();
            setCsvFile(null);
            if (fileRef.current) fileRef.current.value = '';
        } catch (err: any) {
            showToast('Failed to process CSV file', 'error');
        } finally {
            setBulkLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deactivate this student?')) return;
        try {
            await axios.delete(`${API}/api/users/${id}`, config);
            fetchStudents();
        } catch { }
    };

    const handleReactivate = async (id: string) => {
        if (!confirm('Reactivate this student?')) return;
        try {
            await axios.put(`${API}/api/users/${id}`, { isActive: true }, config);
            fetchStudents();
        } catch { }
    };

    const filteredStudents = students.filter(s =>
        (s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (yearFilter === '' || s.academicYear === yearFilter)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 relative">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                    >
                        {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {toast.text}
                        <button onClick={() => setToast(null)}><X className="w-4 h-4 opacity-50 hover:opacity-100" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Update Modal */}
            <AnimatePresence>
                {showBulkModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Bulk Update Students ({selectedIds.size})</h3>
                                <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                                    Only fields filled below will be updated. Empty fields will remain unchanged.
                                </p>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Batch</label>
                                    <input type="text" placeholder="e.g. 2024-2028" value={bulkUpdateData.batch} onChange={e => setBulkUpdateData({ ...bulkUpdateData, batch: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Section</label>
                                    <input type="text" placeholder="e.g. A, B, C" value={bulkUpdateData.section} onChange={e => setBulkUpdateData({ ...bulkUpdateData, section: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Academic Year</label>
                                    <select value={bulkUpdateData.academicYear} onChange={e => setBulkUpdateData({ ...bulkUpdateData, academicYear: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300" >
                                        <option value="">-- No Change --</option>
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                                    <select value={bulkUpdateData.isActive} onChange={e => setBulkUpdateData({ ...bulkUpdateData, isActive: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300" >
                                        <option value="">-- No Change --</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button onClick={submitBulkUpdate} disabled={bulkUpdating} className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center">
                                    {bulkUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Update Selected'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Department Students</h1>
                    <p className="text-gray-500 text-sm mt-0.5">{user?.department} · {students.filter(s => s.isActive).length} active students</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {selectedIds.size > 0 && (
                        <span className="text-sm font-semibold text-indigo-600 mr-2">{selectedIds.size} selected</span>
                    )}
                    <button onClick={() => selectedIds.size > 0 ? setShowBulkModal(true) : showToast('Please select at least one student from the table below to bulk update.', 'error')}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                        Bulk Update
                    </button>
                    <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1"></div>
                    <span className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl hidden sm:inline-block">
                        {students.filter(s => s.isActive).length} Active
                    </span>
                    <span className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hidden sm:inline-block">
                        {students.length} Total
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel — Single / Bulk Add */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Tab Toggle */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('single')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${activeTab === 'single' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Plus className="w-4 h-4" /> Single Add
                            </button>
                            <button
                                onClick={() => setActiveTab('bulk')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${activeTab === 'bulk' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Upload className="w-4 h-4" /> Bulk Upload
                            </button>
                        </div>

                        {/* Single Add Form */}
                        {activeTab === 'single' && (
                            <div className="p-5">
                                <form onSubmit={handleAddStudent} className="space-y-3.5">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                                        <input type="text" placeholder="e.g. Ravi Kumar" required
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Username</label>
                                        <input type="text" placeholder="e.g. ravi_kumar" required
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <input type="email" placeholder="student@college.edu" required
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-9 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Register Number</label>
                                        <input type="text" placeholder="e.g. 2024CS001"
                                            value={formData.registerNumber}
                                            onChange={e => setFormData({ ...formData, registerNumber: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Profile Image</label>
                                        <input type="file" accept="image/*"
                                            onChange={e => setFormData({ ...formData, profileImage: e.target.files?.[0] || null })}
                                            className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Semester</label>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {SEMESTERS.map(s => (
                                                <button key={s} type="button"
                                                    onClick={() => setFormData({ ...formData, semester: s })}
                                                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${formData.semester === s
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                                                        }`}
                                                >
                                                    Sem {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Year of Study</label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {YEARS.map(y => (
                                                <button key={y} type="button"
                                                    onClick={() => setFormData({ ...formData, academicYear: y })}
                                                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${formData.academicYear === y
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                                                        }`}
                                                >
                                                    {y}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button type="submit" disabled={submitting}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enrolling...</>
                                        ) : (
                                            <><Plus className="w-4 h-4" /> Enroll Student</>
                                        )}
                                    </button>
                                    <p className="text-xs text-center text-gray-400">Default password: <span className="font-mono">password123</span></p>
                                </form>
                            </div>
                        )}

                        {/* Bulk Upload */}
                        {activeTab === 'bulk' && (
                            <div className="p-5 space-y-4">
                                {/* Template Download */}
                                <button onClick={downloadTemplate}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-indigo-300 hover:text-indigo-600 text-sm font-medium transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Download CSV Template
                                </button>

                                <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 space-y-1">
                                    <p className="font-semibold text-gray-500">CSV Format:</p>
                                    <p><span className="font-mono text-xs">username, fullName, email, registerNumber, semester, academicYear, password</span></p>
                                    <p>Department is auto-set to <span className="font-semibold text-gray-600">{user?.department}</span></p>
                                </div>

                                {/* File Input */}
                                <div
                                    className="relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    <FileText className="w-8 h-8 text-gray-300" />
                                    <p className="text-sm font-medium text-gray-500">
                                        {csvFile ? csvFile.name : 'Click to select CSV file'}
                                    </p>
                                    {csvFile && <p className="text-xs text-gray-400">{(csvFile.size / 1024).toFixed(1)} KB</p>}
                                    <input ref={fileRef} type="file" accept=".csv" className="hidden"
                                        onChange={e => { setCsvFile(e.target.files?.[0] || null); setBulkResult(null); }}
                                    />
                                </div>

                                <button onClick={handleBulkUpload} disabled={!csvFile || bulkLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                                >
                                    {bulkLoading ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                                    ) : (
                                        <><Upload className="w-4 h-4" /> Upload & Enroll</>
                                    )}
                                </button>

                                {/* Bulk Result */}
                                {bulkResult && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                                        <div className="flex gap-3">
                                            <div className="flex-1 text-center bg-green-50 border border-green-200 rounded-xl p-3">
                                                <p className="text-2xl font-bold text-green-600">{bulkResult.success}</p>
                                                <p className="text-xs text-green-700 font-medium">Enrolled</p>
                                            </div>
                                            <div className="flex-1 text-center bg-red-50 border border-red-200 rounded-xl p-3">
                                                <p className="text-2xl font-bold text-red-500">{bulkResult.failed}</p>
                                                <p className="text-xs text-red-600 font-medium">Failed</p>
                                            </div>
                                        </div>
                                        {bulkResult.errors.length > 0 && (
                                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 max-h-32 overflow-y-auto">
                                                {bulkResult.errors.map((err, i) => (
                                                    <p key={i} className="text-xs text-red-600 py-0.5">{err}</p>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel — Student List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Table header */}
                        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <h2 className="font-semibold text-gray-800 text-sm">Student Directory</h2>
                                <span className="text-xs text-gray-400">({filteredStudents.length})</span>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-48 pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                                    />
                                </div>
                                <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                                >
                                    <option value="">All Years</option>
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <input type="text" placeholder="Batch" value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
                                    className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent" />
                                <input type="text" placeholder="Sec" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
                                    className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent" />
                            </div>
                        </div>

                        {/* Selected count handled in header */}

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                                        <tr>
                                            <th className="px-4 py-3 text-center">
                                                <input type="checkbox"
                                                    checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            </th>
                                            <th className="px-5 py-3">Student</th>
                                            <th className="px-5 py-3">Register No</th>
                                            <th className="px-5 py-3">Email</th>
                                            <th className="px-5 py-3 text-center">Batch / Sec</th>
                                            <th className="px-5 py-3 text-center">Sem / Year</th>
                                            <th className="px-5 py-3 text-center">Status</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                                                    No students found. Start by enrolling one.
                                                </td>
                                            </tr>
                                        ) : filteredStudents.map((s, i) => (
                                            <motion.tr key={s._id}
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={`text-sm hover:bg-gray-50 cursor-pointer transition-colors ${!s.isActive ? 'bg-red-50/30' : ''}`}
                                                onClick={() => navigate(`/profile/${s._id}`)}
                                            >
                                                <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox"
                                                        checked={selectedIds.has(s._id)}
                                                        onChange={() => toggleSelection(s._id)}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        {s.profileImage ? (
                                                            <img src={`${API}${s.profileImage}`} alt={s.username}
                                                                className="w-8 h-8 rounded-xl object-cover" />
                                                        ) : (
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white ${s.isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-400'}`}>
                                                                {(s.fullName || s.username).charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{s.fullName || s.username}</p>
                                                            <p className="text-xs text-gray-400">@{s.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{s.registerNumber || '—'}</td>
                                                <td className="px-5 py-3.5 text-gray-500 max-w-[160px] truncate">{s.email}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {s.batch && <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 rounded">{s.batch}</span>}
                                                        {s.section && <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Sec {s.section}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                                            Sem {s.semester}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                                            {s.academicYear}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                        {s.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                                                    {s.isActive ? (
                                                        <button onClick={() => handleDelete(s._id)}
                                                            className="flex items-center gap-1 ml-auto text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Deactivate
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleReactivate(s._id)}
                                                            className="flex items-center gap-1 ml-auto text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <RotateCcw className="w-3 h-3" /> Reactivate
                                                        </button>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODStudents;
