import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, FileText, Search, Sparkles } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentStudyResources = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API}/api/study-materials`, config);
                setResources(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [token]);

    const filtered = resources.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900">Study Resources</h1>
                    <p className="text-gray-500">Access class notes, questions, and get help from AAES AI</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search by title or subject..."
                    className="flex-1 outline-none text-gray-700 bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-semibold text-gray-900">No resources available.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(r => (
                        <div key={r._id}
                            onClick={() => navigate(`/student/resources/${r._id}`)}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full"
                        >
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {r.type}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{r.title}</h3>
                                <p className="text-sm font-semibold text-indigo-600 mb-2">{r.subjectId?.name || 'Unknown Subject'}</p>
                                <p className="text-xs text-gray-400 font-medium">{r.unit}</p>
                            </div>

                            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 rounded-b-2xl flex items-center justify-between">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">{r.academicYear} · Sem {r.semester}</span>
                                {r.extractedText && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                        <Sparkles className="w-3 h-3" /> Ask AI Ready
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentStudyResources;
