import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Building, BookOpen, GraduationCap,
    Activity, Database, Server
} from 'lucide-react';
import Card from '../../components/ui/Card';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const { token } = useContext(AuthContext)!;
    const [stats, setStats] = useState<any>({
        studentCount: 0,
        staffCount: 0,
        deptCount: 0,
        subjectCount: 0,
        storage: null,
        systemHealth: { database: 'Loading...', apiServer: 'Loading...', aiEngine: 'Loading...' }
    });

    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API}/api/users/stats/system`, config);
                if (isMounted) setStats(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchStats();
        // Poll every 30 seconds
        const intervalId = setInterval(fetchStats, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [token]);

    const barData = [
        { name: 'Departments', count: stats.deptCount },
        { name: 'Staff', count: stats.staffCount },
        { name: 'Students', count: stats.studentCount },
        { name: 'Subjects', count: stats.subjectCount },
    ];

    const pieData = stats.storage ? [
        { name: 'Used', value: parseFloat(stats.storage.percentUsed), color: '#3B82F6' },
        { name: 'Available', value: 100 - parseFloat(stats.storage.percentUsed), color: '#E5E7EB' },
    ] : [
        { name: 'System', value: 100, color: '#F3F4F6' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900">AAES &ndash; Admin Dashboard</h1>
                    <p className="text-gray-500">Monitor platform health and user metrics.</p>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                    <Activity className="w-4 h-4" />
                    <span>All Systems Operational</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.studentCount}
                    icon={<GraduationCap className="w-6 h-6 text-blue-600" />}
                    color="bg-blue-50"
                />
                <StatCard
                    title="Faculty Members"
                    value={stats.staffCount}
                    icon={<Users className="w-6 h-6 text-teal-600" />}
                    color="bg-teal-50"
                />
                <StatCard
                    title="Departments"
                    value={stats.deptCount}
                    icon={<Building className="w-6 h-6 text-purple-600" />}
                    color="bg-purple-50"
                />
                <StatCard
                    title="Active Subjects"
                    value={stats.subjectCount}
                    icon={<BookOpen className="w-6 h-6 text-orange-600" />}
                    color="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="lg:col-span-2" title="User Distribution">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* System Health / Status */}
                <div className="space-y-6">
                    <Card title="System Health">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <Database className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Database</div>
                                        <div className="text-xs text-gray-500">MongoDB Cluster</div>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${stats.systemHealth.database === 'Healthy' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                    {stats.systemHealth.database}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Server className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">API Server</div>
                                        <div className="text-xs text-gray-500">Node.js / Express</div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {stats.systemHealth.apiServer}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">AI Engine</div>
                                        <div className="text-xs text-gray-500">Python / Ollama</div>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${stats.systemHealth.aiEngine === 'Ready' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                    {stats.systemHealth.aiEngine}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Storage Usage">
                        <div className="flex items-center justify-center h-48">
                            {stats.storage ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#3B82F6" />
                                            <Cell fill="#E5E7EB" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-gray-300 text-xs italic">Calculating...</div>
                            )}
                        </div>
                        <div className="text-center mt-[-20px]">
                            <span className="text-2xl font-bold text-gray-900">
                                {stats.storage ? `${stats.storage.percentUsed}%` : '—'}
                            </span>
                            <p className="text-xs text-gray-500">
                                {stats.storage ? `${stats.storage.totalSizeMB} MB of 1 GB used` : 'Storage information loading'}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className={`p-4 rounded-xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

export default AdminDashboard;
