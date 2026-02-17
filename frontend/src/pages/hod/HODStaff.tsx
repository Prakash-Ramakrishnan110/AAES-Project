import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const HODStaff = () => {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Filter by HOD's department
                const { data } = await axios.get(
                    `http://localhost:5000/api/users?role=staff&department=${user?.department}`,
                    config
                );
                setStaff(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [token, user]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Department Staff</h1>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {staff.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No staff members found</td>
                            </tr>
                        ) : (
                            staff.map(s => (
                                <tr key={s._id}>
                                    <td className="px-6 py-4">{s.username}</td>
                                    <td className="px-6 py-4">{s.email}</td>
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

export default HODStaff;
