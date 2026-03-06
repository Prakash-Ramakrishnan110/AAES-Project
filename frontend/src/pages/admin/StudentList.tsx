import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Plus, Search, User, Mail, Calendar, BookOpen, Briefcase, Trash2, RotateCcw, CheckCircle, XCircle, Camera } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface User {
    _id: string;
    username: string;
    email: string;
    department: string;
    semester?: string;
    academicYear?: string;
    batch?: string;
    section?: string;
    isActive: boolean;
    createdBy?: { username: string };
    profileImage?: string;
}

const StudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<User[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Bulk Update State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkUpdateData, setBulkUpdateData] = useState({
        batch: '', section: '', academicYear: '', isActive: ''
    });
    const [bulkUpdating, setBulkUpdating] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: 'password123',
        department: '',
        semester: '1',
        academicYear: '1st Year'
    });

    const { token } = useContext(AuthContext)!;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [studentsRes, deptsRes] = await Promise.all([
                axios.get(`${API}/api/users?role=student&status=all`, config),
                axios.get(`${API}/api/departments`, config)
            ]);
            setStudents(studentsRes.data);
            setDepartments(deptsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/users?role=student&status=all`, config);
            setStudents(data);
        } catch (error) { console.error(error); }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            const data = new FormData();
            data.append('username', formData.username);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('role', 'student');
            data.append('department', formData.department);
            data.append('semester', formData.semester);
            data.append('academicYear', formData.academicYear);
            if (profileImage) {
                data.append('profileImage', profileImage);
            }

            await axios.post(`${API}/api/users`, data, config);
            fetchStudents();
            setFormData({ ...formData, username: '', email: '', password: 'password123', department: '', semester: '1', academicYear: '1st Year' });
            setProfileImage(null);
            setToastMessage({ text: 'Student added successfully!', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error: any) {
            setToastMessage({ text: error.response?.data?.message || 'Error adding student', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this student?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API}/api/users/${id}`, config);
            fetchStudents();
        } catch (error) { console.error(error); }
    };

    const handleReactivate = async (id: string) => {
        if (!confirm('Are you sure you want to reactivate this student?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/users/${id}`, { isActive: true }, config);
            fetchStudents();
        } catch (error) { console.error(error); }
    };

    const filteredStudents = students.filter(s =>
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            if (bulkUpdateData.isActive !== '') updates.isActive = bulkUpdateData.isActive === 'true';

            if (Object.keys(updates).length === 0) {
                setToastMessage({ text: 'Please specify at least one field to update', type: 'error' });
                setTimeout(() => setToastMessage(null), 3000);
                setBulkUpdating(false);
                return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(`${API}/api/users/bulk-update`, {
                studentIds: Array.from(selectedIds),
                updates
            }, config);

            setToastMessage({ text: res.data.message || 'Students updated map successfully', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);

            setShowBulkModal(false);
            setBulkUpdateData({ batch: '', section: '', academicYear: '', isActive: '' });
            setSelectedIds(new Set());
            fetchStudents();
        } catch (err: any) {
            setToastMessage({ text: err.response?.data?.message || 'Error updating students', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
        } finally {
            setBulkUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
            {/* Custom Toast Notification */}
            {toastMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg font-medium border text-sm flex items-center gap-2
                        ${toastMessage.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                    {toastMessage.text}
                </motion.div>
            )}

            {/* Bulk Update Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-xl font-bold text-gray-800">Bulk Update Students ({selectedIds.size})</h3>
                            <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                Only fields modified will be updated. Empty fields will remain unchanged.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                                <input type="text" placeholder="e.g. 2024-2028" value={bulkUpdateData.batch} onChange={e => setBulkUpdateData({ ...bulkUpdateData, batch: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <input type="text" placeholder="e.g. A, B" value={bulkUpdateData.section} onChange={e => setBulkUpdateData({ ...bulkUpdateData, section: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select value={bulkUpdateData.isActive} onChange={e => setBulkUpdateData({ ...bulkUpdateData, isActive: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" >
                                    <option value="">-- No Change --</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setShowBulkModal(false)} className="flex-1 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button onClick={submitBulkUpdate} disabled={bulkUpdating} className="flex-1 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                {bulkUpdating ? 'Updating...' : 'Update Records'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
                    <p className="text-gray-500 mt-1">Administer student accounts across all departments</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium text-sm">
                        {students.filter(s => s.isActive).length} Active
                    </div>
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium text-sm">
                        {students.filter(s => !s.isActive).length} Inactive
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Add Student Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="xl:col-span-1"
                >
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-6">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                            <h2 className="text-white text-xl font-bold flex items-center gap-2">
                                <Plus size={24} /> Add New Student
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">Enroll a new student</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddStudent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter username"
                                            required
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="student@college.edu"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <select
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                                required
                                                value={formData.semester}
                                                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                    <option key={sem} value={sem}>{sem}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <select
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                                required
                                                value={formData.academicYear}
                                                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                                            >
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <select
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                            required
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept._id} value={dept.name}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (Optional)</label>
                                    <div className="relative">
                                        <Camera className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="file"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                            accept="image/*"
                                            onChange={e => setProfileImage(e.target.files ? e.target.files[0] : null)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 hover:shadow-xl transform active:scale-95 duration-200"
                                >
                                    Enroll Student
                                </button>
                                <p className="text-xs text-center text-gray-400">Default password: <span className="font-mono">password123</span></p>
                            </form>
                        </div>
                    </div>
                </motion.div>

                {/* Student List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="xl:col-span-2"
                >
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-lg">Student Directory</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {selectedIds.size > 0 && (
                            <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-indigo-800">{selectedIds.size} student(s) selected</span>
                                <button onClick={() => setShowBulkModal(true)} className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                                    Bulk Update
                                </button>
                            </div>
                        )}

                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input type="checkbox"
                                                checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dept & Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created By</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <User size={48} className="mb-2 opacity-50" />
                                                    <p>No students found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((s, index) => (
                                            <motion.tr
                                                key={s._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 + 0.3 }}
                                                className={`transition-colors duration-150 cursor-pointer ${s.isActive ? 'hover:bg-blue-50' : 'bg-red-50 hover:bg-red-100'}`}
                                                onClick={() => navigate(`/profile/${s._id}`)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox"
                                                        checked={selectedIds.has(s._id)}
                                                        onChange={() => toggleSelection(s._id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {s.profileImage ? (
                                                            <img
                                                                src={`${API}${s.profileImage}`}
                                                                alt={s.username}
                                                                className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-white"
                                                            />
                                                        ) : (
                                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${s.isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-400'}`}>
                                                                {s.username.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="ml-4">
                                                            <div className={`text-sm font-bold ${s.isActive ? 'text-gray-900' : 'text-gray-500'}`}>{s.username}</div>
                                                            <div className="text-xs text-gray-400 flex items-center gap-1"><Mail size={10} /> {s.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 w-fit">
                                                            {s.department}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {s.batch ? `${s.batch} ` : ''}({s.academicYear})
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-xs text-gray-500 font-medium">{s.createdBy?.username || 'System'}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {s.isActive ? (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 items-center gap-1">
                                                            <CheckCircle size={12} /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 items-center gap-1">
                                                            <XCircle size={12} /> Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {s.isActive ? (
                                                        <button
                                                            onClick={() => handleDelete(s._id)}
                                                            className="text-red-600 hover:text-red-900 flex items-center gap-1 ml-auto bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                                        >
                                                            <Trash2 size={14} /> Deactivate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleReactivate(s._id)}
                                                            className="text-green-600 hover:text-green-900 flex items-center gap-1 ml-auto bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                                                        >
                                                            <RotateCcw size={14} /> Reactivate
                                                        </button>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentList;
