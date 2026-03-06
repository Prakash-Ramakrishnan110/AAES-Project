import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Plus, Search, Book, Hash, Calendar, Layers, Briefcase, UserPlus, Settings } from 'lucide-react';

import StaffAssignmentModal from '../../components/ui/StaffAssignmentModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HODSubjects = () => {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        semester: '1',
        academicYear: '2023-2024'
    });

    const { token, user } = useContext(AuthContext)!;
    const navigate = useNavigate();

    useEffect(() => {

        fetchSubjects();
    }, [token, user]);

    const fetchSubjects = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(
                `${API}/api/subjects?department=${user?.department}`,
                config
            );
            setSubjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API}/api/subjects`, formData, config);
            fetchSubjects();
            setFormData({ ...formData, name: '', code: '' });
            showToast('Subject added successfully', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error adding subject', 'error');
        }
    };

    const showToast = (text: string, type: 'success' | 'error') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
            {/* Transparent Glassmorphic Toast */}
            {toastMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md border text-sm flex items-center gap-2 font-medium tracking-wide
                        ${toastMessage.type === 'success'
                            ? 'bg-emerald-500/20 text-emerald-900 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-900 border-red-500/30'}`}
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
                    <h1 className="text-3xl font-bold text-gray-900">Department Subjects</h1>
                    <p className="text-gray-500 mt-1">Manage curriculum for {user?.department}</p>
                </div>
                <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full font-medium text-sm">
                    {subjects.length} Total Subjects
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Subject Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6">
                            <h2 className="text-white text-xl font-bold flex items-center gap-2">
                                <Plus size={24} /> Add New Subject
                            </h2>
                            <p className="text-teal-50 text-sm mt-1">Create a new course</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddSubject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                                    <div className="relative">
                                        <Book className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="e.g. Data Structures"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="e.g. CS101"
                                            required
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                        <div className="relative">
                                            <Layers className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <select
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                                value={formData.academicYear}
                                                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Briefcase size={16} />
                                        <span>Department:</span>
                                        <span className="font-bold text-teal-600">{user?.department}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 ml-6">Auto-assigned based on your role</div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 hover:shadow-xl transform active:scale-95 duration-200"
                                >
                                    Add Subject
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>

                {/* Filtered List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-lg">Subject Directory</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search subjects..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Semester</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Year</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSubjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <Book size={48} className="mb-2 opacity-50" />
                                                    <p>No subjects found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubjects.map((s, index) => (
                                            <motion.tr
                                                key={s._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 + 0.3 }}
                                                className="hover:bg-teal-50 transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                                                            <Book size={20} />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900">{s.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded font-mono">
                                                        {s.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                                                        Sem {s.semester}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {s.academicYear}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/hod/internal-pattern/${s._id}`)}
                                                            className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-medium rounded-lg text-xs px-3 py-1.5 focus:outline-none flex items-center justify-center gap-1 transition-colors"
                                                        >
                                                            <Settings size={14} /> Configure Assessment
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSubject(s);
                                                                setIsAssignModalOpen(true);
                                                            }}
                                                            className="text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-xs px-3 py-1.5 focus:outline-none flex items-center justify-center gap-1 transition-colors shadow-sm"
                                                        >
                                                            <UserPlus size={14} /> Assign Staff
                                                        </button>
                                                    </div>
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

            <StaffAssignmentModal
                isOpen={isAssignModalOpen}
                onClose={() => {
                    setIsAssignModalOpen(false);
                    setSelectedSubject(null);
                }}
                subject={selectedSubject}
                onAssignSuccess={(msg) => {
                    showToast(msg || 'Staff assigned successfully!', 'success');
                    fetchSubjects();
                }}
            />
        </div>
    );
};

export default HODSubjects;
