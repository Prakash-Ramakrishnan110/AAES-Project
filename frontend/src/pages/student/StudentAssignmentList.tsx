import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Clock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentAssignmentList = () => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(
                    `${API}/api/assignments/student`,
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

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage your pending course work.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {assignments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
                        <p className="text-gray-500 text-sm mt-1">You have no pending assignments at the moment.</p>
                    </div>
                ) : assignments.map(ass => (
                    <div key={ass._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-md border border-indigo-100">
                                    {(ass.type || ass.submissionType || 'Assignment')}
                                </span>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{ass.subject?.name || ass.subject?.code}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 truncate">{ass.title}</h3>
                            <div className="flex items-center gap-4 mt-2">
                                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Due: {new Date(ass.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <Link
                            to={`/student/assignments/${ass._id}`}
                            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            Open <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentAssignmentList;
