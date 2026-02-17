import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const HODSubjects = () => {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Filter by HOD's department
                const { data } = await axios.get(
                    `http://localhost:5000/api/subjects?department=${user?.department}`,
                    config
                );
                setSubjects(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, [token, user]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Department Subjects</h1>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {subjects.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No subjects found</td>
                            </tr>
                        ) : (
                            subjects.map(sub => (
                                <tr key={sub._id}>
                                    <td className="px-6 py-4">{sub.name}</td>
                                    <td className="px-6 py-4">{sub.code}</td>
                                    <td className="px-6 py-4">{sub.semester}</td>
                                    <td className="px-6 py-4">{sub.academicYear}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HODSubjects;
