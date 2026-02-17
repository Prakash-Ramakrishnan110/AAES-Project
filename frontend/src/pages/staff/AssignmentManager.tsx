import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const AssignmentManager = () => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [mySubjects, setMySubjects] = useState<any[]>([]);
    const { token } = useContext(AuthContext)!;

    // Form
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subjectId: '',
        maxMarks: 100,
        deadline: '',
        type: 'theory',
        aiEnabled: false,
        modelAnswer: '', // For AI eval
        testCases: [] as { input: string; output: string; marks: number }[]
    });

    useEffect(() => {
        fetchMyAssignments();
        fetchMySubjects(); // Determine which subjects this staff can invoke
    }, []);

    const fetchMyAssignments = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/assignments/my-created', config);
            setAssignments(data);
        } catch (error) { console.error(error); }
    };

    const fetchMySubjects = async () => {
        // We need an endpoint or logic to filter subjects assigned to THIS staff
        // For now, let's assume we can filter /api/subjects?staffId=...
        try {
            const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/subjects?staffId=${userId}`, config);
            setMySubjects(data);
        } catch (error) { console.error(error); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/assignments', formData, config);
            fetchMyAssignments();
            setFormData({ ...formData, title: '', description: '', modelAnswer: '' });
        } catch (error) { alert('Error creating assignment'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete assignment?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/assignments/${id}`, config);
            fetchMyAssignments();
        } catch (error) { console.error(error); }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Assignment Manager</h1>

            {/* Create Form */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-lg font-semibold mb-4">Create New Assignment</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">Title</label>
                        <input
                            className="w-full p-2 border rounded" required
                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">Description</label>
                        <textarea
                            className="w-full p-2 border rounded" required
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Subject</label>
                        <select
                            className="w-full p-2 border rounded" required
                            value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                        >
                            <option value="">Select Subject</option>
                            {mySubjects.map(sub => (
                                <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Deadline</label>
                        <input
                            type="date" className="w-full p-2 border rounded" required
                            value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Type</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="theory">Theory (OCR/AI)</option>
                            <option value="python">Python (Auto-Grading)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Max Marks</label>
                        <input
                            type="number" className="w-full p-2 border rounded"
                            value={formData.maxMarks} onChange={e => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                        />
                    </div>
                    {formData.type === 'theory' && (
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">Model Answer (for AI Evaluation)</label>
                            <textarea
                                className="w-full p-2 border rounded h-24"
                                placeholder="Enter the ideal answer or keywords..."
                                value={formData.modelAnswer} onChange={e => setFormData({ ...formData, modelAnswer: e.target.value })}
                            />
                        </div>
                    )}

                    {formData.type === 'python' && (
                        <div className="col-span-2 bg-gray-50 p-4 rounded border">
                            <label className="block text-sm font-bold mb-2">Test Cases (Standard IO)</label>
                            {formData.testCases.map((tc, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                                    <input
                                        placeholder="Input" className="p-2 border rounded"
                                        value={tc.input}
                                        onChange={e => {
                                            const newTC = [...formData.testCases];
                                            newTC[index].input = e.target.value;
                                            setFormData({ ...formData, testCases: newTC });
                                        }}
                                    />
                                    <input
                                        placeholder="Expected Output" className="p-2 border rounded"
                                        value={tc.output}
                                        onChange={e => {
                                            const newTC = [...formData.testCases];
                                            newTC[index].output = e.target.value;
                                            setFormData({ ...formData, testCases: newTC });
                                        }}
                                    />
                                    <input
                                        placeholder="Marks" type="number" className="p-2 border rounded"
                                        value={tc.marks}
                                        onChange={e => {
                                            const newTC = [...formData.testCases];
                                            newTC[index].marks = Number(e.target.value);
                                            setFormData({ ...formData, testCases: newTC });
                                        }}
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    testCases: [...formData.testCases, { input: '', output: '', marks: 5 }]
                                })}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                + Add Test Case
                            </button>
                        </div>
                    )}

                    <button type="submit" className="col-span-2 bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                        Create Assignment
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {assignments.map(ass => (
                            <tr key={ass._id}>
                                <td className="px-6 py-4 font-medium">{ass.title}</td>
                                <td className="px-6 py-4">{ass.subject?.name}</td>
                                <td className="px-6 py-4 capitalize">{ass.type}</td>
                                <td className="px-6 py-4">{new Date(ass.deadline).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(ass._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignmentManager;
