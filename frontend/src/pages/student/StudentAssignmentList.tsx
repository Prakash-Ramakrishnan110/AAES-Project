import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const StudentAssignmentList = () => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // New endpoint automatically filters by student's enrollment
                const { data } = await axios.get(
                    'http://localhost:5000/api/assignments/student',
                    config
                );
                setAssignments(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, [token]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Assignments</h1>
            <div className="grid gap-4">
                {assignments.length === 0 ? <p>No assignments found.</p> : assignments.map(ass => (
                    <div key={ass._id} className="bg-white p-6 rounded shadow flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">{ass.title}</h3>
                            <p className="text-gray-600">{ass.subject?.name} | {ass.type.toUpperCase()}</p>
                            <p className="text-sm text-gray-500">Deadline: {new Date(ass.deadline).toLocaleDateString()}</p>
                        </div>
                        <Link
                            to={`/student/assignments/${ass._id}`}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            View / Submit
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentAssignmentList;
