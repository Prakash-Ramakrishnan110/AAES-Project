import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Plus, Search, Book, Hash, Calendar, Layers, Briefcase, Trash2, UserPlus, AlertCircle } from 'lucide-react';
import StaffAssignmentModal from '../../components/ui/StaffAssignmentModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Subject {
    _id: string;
    name: string;
    code: string;
    department: string;
    semester: string;
    academicYear: string;
    staff: any[];
}

const SubjectList = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        department: '',
        semester: '1',
        academicYear: '2023-2024'
    });

    const { token } = useContext(AuthContext)!;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [subjectsRes, deptsRes] = await Promise.all([
                axios.get(`${API}/api/subjects`, config),
                axios.get(`${API}/api/departments`, config)
            ]);
            setSubjects(subjectsRes.data);
            setDepartments(deptsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/subjects`, config);
            setSubjects(data);
        } catch (error) { console.error(error); }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API}/api/subjects`, formData, config);
            fetchSubjects();
            setFormData({ ...formData, name: '', code: '' });
            showToast('Subject added successfully', 'success');
        } catch (error) { showToast('Error adding subject', 'error'); }
    };

    const showToast = (text: string, type: 'success' | 'error') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API}/api/subjects/${id}`, config);
            fetchSubjects();
        } catch (error) { console.error(error); }
    };

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl font-bold text-gray-900">Manage Subjects</h1>
                    <p className="text-gray-500 mt-1">Administer curriculum across all departments</p>
                </div>
                <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-medium text-sm">
                    {subjects.length} Total Subjects
                </div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Add Subject Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="xl:col-span-1"
                >
                    <div className="bg-white rounded-md shadow-sm overflow-hidden border border-slate-200 sticky top-6">
                        <div className="bg-slate-900 border-b border-slate-800 p-6">
                            <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                                <Plus size={20} /> Add New Subject
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Create a new course entry</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddSubject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                                    <div className="relative">
                                        <Book className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="e.g. detailed Subject Name"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                placeholder="CS101"
                                                required
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                        <div className="relative">
                                            <Layers className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <select
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
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
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <select
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
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

                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 text-white py-2.5 rounded-md font-medium hover:bg-slate-800 transition-colors shadow-sm mt-2"
                                >
                                    Add Subject
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>

                {/* Subject List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="xl:col-span-2"
                >
                    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center bg-slate-50 gap-4">
                            <h3 className="font-semibold text-slate-800 text-[15px]">Subject Directory</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search subjects..."
                                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm w-full sm:w-64 bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code & Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dept & Sem</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Evaluators</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSubjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <AlertCircle size={48} className="mb-2 opacity-50" />
                                                    <p>No subjects found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubjects.map((subject, index) => (
                                            <motion.tr
                                                key={subject._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 + 0.3 }}
                                                className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100 last:border-0"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 min-w-[2.5rem] rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                            {subject.code}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900">{subject.name}</div>
                                                            <div className="text-xs text-gray-500">{subject.academicYear}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                                                            {subject.department}
                                                        </span>
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            Semester {subject.semester}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {subject.staff.length > 0 ? (
                                                                subject.staff.map(s => (
                                                                    <span key={s._id} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-md border border-purple-200 flex items-center gap-1">
                                                                        <UserPlus size={10} /> {s.username}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">No staff assigned</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSubject(subject);
                                                                    setIsAssignModalOpen(true);
                                                                }}
                                                                className="text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-xs px-3 py-1.5 focus:outline-none flex items-center justify-center gap-1 transition-colors shadow-sm"
                                                            >
                                                                <UserPlus size={14} /> Assign Staff
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(subject._id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                        title="Delete Subject"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
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

export default SubjectList;
