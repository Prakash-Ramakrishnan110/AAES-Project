import { useEffect, useState, useContext, cloneElement } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { HeaderOptions } from '../../components/layout/AdminLayout';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Users, Building, BookOpen, GraduationCap,
    Activity, Database, Server, TrendingUp,
    Calendar, Shield, Cpu, LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import SectionCard from '../../components/ui/SectionCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const { token } = useContext(AuthContext)!;
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();
    const [stats, setStats] = useState<any>({
        studentCount: 0,
        staffCount: 0,
        deptCount: 0,
        subjectCount: 0,
        storage: null,
        systemHealth: { database: 'Loading...', apiServer: 'Loading...', aiEngine: 'Loading...' }
    });

    useEffect(() => {
        setHeaderOptions({
            title: 'Infrastructure Administration',
            subtitle: (
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">Institutional metrics & health monitoring</span>
                </div>
            ),
            actions: (
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-600">2026 Aggregate</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-5 py-2.5 rounded-md text-[12px] font-semibold border border-emerald-200 shadow-soft">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span className="uppercase tracking-widest">Systems Nominal</span>
                    </div>
                </div>
            )
        });
    }, [setHeaderOptions]);

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
        const intervalId = setInterval(fetchStats, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [token]);

    const barData = [
        { name: 'Depts', count: stats.deptCount },
        { name: 'Staff', count: stats.staffCount },
        { name: 'Students', count: stats.studentCount },
        { name: 'Subjects', count: stats.subjectCount },
    ];

    return (
        <div className="space-y-4">
            {/* SaaS Stat Cards - 4 per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Students"
                    value={stats.studentCount}
                    icon={<GraduationCap />}
                    trend="+12%"
                    color="blue"
                />
                <StatCard
                    title="Faculty"
                    value={stats.staffCount}
                    icon={<Users />}
                    trend="+4%"
                    color="blue"
                />
                <StatCard
                    title="Departments"
                    value={stats.deptCount}
                    icon={<Building />}
                    trend="+2"
                    color="green"
                />
                <StatCard
                    title="Courses"
                    value={stats.subjectCount}
                    icon={<BookOpen />}
                    trend="+18%"
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Main Analytics Chart */}
                <div className="lg:col-span-8">
                    <SectionCard 
                        title="User Distribution" 
                        subtitle="Density across academic roles"
                        icon={<LayoutDashboard />}
                    >
                        <div className="mt-2 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                                        dy={8}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ 
                                            borderRadius: '8px', 
                                            border: '1px solid #e5e7eb', 
                                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                            padding: '8px',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#1e1b4b" radius={[4, 4, 4, 4]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SectionCard>
                </div>

                {/* Infrastructure Nodes Column */}
                <div className="lg:col-span-4 space-y-4">
                    <SectionCard 
                        title="Node Health" 
                        subtitle="Real-time system status"
                        icon={<Cpu />}
                    >
                        <div className="space-y-3 mt-2">
                            <HealthRow 
                                icon={<Database />}
                                title="Primary DB"
                                status={stats.systemHealth.database === 'Healthy' ? 'Online' : 'Warning'}
                                color="blue"
                            />
                            <HealthRow 
                                icon={<Server />}
                                title="API Engine"
                                status="Running"
                                color="blue"
                            />
                            <HealthRow 
                                icon={<TrendingUp />}
                                title="Cognitive AI"
                                status={stats.systemHealth.aiEngine === 'Ready' ? 'Active' : 'Offline'}
                                color="amber"
                            />
                        </div>
                    </SectionCard>
 
                    <SectionCard 
                        title="Resource Hub" 
                        subtitle="Allocation overview"
                        icon={<Shield />}
                    >
                        <div className="mt-2 text-center">
                            <div className="relative inline-flex items-center justify-center p-4">
                                <svg className="w-24 h-24 transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                        strokeDasharray={2 * Math.PI * 40}
                                        strokeDashoffset={2 * Math.PI * 40 * (1 - (stats.storage?.percentUsed || 0) / 100)}
                                        className="text-blue-600 transition-all duration-1000" 
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-xl font-bold block">{stats.storage?.percentUsed || 0}%</span>
                                    <span className="text-[10px] text-gray-500 font-medium">Used</span>
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-[11px] font-semibold text-gray-500">
                                    {stats.storage ? `${stats.storage.totalSizeMB} MB of 1 GB` : 'Calculating...'}
                                </p>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend: string;
    color: 'blue' | 'green' | 'amber';
}

const StatCard = ({ title, value, icon, trend, color }: StatCardProps) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        amber: 'text-amber-600 bg-amber-50'
    };
 
    return (
        <motion.div 
            whileHover={{ y: -2 }}
            className="stat-card-compact flex items-center gap-4 px-5"
        >
            <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                {cloneElement(icon as any, { size: 18, strokeWidth: 2 })}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-tight truncate">{title}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{trend}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 leading-none">{value}</h3>
            </div>
        </motion.div>
    );
};

const HealthRow = ({ icon, title, status, color }: any) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        amber: 'text-amber-600 bg-amber-50'
    };
 
    return (
        <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 border border-gray-100 hover:bg-white transition-all">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                    {cloneElement(icon as any, { size: 16, strokeWidth: 2 })}
                </div>
                <div className="text-[13px] font-bold text-gray-900">{title}</div>
            </div>
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'Active' || status === 'Running' || status === 'Online' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className={`text-[11px] font-bold ${status === 'Active' || status === 'Running' || status === 'Online' ? 'text-green-600' : 'text-red-600'} uppercase tracking-tight`}>
                    {status}
                </span>
            </div>
        </div>
    );
};

export default AdminDashboard;
