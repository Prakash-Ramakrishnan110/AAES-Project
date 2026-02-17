import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

interface User {
    _id: string;
    username: string;
    email: string;
    department: string;
    academicYear?: string;
}

const StaffList = () => {
    const [staff, setStaff] = useState<User[]>([]);
    const [departments, setDepartments] = useState<any[]>([]); // To populate dropdown

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: 'password123', // Default
        department: '',
        academicYear: '2023-2024'
    });

    const { token } = useContext(AuthContext)!;

    useEffect(() => {
        fetchStaff();
        fetchDepartments();
    }, []);

    const fetchStaff = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/users?role=staff', config);
            setStaff(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/departments', config);
            setDepartments(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/users', { ...formData, role: 'staff' }, config);
            fetchStaff();
            setFormData({ ...formData, username: '', email: '' }); // Reset partial
        } catch (error) {
            alert('Error adding staff');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/users/${id}`, config);
            fetchStaff();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Staff</h1>

            {/* Add Staff Form */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-lg font-semibold mb-4">Add New Staff</h2>
                <form onSubmit={handleAddStaff} className="grid grid-cols-2 gap-4">
                    <input
                        type="text" placeholder="Username" className="p-2 border rounded" required
                        value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                    />
                    <input
                        type="email" placeholder="Email" className="p-2 border rounded" required
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    <select
                        className="p-2 border rounded" required
                        value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                    >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                            <option key={dept._id} value={dept.name}>{dept.name}</option>
                        ))}
                    </select>
                    <input
                        type="text" placeholder="Academic Year" className="p-2 border rounded"
                        value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                    />
                    <button type="submit" className="col-span-2 bg-green-600 text-white p-2 rounded hover:bg-green-700">
                        Add Staff
                    </button>
                    <p className="text-xs text-gray-500 col-span-2">Default Password: password123</p>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {staff.map(user => (
                            <tr key={user._id}>
                                <td className="px-6 py-4">{user.username}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.department}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffList;
