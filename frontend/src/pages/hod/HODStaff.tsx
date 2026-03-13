import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Plus, Search, User, Mail, Calendar, Trash2, RotateCcw, CheckCircle, XCircle, Camera } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface User {
    _id: string;
    username: string;
    fullName?: string;
    email: string;
    department: string;
    academicYear?: string;
    isActive: boolean;
    role: string;
    createdBy?: { username: string };
    profileImage?: string;
}

const HODStaff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: 'password123',
        role: 'staff',
        academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString()
    });

    const { token, user } = useContext(AuthContext)!;

    useEffect(() => {
        fetchStaff();
    }, [token, user]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // HOD sees only their department faculty (Staff & HODs)
            const [staffRes, hodRes] = await Promise.all([
                axios.get(`${API}/api/users?role=staff&status=all`, config),
                axios.get(`${API}/api/users?role=hod&status=all`, config)
            ]);
            setStaff([...staffRes.data, ...hodRes.data]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            const data = new FormData();
            data.append('username', formData.username);
            data.append('fullName', formData.fullName);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('role', formData.role);
            data.append('academicYear', formData.academicYear);
            if (user?.department) {
                data.append('department', user.department);
            }
            if (profileImage) {
                data.append('profileImage', profileImage);
            }

            await axios.post(`${API}/api/users`, data, config);
            fetchStaff();
            setFormData({
                username: '',
                fullName: '',
                email: '',
                password: 'password123',
                role: 'staff',
                academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString()
            });
            setProfileImage(null);

            setToastMessage({ text: 'Staff added successfully!', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error: any) {
            setToastMessage({ text: error.response?.data?.message || 'Error adding staff', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this user? They will still remain in the database but cannot login.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API}/api/users/${id}`, config);
            fetchStaff();
        } catch (error) { console.error(error); }
    };

    const handlePermanentDelete = async (id: string) => {
        const confirm1 = confirm('CRITICAL: Are you sure you want to PERMANENTLY DELETE this user? This will remove all their data forever.');
        if (!confirm1) return;
        const confirm2 = confirm('LAST WARNING: This action is irreversible. All attendance, assignments and profile data for this user will be lost. Proceed?');
        if (!confirm2) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API}/api/users/${id}?permanent=true`, config);
            fetchStaff();
            setToastMessage({ text: 'User permanently deleted', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error: any) {
            setToastMessage({ text: error.response?.data?.message || 'Error deleting user', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handleReactivate = async (id: string) => {
        if (!confirm('Are you sure you want to reactivate this user?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/users/${id}`, { isActive: true }, config);
            fetchStaff();
        } catch (error) { console.error(error); }
    };

    const filteredStaff = staff.filter(s =>
        (s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (showInactive || s.isActive)
    );

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

            <div
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Department Staff</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage faculty for {user?.department || 'your department'}</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-md font-bold text-sm shadow-sm">
                        {staff.filter(s => s.isActive).length} Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Add Staff Form */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-md shadow-sm overflow-hidden border border-slate-200 sticky top-6">
                        <div className="bg-slate-900 p-6">
                            <h2 className="text-white text-lg font-bold flex items-center gap-2">
                                <Plus size={20} /> Add Staff
                            </h2>
                            <p className="text-slate-400 text-xs mt-1 font-medium">Create new faculty account</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddStaff} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Enter full name"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username (Login ID)</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Enter username"
                                            required
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="faculty@college.edu"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="staff">Staff/Faculty</option>
                                        <option value="hod">Additional HOD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            value={formData.academicYear}
                                            onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Profile Photo (Optional)</label>
                                    <div className="relative">
                                        <Camera className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input
                                            type="file"
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors text-sm outline-none"
                                            accept="image/*"
                                            onChange={e => setProfileImage(e.target.files ? e.target.files[0] : null)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 text-white py-2.5 rounded-md font-bold hover:bg-slate-800 transition-colors shadow-sm text-sm mt-2"
                                >
                                    Add Faculty
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Staff List */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50">
                            <h3 className="font-bold text-slate-900 text-lg">Staff Directory</h3>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search staff..."
                                        className="pl-9 pr-4 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm w-full sm:w-64 outline-none transition-colors"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowInactive(!showInactive)}
                                    className={`px-4 py-2 rounded-md text-xs font-bold border transition-colors ${showInactive ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}
                                >
                                    {showInactive ? 'Showing All' : 'Hide Inactive'}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Faculty Details</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Academic Info</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {filteredStaff.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                No staff found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStaff.map((s, index) => (
                                            <tr
                                                key={s._id}
                                                className={`transition-colors duration-150 cursor-pointer ${s.isActive ? 'hover:bg-slate-50' : 'bg-red-50/50 hover:bg-red-50'}`}
                                                onClick={() => navigate(`/profile/${s._id}`)}
                                            >
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {s.profileImage ? (
                                                            <img
                                                                src={`${API}${s.profileImage}`}
                                                                alt={s.username}
                                                                className="h-9 w-9 rounded-md object-cover border border-slate-200 shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className={`h-9 w-9 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm ${s.isActive ? 'bg-slate-800' : 'bg-slate-400'}`}>
                                                                {s.username.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="ml-3">
                                                            <div className={`text-sm font-bold ${s.isActive ? 'text-slate-900' : 'text-slate-500'}`}>{s.fullName || s.username}</div>
                                                            <div className="text-xs text-slate-500 flex flex-col font-medium">
                                                                <span className="flex items-center gap-1 mt-0.5"><Mail size={10} /> {s.email}</span>
                                                                <span className="text-[10px] text-slate-400 mt-0.5 font-mono">UID: {s.username}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${s.role === 'hod' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                                        {s.role}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="text-xs font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded bg-slate-50">{s.academicYear}</span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    {s.isActive ? (
                                                        <span className="px-2.5 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wider rounded border bg-emerald-50 text-emerald-700 border-emerald-200 items-center gap-1">
                                                            <CheckCircle size={10} /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wider rounded border bg-red-50 text-red-700 border-red-200 items-center gap-1">
                                                            <XCircle size={10} /> Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap text-right text-xs font-bold">
                                                    <div className="flex justify-end gap-2">
                                                        {s.isActive ? (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }}
                                                                className="text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-2.5 py-1 rounded transition-colors"
                                                                title="Deactivate account"
                                                            >
                                                                <XCircle size={12} /> Deactivate
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleReactivate(s._id); }}
                                                                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 rounded transition-colors"
                                                                title="Reactivate account"
                                                            >
                                                                <RotateCcw size={12} /> Reactivate
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handlePermanentDelete(s._id); }}
                                                            className="text-red-700 hover:text-red-900 flex items-center gap-1 bg-red-50 border border-red-200 hover:bg-red-100 px-2.5 py-1 rounded transition-colors"
                                                            title="Permanently remove from database"
                                                        >
                                                            <Trash2 size={12} /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODStaff;
