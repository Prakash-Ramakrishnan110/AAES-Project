import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Shield,
    Target, Briefcase, X, ArrowUpRight, Search, Filter,
    ExternalLink, ChevronRight
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip
} from 'recharts';
import { useNavigate } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PrincipalStaff = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userStats, setUserStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/governance/principal/staff`, config);
                setData(data);
            } catch (error) {
                console.error('Error fetching staff', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [token]);

    const fetchPerformance = async (user: any) => {
        setSelectedUser(user);
        setLoadingStats(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: matrixData } = await axios.get(`${API}/api/analytics/principal/faculty-matrix`, config);

            if (user.role === 'hod') {
                const deptStaff = matrixData.filter((s: any) => s.dept === user.department);
                setUserStats({
                    avgYield: deptStaff.length > 0 ? (deptStaff.reduce((a: number, b: any) => a + b.avgMarks, 0) / deptStaff.length).toFixed(1) : 0,
                    activeStaff: deptStaff.length,
                    engagement: deptStaff.length > 0 ? (deptStaff.reduce((a: number, b: any) => a + b.studentEngagement, 0) / deptStaff.length).toFixed(1) : 0
                });
            } else {
                const individual = matrixData.find((s: any) => s.staffName === (user.fullName || user.username));
                setUserStats({
                    avgYield: individual ? individual.avgMarks.toFixed(1) : 0,
                    activeStaff: 1,
                    engagement: individual ? individual.studentEngagement.toFixed(1) : 0
                });
            }
        } catch (error) {
            console.error('Error fetching stats', error);
            setUserStats({ avgYield: 0, activeStaff: 0, engagement: 0 });
        } finally {
            setLoadingStats(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Accessing Institutional Registry...</p>
            </div>
        </div>
    );

    if (!data) return null;

    const filteredStaff = data.staff.filter((s: any) =>
        (s.fullName || s.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">

            {/* Unified Top Header Context */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-40 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase first-letter:uppercase">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                            <Users className="w-5 h-5 text-indigo-600" /> Personnel Management
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Academic Leadership Hub</p>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by faculty name or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 rounded-xl text-xs font-bold transition-all w-full md:w-[320px] outline-none"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Stats Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Institutional Strength</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-900">{(data.distribution || []).reduce((a: number, b: any) => a + (b.count || 0), 0)}</span>
                                <span className="text-sm font-semibold text-slate-400">Total Members</span>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Compliance</p>
                                    <p className="text-lg font-bold text-emerald-600">94.2%</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Utilization</p>
                                    <p className="text-lg font-bold text-indigo-600">88.5%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Departmental Load</h3>
                                <Filter className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                            <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.distribution} margin={{ left: -35 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-12">
                        {/* HOD Leadership Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">Departmental Leadership (HODs)</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.hods.map((hod: any) => (
                                    <div key={hod._id} className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                                {hod.profileImage ? (
                                                    <img src={`${API}${hod.profileImage}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
                                                        {hod.fullName?.charAt(0) || 'H'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{hod.fullName || hod.username}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{hod.department} • Head</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Email</p>
                                                <p className="text-[10px] font-semibold text-slate-700 truncate">{hod.email}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Status</p>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                    <p className="text-[10px] font-semibold text-slate-700">Active</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => fetchPerformance({ ...hod, role: 'hod' })}
                                            className="w-full mt-5 py-3 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            View Details <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Faculty Pool Table */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                                    <Users className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">Faculty Resource Pool</h3>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty Member</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredStaff.map((s: any) => (
                                                <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                                                {s.fullName?.charAt(0) || 'F'}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-900">{s.fullName || s.username}</p>
                                                                <p className="text-[10px] font-medium text-slate-400">{s.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{s.department}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-semibold text-slate-500">{s.academicYear || '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => fetchPerformance({ ...s, role: 'staff' })}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Formal Performance Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl uppercase">
                                        {selectedUser.fullName?.charAt(0) || 'P'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{selectedUser.fullName || selectedUser.username}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedUser.role === 'hod' ? 'Leadership' : 'Faculty'} • {selectedUser.department}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-10 space-y-10">
                                {loadingStats ? (
                                    <div className="py-12 text-center space-y-4">
                                        <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Staff Data...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Academic Yield</p>
                                                <p className="text-2xl font-bold text-emerald-600">{userStats.avgYield}%</p>
                                            </div>
                                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Personnel Size</p>
                                                <p className="text-2xl font-bold text-slate-900">{userStats.activeStaff}</p>
                                            </div>
                                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Engagement</p>
                                                <p className="text-2xl font-bold text-indigo-600">{userStats.engagement}%</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Audit Profile</h4>
                                            <div className="space-y-3">
                                                {[
                                                    { label: 'Leadership Benchmarking', status: 'Optimal', icon: <Briefcase className="w-4 h-4" /> },
                                                    { label: 'Institutional Alignment', status: 'Verified', icon: <Target className="w-4 h-4" /> },
                                                ].map((audit) => (
                                                    <div key={audit.label} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">{audit.icon}</div>
                                                            <span className="text-xs font-bold text-slate-700">{audit.label}</span>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-lg">{audit.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/profile/${selectedUser._id}`)}
                                            className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
                                        >
                                            Full Personnel Profile <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrincipalStaff;
