import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Users, Clock, Search, Filter, Calculator } from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';

// Types
interface Subject {
    _id: string;
    name: string;
    code: string;
    semester: string;
    department?: string;
    academicYear?: string;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MySubjects = () => {
    const { token, user } = useContext(AuthContext)!;
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const staffId = (user as any)?._id || user?.id;
                const res = await axios.get(`${API}/api/subjects?staffId=${staffId}`, config);
                setSubjects(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching subjects:", error);
                setLoading(false);
            }
        };
        const staffId = (user as any)?._id || user?.id;
        if (staffId) {
            fetchSubjects();
        }
    }, [token, user]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900">My Subjects</h1>
                    <p className="text-gray-500">Manage your courses and materials</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300 mx-2 self-center hidden md:block"></div>
                    <span className="text-sm text-gray-500 self-center hidden md:block">
                        Showing {subjects.length} subjects
                    </span>
                </div>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <Card key={subject._id} className="hover:border-blue-200 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">
                                Sem {subject.semester}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{subject.name}</h3>
                        <p className="text-sm text-gray-500 font-medium mb-4">{subject.code} • {subject.academicYear}</p>

                        <div className="space-y-2 mb-5">
                            <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                {subject.department || 'All Departments'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                Subject Active
                            </div>
                        </div>

                        {/* Assessment Action Buttons */}
                        <div className="border-t border-gray-100 pt-4 mt-2 grid grid-cols-2 gap-2">
                            <button
                                onClick={() => navigate(`/staff/internal-marks/${subject._id}`)}
                                className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                            >
                                <Calculator className="w-3.5 h-3.5" /> Internal Marks
                            </button>
                            <button
                                onClick={() => navigate(`/staff/study-resources/${subject._id}`)}
                                className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200 transition-colors"
                            >
                                <BookOpen className="w-3.5 h-3.5" /> Study Resources
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {!loading && subjects.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No subjects found assigned to you.</p>
                </div>
            )}
        </div>
    );
};

export default MySubjects;
