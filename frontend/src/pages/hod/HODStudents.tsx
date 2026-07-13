import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Mail, Trash2, RotateCcw,
    Upload, Download, FileText, CheckCircle, AlertTriangle, X, Users, XCircle, Settings
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
    const [showInactive, setShowInactive] = useState(false);

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkUpdateData, setBulkUpdateData] = useState({
        batch: '', section: '', academicYear: '', classAdvisor: '', isActive: ''
    });
    const [bulkUpdating, setBulkUpdating] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editStudentId, setEditStudentId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
    const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Single add form
    const [formData, setFormData] = useState<{
        username: string; fullName: string; email: string;
        password: string; registerNumber: string;
        semester: string; academicYear: string;
        batch: string; section: string;
        profileImage: File | null;
    }>({
        username: '', fullName: '', email: '',
        password: 'password123', registerNumber: '',
        semester: '1', academicYear: '1st Year',
        batch: '', section: '',
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
            let url = `${API}/api/users?role=student&department=${encodeURIComponent(user?.department || '')}&status=all`;
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

    // --- Single Add/Update ---
    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const configWithMultipart = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const formDataToSubmit = new FormData();
            formDataToSubmit.append('username', formData.username);
            formDataToSubmit.append('fullName', formData.fullName);
            formDataToSubmit.append('email', formData.email);
            if (!isEditing) formDataToSubmit.append('password', formData.password);
            formDataToSubmit.append('role', 'student');
            formDataToSubmit.append('semester', formData.semester);
            formDataToSubmit.append('academicYear', formData.academicYear);
            formDataToSubmit.append('registerNumber', formData.registerNumber);
            formDataToSubmit.append('batch', formData.batch);
            formDataToSubmit.append('section', formData.section);
            formDataToSubmit.append('department', user?.department || '');
            if (formData.profileImage) {
                formDataToSubmit.append('profileImage', formData.profileImage);
            }

            if (isEditing && editStudentId) {
                await axios.put(`${API}/api/users/${editStudentId}`, formDataToSubmit, configWithMultipart);
                showToast('Student updated successfully!', 'success');
                setIsEditing(false);
                setEditStudentId(null);
            } else {
                await axios.post(`${API}/api/users`, formDataToSubmit, configWithMultipart);
                showToast('Student enrolled successfully!', 'success');
            }

            setFormData({
                username: '', fullName: '', email: '',
                password: 'password123', registerNumber: '',
                semester: '1', academicYear: '1st Year',
                batch: '', section: '',
                profileImage: null
            });
            fetchStudents();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Error processing student details.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (s: Student) => {
        setIsEditing(true);
        setEditStudentId(s._id);
        setActiveTab('single');
        setFormData({
            username: s.username,
            fullName: s.fullName || '',
            email: s.email,
            password: '', // Password not editable here for security
            registerNumber: s.registerNumber || '',
            semester: s.semester || '1',
            academicYear: s.academicYear || '1st Year',
            batch: s.batch || '',
            section: s.section || '',
            profileImage: null // Don't pre-fill file
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditStudentId(null);
        setFormData({
            username: '', fullName: '', email: '',
            password: 'password123', registerNumber: '',
            semester: '1', academicYear: '1st Year',
            batch: '', section: '',
            profileImage: null
        });
    };

    // --- Bulk CSV Upload ---
    const downloadTemplate = () => {
        const csv = 'username,fullName,email,registerNumber,semester,academicYear,batch,section,password\n' +
            'john_doe,John Doe,john@example.com,2024CS001,1,1st Year,2024-2028,A,password123\n' +
            'jane_smith,Jane Smith,jane@example.com,2024CS002,1,1st Year,2024-2028,B,password123';
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
                        batch: col(row, 'batch') || '',
                        section: col(row, 'section') || '',
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
        if (!confirm('Are you sure you want to deactivate this student? They remain in database but cannot access dashboard.')) return;
        try {
            await axios.delete(`${API}/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchStudents();
            showToast('Student deactivated successfully', 'success');
        } catch (error) { showToast('Error deactivating student', 'error'); }
    };

    const handlePermanentDelete = async (id: string) => {
        if (!confirm('CRITICAL: Permanently delete this student? This removes ALL records (attendance, marks, submissions) forever.')) return;
        if (!confirm('This is irreversible. Final confirmation to PERMANENTLY DELETE student?')) return;
        try {
            await axios.delete(`${API}/api/users/${id}?permanent=true`, { headers: { Authorization: `Bearer ${token}` } });
            fetchStudents();
            showToast('Student permanently deleted', 'success');
        } catch (error) { showToast('Error deleting student', 'error'); }
    };

    const handleReactivate = async (id: string) => {
        if (!confirm('Reactivate this student?')) return;
        try {
            await axios.put(`${API}/api/users/${id}`, { isActive: true }, config);
            fetchStudents();
        } catch (error) { console.error(error); }
    };

    const filteredStudents = students.filter(s =>
    ((s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (yearFilter === '' || s.academicYear === yearFilter) &&
        (showInactive || s.isActive))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 relative">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-md shadow-lg text-sm font-bold border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}
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
                        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-md shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-6"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-bold text-slate-900">Bulk Update Students ({selectedIds.size})</h3>
                                <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-amber-700 font-bold bg-amber-50 p-3 rounded-md border border-amber-200">
                                    Only fields filled below will be updated. Empty fields will remain unchanged.
                                </p>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Batch</label>
                                    <input type="text" placeholder="e.g. 2024-2028" value={bulkUpdateData.batch} onChange={e => setBulkUpdateData({ ...bulkUpdateData, batch: e.target.value })}
                                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Section</label>
                                    <input type="text" placeholder="e.g. A, B, C" value={bulkUpdateData.section} onChange={e => setBulkUpdateData({ ...bulkUpdateData, section: e.target.value })}
                                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Academic Year</label>
                                    <select value={bulkUpdateData.academicYear} onChange={e => setBulkUpdateData({ ...bulkUpdateData, academicYear: e.target.value })}
                                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors" >
                                        <option value="">-- No Change --</option>
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                                    <select value={bulkUpdateData.isActive} onChange={e => setBulkUpdateData({ ...bulkUpdateData, isActive: e.target.value })}
                                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors" >
                                        <option value="">-- No Change --</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button onClick={() => setShowBulkModal(false)} className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                                    Cancel
                                </button>
                                <button onClick={submitBulkUpdate} disabled={bulkUpdating} className="flex-1 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center justify-center">
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
                    <h1 className="text-2xl font-bold text-slate-900">Department Students</h1>
                    <p className="text-slate-500 text-sm mt-0.5 font-medium">{user?.department} · {students.filter(s => s.isActive).length} active students</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {selectedIds.size > 0 && (
                        <span className="text-sm font-bold text-slate-800 mr-2 border border-slate-300 bg-slate-100 px-3 py-1 rounded-md">{selectedIds.size} selected</span>
                    )}
                    <button onClick={() => selectedIds.size > 0 ? setShowBulkModal(true) : showToast('Please select at least one student from the table below to bulk update.', 'error')}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-md hover:bg-slate-800 transition-colors shadow-sm">
                        Bulk Update
                    </button>
                    <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>
                    <span className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-md shadow-sm hidden sm:inline-block">
                        {students.filter(s => s.isActive).length} Active
                    </span>
                    <span className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-md shadow-sm hidden sm:inline-block">
                        {students.length} Total
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel — Single / Bulk Add */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Tab Toggle */}
                    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setActiveTab('single')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${activeTab === 'single' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                <Plus className="w-4 h-4" /> {isEditing ? 'Editing Student' : 'Single Add'}
                            </button>
                            <button
                                onClick={() => setActiveTab('bulk')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${activeTab === 'bulk' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                <Upload className="w-4 h-4" /> Bulk Upload
                            </button>
                        </div>

                        {/* Single Add Form */}
                        {activeTab === 'single' && (
                            <div className="p-5">
                                <form onSubmit={handleAddStudent} className="space-y-3.5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                        <input type="text" placeholder="e.g. Ravi Kumar" required
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                                        <input type="text" placeholder="e.g. ravi_kumar" required
                                            disabled={isEditing}
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <input type="email" placeholder="student@college.edu" required
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-9 border border-slate-300 rounded-md px-3.5 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Register Number</label>
                                        <input type="text" placeholder="e.g. 2024CS001"
                                            value={formData.registerNumber}
                                            onChange={e => setFormData({ ...formData, registerNumber: e.target.value })}
                                            className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Batch</label>
                                            <input type="text" placeholder="e.g. 2024-2028"
                                                value={formData.batch}
                                                onChange={e => setFormData({ ...formData, batch: e.target.value })}
                                                className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Section</label>
                                            <input type="text" placeholder="e.g. A"
                                                value={formData.section}
                                                onChange={e => setFormData({ ...formData, section: e.target.value })}
                                                className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Profile Image</label>
                                        <input type="file" accept="image/*"
                                            onChange={e => setFormData({ ...formData, profileImage: e.target.files?.[0] || null })}
                                            className="w-full text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Semester</label>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {SEMESTERS.map(s => (
                                                <button key={s} type="button"
                                                    onClick={() => {
                                                        const sem = parseInt(s);
                                                        let year = '1st Year';
                                                        if (sem > 2) year = '2nd Year';
                                                        if (sem > 4) year = '3rd Year';
                                                        if (sem > 6) year = '4th Year';
                                                        setFormData({ ...formData, semester: s, academicYear: year });
                                                    }}
                                                    className={`py-1.5 text-xs font-bold rounded-md border transition-all ${formData.semester === s
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                        : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400 hover:text-slate-800'
                                                        }`}
                                                >
                                                    Sem {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Year of Study</label>
                                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 font-bold uppercase tracking-wider">Auto</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5 opacity-80 pointer-events-none">
                                            {YEARS.map(y => (
                                                <div key={y}
                                                    className={`py-1.5 text-center text-[10px] font-bold rounded-md border transition-all uppercase tracking-wider ${formData.academicYear === y
                                                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm'
                                                        : 'bg-slate-50 text-slate-400 border-slate-200'
                                                        }`}
                                                >
                                                    {y}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button type="submit" disabled={submitting}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-md font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-4 shadow-sm"
                                    >
                                        {submitting ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                                        ) : (
                                            <>{isEditing ? 'Update Records' : 'Enroll Student'}</>
                                        )}
                                    </button>
                                    {isEditing && (
                                        <button type="button" onClick={cancelEdit}
                                            className="w-full bg-slate-100 border border-slate-200 text-slate-600 py-2.5 rounded-md font-bold text-sm hover:bg-slate-200 transition-colors mt-2"
                                        >
                                            Cancel Editing
                                        </button>
                                    )}
                                    <p className="text-xs text-center text-slate-500 font-medium pb-2">Default password: <span className="font-mono bg-slate-100 px-1 rounded">password123</span></p>
                                </form>
                            </div>
                        )}

                        {/* Bulk Upload */}
                        {activeTab === 'bulk' && (
                            <div className="p-5 space-y-4">
                                {/* Template Download */}
                                <button onClick={downloadTemplate}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors shadow-sm"
                                >
                                    <Download className="w-4 h-4" /> Download CSV Template
                                </button>

                                <div className="text-xs text-slate-500 bg-slate-50 rounded-md p-3 space-y-1 border border-slate-200 font-medium">
                                    <p className="font-bold text-slate-700">CSV Format:</p>
                                    <p><span className="font-mono text-[10px]">username, fullName, email, registerNumber, semester, academicYear, password</span></p>
                                    <p>Department auto-set to <span className="font-bold text-slate-800">{user?.department}</span></p>
                                </div>

                                {/* File Input */}
                                <div
                                    className="relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-md cursor-pointer hover:border-slate-500 transition-colors"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    <FileText className="w-8 h-8 text-slate-400" />
                                    <p className="text-sm font-bold text-slate-600">
                                        {csvFile ? csvFile.name : 'Click to select CSV file'}
                                    </p>
                                    {csvFile && <p className="text-xs text-slate-400 font-medium">{(csvFile.size / 1024).toFixed(1)} KB</p>}
                                    <input ref={fileRef} type="file" accept=".csv" className="hidden"
                                        onChange={e => { setCsvFile(e.target.files?.[0] || null); setBulkResult(null); }}
                                    />
                                </div>

                                <button onClick={handleBulkUpload} disabled={!csvFile || bulkLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-md font-bold text-sm transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {bulkLoading ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                                    ) : (
                                        <><Upload className="w-4 h-4" /> Upload & Enroll</>
                                    )}
                                </button>

                                {/* Bulk Result */}
                                {bulkResult && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mt-4">
                                        <div className="flex gap-3">
                                            <div className="flex-1 text-center bg-emerald-50 border border-emerald-200 rounded-md p-3">
                                                <p className="text-2xl font-bold text-emerald-600">{bulkResult.success}</p>
                                                <p className="text-xs text-emerald-700 font-medium">Enrolled</p>
                                            </div>
                                            <div className="flex-1 text-center bg-red-50 border border-red-200 rounded-md p-3">
                                                <p className="text-2xl font-bold text-red-500">{bulkResult.failed}</p>
                                                <p className="text-xs text-red-600 font-medium">Failed</p>
                                            </div>
                                        </div>
                                        {bulkResult.errors.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-32 overflow-y-auto">
                                                {bulkResult.errors.map((err, i) => (
                                                    <p key={i} className="text-xs font-medium text-red-700 py-0.5">{err}</p>
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
                    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                        {/* Table header */}
                        <div className="p-4 border-b border-slate-200 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    <h2 className="font-bold text-slate-900 text-sm">Student Directory</h2>
                                    <span className="text-xs font-medium text-slate-500">({filteredStudents.length})</span>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:flex-none">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input type="text" placeholder="Search students..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full sm:w-48 pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors"
                                        />
                                    </div>
                                    <input type="text" placeholder="Batch" value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
                                        className="w-24 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors" />
                                    <input type="text" placeholder="Sec" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
                                        className="w-16 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors" />
                                    <button
                                        onClick={() => setShowInactive(!showInactive)}
                                        className={`px-3 py-2 rounded-md text-xs font-bold border transition-all ${showInactive ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                    >
                                        {showInactive ? 'Showing All' : 'Hide Inactive'}
                                    </button>
                                </div>
                            </div>

                            {/* Year Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <button
                                    onClick={() => setYearFilter('')}
                                    className={`px-4 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all border ${yearFilter === '' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'}`}
                                >
                                    All Years
                                </button>
                                {YEARS.map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setYearFilter(y)}
                                        className={`px-4 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all border ${yearFilter === y ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'}`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected count handled in header */}

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3 text-center">
                                                <input type="checkbox"
                                                    checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
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
                                                <td colSpan={8} className="px-5 py-12 text-center text-slate-500 text-sm font-medium">
                                                    No students found. Start by enrolling one.
                                                </td>
                                            </tr>
                                        ) : filteredStudents.map((s, i) => (
                                            <motion.tr key={s._id}
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={`text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer transition-colors ${!s.isActive ? 'bg-slate-50/50' : ''} ${selectedIds.has(s._id) ? 'bg-slate-50' : ''}`}
                                                onClick={() => {
                                                    console.log(`[HODStudents] Navigating to profile: ${s._id}`);
                                                    navigate(`/profile/${s._id}`);
                                                }}
                                            >
                                                <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox"
                                                        checked={selectedIds.has(s._id)}
                                                        onChange={() => toggleSelection(s._id)}
                                                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        {s.profileImage ? (
                                                            <img src={`${API}${s.profileImage}`} alt={s.username}
                                                                className="w-8 h-8 rounded-md object-cover border border-slate-200" />
                                                        ) : (
                                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 shrink-0 ${s.isActive ? 'bg-slate-100' : 'bg-slate-100 opacity-50'}`}>
                                                                {(s.fullName || s.username).charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-slate-900">{s.fullName || s.username}</p>
                                                            <p className="text-xs text-slate-500 font-medium">@{s.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-600 font-mono text-xs font-medium">{s.registerNumber || '—'}</td>
                                                <td className="px-5 py-3.5 text-slate-500 max-w-[120px] lg:max-w-[160px] truncate font-medium">{s.email}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {s.batch && <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{s.batch}</span>}
                                                        {s.section && <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sec {s.section}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[10px] uppercase font-bold text-slate-700 border border-slate-200 px-2 py-0.5 rounded bg-white whitespace-nowrap">
                                                            Sem {s.semester}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                                            {s.academicYear}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${s.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                        {s.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleEditClick(s)}
                                                            className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1.5 rounded-md transition-colors"
                                                            title="Edit Details"
                                                        >
                                                            <Settings size={12} /> Edit
                                                        </button>
                                                        {s.isActive ? (
                                                            <button onClick={() => handleDelete(s._id)}
                                                                className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1.5 rounded-md transition-colors"
                                                                title="Deactivate account"
                                                            >
                                                                <XCircle className="w-3 h-3" /> Deactivate
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleReactivate(s._id)}
                                                                className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1.5 rounded-md transition-colors"
                                                                title="Reactivate account"
                                                            >
                                                                <RotateCcw className="w-3 h-3" /> Reactivate
                                                            </button>
                                                        )}
                                                        <button onClick={() => handlePermanentDelete(s._id)}
                                                            className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1.5 rounded-md transition-colors"
                                                            title="Permanently remove from database"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Delete
                                                        </button>
                                                    </div>
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
