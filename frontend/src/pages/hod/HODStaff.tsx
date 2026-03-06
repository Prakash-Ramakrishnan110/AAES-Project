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
    createdBy?: { username: string };
    profileImage?: string;
}

const HODStaff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: 'password123',
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
            // HOD sees only their department staff
            const { data } = await axios.get(`${API}/api/users?role=staff&status=all`, config);
            setStaff(data);
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
            data.append('role', 'staff');
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
        if (!confirm('Are you sure you want to deactivate this user?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API}/api/users/${id}`, config);
            fetchStaff();
        } catch (error) { console.error(error); }
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
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
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

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Department Staff</h1>
                    <p className="text-gray-500 mt-1">Manage faculty for {user?.department || 'your department'}</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium text-sm">
                        {staff.filter(s => s.isActive).length} Active
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Add Staff Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="xl:col-span-1"
                >
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-6">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                            <h2 className="text-white text-xl font-bold flex items-center gap-2">
                                <Plus size={24} /> Add Staff
                            </h2>
                            <p className="text-purple-100 text-sm mt-1">Create new faculty account</p>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (Optional)</label>
                                    <div className="relative">
                                        <Camera className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="file"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                                            accept="image/*"
                                            onChange={e => setProfileImage(e.target.files ? e.target.files[0] : null)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 hover:shadow-xl transform active:scale-95 duration-200"
                                >
                                    Add Faculty
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>

                {/* Staff List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="xl:col-span-2"
                >
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-lg">Staff Directory</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search staff..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Faculty Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Academic Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStaff.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                                No staff found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStaff.map((s, index) => (
                                            <motion.tr
                                                key={s._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 + 0.3 }}
                                                className={`transition-colors duration-150 cursor-pointer ${s.isActive ? 'hover:bg-indigo-50' : 'bg-red-50 hover:bg-red-100'}`}
                                                onClick={() => navigate(`/profile/${s._id}`)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {s.profileImage ? (
                                                            <img
                                                                src={`${API}${s.profileImage}`}
                                                                alt={s.username}
                                                                className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-white"
                                                            />
                                                        ) : (
                                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${s.isActive ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gray-400'}`}>
                                                                {s.username.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="ml-4">
                                                            <div className={`text-sm font-bold ${s.isActive ? 'text-gray-900' : 'text-gray-500'}`}>{s.fullName || s.username}</div>
                                                            <div className="text-xs text-gray-400 flex flex-col">
                                                                <span className="flex items-center gap-1"><Mail size={10} /> {s.email}</span>
                                                                <span className="text-[10px] opacity-70">UID: {s.username}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600">{s.academicYear}</span>
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

export default HODStaff;
