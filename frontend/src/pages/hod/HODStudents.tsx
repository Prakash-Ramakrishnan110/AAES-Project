import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const HODStudents = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Filter by HOD's department
                const { data } = await axios.get(
                    `http://localhost:5000/api/users?role=student&department=${user?.department}`,
                    config
                );
                setStudents(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [token, user]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Department Students</h1>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No students found</td>
                            </tr>
                        ) : (
                            students.map(s => (
                                <tr key={s._id}>
                                    <td className="px-6 py-4">{s.username}</td>
                                    <td className="px-6 py-4">{s.email}</td>
                                    <td className="px-6 py-4">{s.semester || 'N/A'}</td>
                                    <td className="px-6 py-4">{s.academicYear || 'N/A'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HODStudents;
