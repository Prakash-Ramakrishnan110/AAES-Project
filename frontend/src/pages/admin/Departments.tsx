import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Department {
    _id: string;
    name: string;
    description?: string;
    hod?: {
        _id: string;
        username: string;
        email: string;
    };
}

const Departments = () => {
    const { token } = useContext(AuthContext)!;
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchDepartments();
    }, [token]);

    const fetchDepartments = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/departments`, config);
            setDepartments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingDept) {
                // Update existing department
                await axios.put(
                    `${API}/api/departments/${editingDept._id}`,
                    formData,
                    config
                );
            } else {
                // Create new department
                await axios.post(`${API}/api/departments`, formData, config);
            }

            setShowModal(false);
            setFormData({ name: '', description: '' });
            setEditingDept(null);
            fetchDepartments();
            setToastMessage({ text: 'Department saved successfully!', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error: any) {
            setToastMessage({ text: error.response?.data?.message || 'Operation failed', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handleEdit = (dept: Department) => {
        setEditingDept(dept);
        setFormData({ name: dept.name, description: dept.description || '' });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this department?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API}/api/departments/${id}`, config);
            fetchDepartments();
            setToastMessage({ text: 'Department deleted', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error: any) {
            setToastMessage({ text: error.response?.data?.message || 'Delete failed', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const openCreateModal = () => {
        setEditingDept(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="relative">
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

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Departments</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                >
                    + Add Department
                </button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HOD</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {departments.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No departments found</td>
                            </tr>
                        ) : (
                            departments.map(dept => (
                                <tr key={dept._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{dept.name}</td>
                                    <td className="px-6 py-4">{dept.description || '-'}</td>
                                    <td className="px-6 py-4">{dept.hod?.username || <span className="text-gray-400">Not Assigned</span>}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(dept)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingDept ? 'Edit Department' : 'Create Department'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    {editingDept ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
