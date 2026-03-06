
import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    BookOpen, CheckCircle, Clock, Award,
    ArrowRight, Star, MessageSquare
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ReEvaluationModal from '../../components/modals/ReEvaluationModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentDashboard = () => {
    const { token, user } = useContext(AuthContext)!;
    const [stats, setStats] = useState({
        totalAssignments: 0,
        submittedCount: 0,
        pendingCount: 0,
        avgMarks: 0
    });
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

    // Mentorship State
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [queries, setQueries] = useState<any[]>([]);
    const [newQuery, setNewQuery] = useState({ queryType: 'Academic', priority: 'Medium', message: '' });
    const [submittingQuery, setSubmittingQuery] = useState(false);

    // Re-evaluation State
    const [selectedSubForReEval, setSelectedSubForReEval] = useState<any | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const statsRes = await axios.get(`${API}/api/submissions/stats/student`, config);
                setStats(statsRes.data);

                const subsRes = await axios.get(`${API}/api/submissions/my`, config);
                setRecentSubmissions(subsRes.data.slice(0, 5));

                const queriesRes = await axios.get(`${API}/api/mentorship`, config);
                setQueries(queriesRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [token]);

    const handleSubmitQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuery.message.trim()) return;
        setSubmittingQuery(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(`${API}/api/mentorship`, newQuery, config);
            setQueries([res.data, ...queries]);
            setNewQuery({ queryType: 'Academic', priority: 'Medium', message: '' });
            setShowQueryModal(false);
            alert('Query submitted successfully to your Class Advisor.');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error submitting query');
        } finally {
            setSubmittingQuery(false);
        }
    };

    const openQueriesCount = queries.filter(q => q.status === 'Open').length;
    const isQueryLimitReached = openQueriesCount >= 3;

    const performanceData = recentSubmissions.map(s => ({
        name: (s.assignment?.title || 'Unknown').substring(0, 15) + '...',
        score: s.status === 'graded' ? s.marks : 0
    })).reverse();

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 md:p-8 shadow-md">
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold font-display mb-2">
                        AAES &ndash; Student Dashboard
                    </h1>
                    <p className="text-xl font-medium text-blue-100 mb-2">
                        Welcome back, {(user as any)?.fullName || user?.username}! 👋
                    </p>
                    <p className="text-blue-100 text-base max-w-2xl mb-6">
                        You have <span className="font-bold text-white">{stats.pendingCount} pending assignments</span> this week.
                        Keep up the great work on your learning journey.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/student/assignments">
                            <Button variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>
                                View Assignments
                            </Button>
                        </Link>
                        <Button
                            onClick={() => setShowQueryModal(true)}
                            disabled={isQueryLimitReached}
                            title={isQueryLimitReached ? "Maximum of 3 open queries allowed. Wait for resolution." : "Ask your Class Advisor"}
                            className={`border ${isQueryLimitReached ? 'bg-gray-400/20 text-white/50 cursor-not-allowed border-transparent' : 'bg-white/20 text-white hover:bg-white/30 border-white/30'}`}
                            icon={<MessageSquare className="w-4 h-4" />}
                        >
                            {isQueryLimitReached ? 'Query Limit Reached' : 'Ask Advisor'}
                        </Button>
                    </div>
                </div>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-20 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Assignments"
                    value={stats.totalAssignments}
                    icon={<BookOpen className="w-5 h-5 text-blue-600" />}
                    color="bg-blue-50"
                />
                <StatCard
                    title="Completed"
                    value={stats.submittedCount}
                    icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                    color="bg-green-50"
                />
                <StatCard
                    title="Pending"
                    value={stats.pendingCount}
                    icon={<Clock className="w-5 h-5 text-orange-600" />}
                    color="bg-orange-50"
                />
                <StatCard
                    title="Average Score"
                    value={`${stats.avgMarks}% `}
                    icon={<Award className="w-5 h-5 text-purple-600" />}
                    color="bg-purple-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <Card className="lg:col-span-2" title="Performance Overview">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card title="Recent Activity">
                    <div className="space-y-6">
                        {recentSubmissions.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No recent activity.</p>
                        ) : (
                            recentSubmissions.map((sub) => (
                                <div key={sub._id} className="flex items-start space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${sub.status === 'graded' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {sub.status === 'graded' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {sub.assignment?.title || 'Unknown Assignment'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {sub.status === 'graded' && (
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center text-sm font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                                                <Star className="w-3 h-3 text-yellow-400 mr-1 fill-current" />
                                                {sub.marks}
                                            </div>
                                            <button
                                                onClick={() => setSelectedSubForReEval(sub)}
                                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                                            >
                                                Re-evaluate?
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <Link to="/student/assignments" className="block text-center">
                            <Button variant="ghost" size="sm" className="text-blue-600">
                                View All Activity
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Mentorship Queries */}
                <Card title="Mentorship Queries">
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {queries.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 text-sm">No mentorship queries found.</p>
                        ) : (
                            queries.map((q) => (
                                <div key={q._id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                                            {q.queryType}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {q.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium mb-2">{q.message}</p>
                                    {q.reply && (
                                        <div className="mt-3 p-3 bg-indigo-50 border-l-2 border-indigo-400 rounded-r-lg">
                                            <p className="text-xs text-indigo-900 font-semibold mb-1">Advisor Reply:</p>
                                            <p className="text-xs text-gray-700">{q.reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <Button
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => setShowQueryModal(true)}
                        >
                            New Query
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Query Modal */}
            {showQueryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-xl font-bold text-gray-800">Contact Class Advisor</h3>
                            <button onClick={() => setShowQueryModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitQuery} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    value={newQuery.queryType}
                                    onChange={(e) => setNewQuery({ ...newQuery, queryType: e.target.value })}
                                >
                                    <option>Academic</option>
                                    <option>Personal</option>
                                    <option>Attendance</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    value={newQuery.priority}
                                    onChange={(e) => setNewQuery({ ...newQuery, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Explain your concern or query..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                                    value={newQuery.message}
                                    onChange={(e) => setNewQuery({ ...newQuery, message: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4 border-t">
                                <button type="button" onClick={() => setShowQueryModal(false)} className="flex-1 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submittingQuery} className="flex-1 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                    {submittingQuery ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Re-evaluation Modal */}
            {selectedSubForReEval && (
                <ReEvaluationModal
                    isOpen={!!selectedSubForReEval}
                    onClose={() => setSelectedSubForReEval(null)}
                    submission={selectedSubForReEval}
                />
            )}
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

export default StudentDashboard;
