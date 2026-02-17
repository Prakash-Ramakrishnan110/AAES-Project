import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const SemesterTransition = () => {
    const { token } = useContext(AuthContext)!;
    const [departments, setDepartments] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        department: '',
        currentSemester: '1',
        newSemester: '2',
        academicYear: ''
    });
    const [result, setResult] = useState<string>('');

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/departments', config);
                setDepartments(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchDepartments();
    }, [token]);

    const handlePromote = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm(`Are you sure you want to promote all students from Semester ${formData.currentSemester} to Semester ${formData.newSemester} in ${formData.department}?`)) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('http://localhost:5000/api/users/promote', formData, config);
            setResult(`✓ ${data.message}. ${data.count} student(s) promoted.`);
            setFormData({ ...formData, currentSemester: formData.newSemester, newSemester: String(parseInt(formData.newSemester) + 1) });
        } catch (error: any) {
            setResult(`✗ Error: ${error.response?.data?.message || 'Failed to promote students'}`);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Semester Transition</h1>

            <div className="bg-white p-6 rounded shadow max-w-2xl">
                <h2 className="text-lg font-semibold mb-4">Promote Students to Next Semester</h2>
                <form onSubmit={handlePromote} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Department</label>
                        <select
                            className="w-full p-2 border rounded"
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Current Semester</label>
                            <select
                                className="w-full p-2 border rounded"
                                required
                                value={formData.currentSemester}
                                onChange={e => setFormData({ ...formData, currentSemester: e.target.value })}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">New Semester</label>
                            <select
                                className="w-full p-2 border rounded"
                                required
                                value={formData.newSemester}
                                onChange={e => setFormData({ ...formData, newSemester: e.target.value })}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Academic Year (Optional)</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="e.g., 2024-2025"
                            value={formData.academicYear}
                            onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition"
                    >
                        Promote Students
                    </button>
                </form>

                {result && (
                    <div className={`mt-4 p-3 rounded ${result.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {result}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SemesterTransition;
