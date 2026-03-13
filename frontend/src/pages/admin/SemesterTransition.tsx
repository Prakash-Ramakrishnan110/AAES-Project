import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
                const { data } = await axios.get(`${API}/api/departments`, config);
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
            const { data } = await axios.post(`${API}/api/users/promote`, formData, config);
            setResult(`✓ ${data.message}. ${data.count} student(s) promoted.`);
            setFormData({ ...formData, currentSemester: formData.newSemester, newSemester: String(parseInt(formData.newSemester) + 1) });
        } catch (error: any) {
            setResult(`✗ Error: ${error.response?.data?.message || 'Failed to promote students'}`);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-slate-900">Semester Transition</h1>

            <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 max-w-2xl">
                <h2 className="text-lg font-semibold mb-5 text-slate-800 border-b border-slate-100 pb-2">Promote Students to Next Semester</h2>
                <form onSubmit={handlePromote} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-0.5">Department</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors text-sm bg-white"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-0.5">Current Semester</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors text-sm bg-white"
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
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-0.5">New Semester</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors text-sm bg-white"
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
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-0.5">Academic Year (Optional)</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors text-sm"
                            placeholder="e.g., 2024-2025"
                            value={formData.academicYear}
                            onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-md hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm mt-2"
                    >
                        Promote Students
                    </button>
                </form>

                {result && (
                    <div className={`mt-5 p-4 rounded-md text-sm font-medium border ${result.startsWith('✓') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        {result}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SemesterTransition;
