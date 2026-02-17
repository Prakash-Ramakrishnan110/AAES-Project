import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

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
    const [staffList, setStaffList] = useState<any[]>([]); // For assignment
    const [selectedStaff, setSelectedStaff] = useState(''); // For assignment

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        department: '',
        semester: '1',
        academicYear: '2023-2024'
    });

    const { token } = useContext(AuthContext)!;

    useEffect(() => {
        fetchSubjects();
        fetchDepartments();
        fetchStaff();
    }, []);

    const fetchSubjects = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/subjects', config);
            setSubjects(data);
        } catch (error) { console.error(error); }
    };

    const fetchDepartments = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/departments', config);
            setDepartments(data);
        } catch (error) { console.error(error); }
    };

    const fetchStaff = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/users?role=staff', config);
            setStaffList(data);
        } catch (error) { console.error(error); }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/subjects', formData, config);
            fetchSubjects();
            setFormData({ ...formData, name: '', code: '' });
        } catch (error) { alert('Error adding subject'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/subjects/${id}`, config);
            fetchSubjects();
        } catch (error) { console.error(error); }
    };

    const handleAssignStaff = async (subjectId: string) => {
        if (!selectedStaff) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/subjects/${subjectId}/assign`, { staffId: selectedStaff }, config);
            fetchSubjects();
            setSelectedStaff('');
        } catch (error) { alert('Error assigning staff'); }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Subjects</h1>

            {/* Add Subject Form */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-lg font-semibold mb-4">Add New Subject</h2>
                <form onSubmit={handleAddSubject} className="grid grid-cols-2 gap-4">
                    <input
                        type="text" placeholder="Subject Name" className="p-2 border rounded" required
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        type="text" placeholder="Subject Code (e.g., CS101)" className="p-2 border rounded" required
                        value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}
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
                    <input
                        type="text" placeholder="Academic Year" className="p-2 border rounded"
                        value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                    />
                    <button type="submit" className="col-span-2 bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                        Add Subject
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {subjects.map(subject => (
                            <tr key={subject._id}>
                                <td className="px-6 py-4 font-medium">{subject.code}</td>
                                <td className="px-6 py-4">{subject.name}</td>
                                <td className="px-6 py-4">{subject.department}</td>
                                <td className="px-6 py-4">{subject.semester}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        {subject.staff.map(s => (
                                            <span key={s._id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {s.username}
                                            </span>
                                        ))}
                                        <div className="flex gap-1 mt-1">
                                            <select
                                                className="text-xs border rounded p-1"
                                                onChange={e => setSelectedStaff(e.target.value)}
                                            >
                                                <option value="">Assign Staff...</option>
                                                {staffList.map(s => (
                                                    <option key={s._id} value={s._id}>{s.username}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleAssignStaff(subject._id)}
                                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(subject._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubjectList;
