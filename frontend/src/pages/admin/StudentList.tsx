import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

interface User {
    _id: string;
    username: string;
    email: string;
    department: string;
    semester?: string;
}

const StudentList = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: 'password123',
        department: '',
        semester: '1',
        academicYear: '2023-2024'
    });

    const { token } = useContext(AuthContext)!;

    useEffect(() => {
        fetchStudents();
        fetchDepartments();
    }, []);

    const fetchStudents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/users?role=student', config);
            setStudents(data);
        } catch (error) { console.error(error); }
    };

    const fetchDepartments = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/departments', config);
            setDepartments(data);
        } catch (error) { console.error(error); }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/users', { ...formData, role: 'student' }, config);
            fetchStudents();
            setFormData({ ...formData, username: '', email: '' });
        } catch (error) { alert('Error adding student'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/users/${id}`, config);
            fetchStudents();
        } catch (error) { console.error(error); }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Students</h1>

            {/* Add Student Form */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-lg font-semibold mb-4">Add New Student</h2>
                <form onSubmit={handleAddStudent} className="grid grid-cols-2 gap-4">
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
                    <select
                        className="p-2 border rounded" required
                        value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                    <button type="submit" className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        Add Student
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {students.map(user => (
                            <tr key={user._id}>
                                <td className="px-6 py-4">{user.username}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.department}</td>
                                <td className="px-6 py-4">{user.semester}</td>
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

export default StudentList;
