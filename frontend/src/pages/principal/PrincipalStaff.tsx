import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Users, Award, Mail, Shield, TrendingUp
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

    if (loading || !data) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const totalStaff = data.distribution.reduce((a: number, b: any) => a + b.count, 0);

    return (
        <div className="p-5 space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" /> Academic Leadership
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">Executive directory of HODs and departmental faculty leadership.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Distribution */}
                    <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl">
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 opacity-50" /> Faculty Distribution
                        </h2>
                        <div className="space-y-3">
                            {data.distribution.map((d: any) => (
                                <div key={d.department} className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-70">
                                        <span>{d.department}</span>
                                        <span>{d.count} Staff</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(d.count / totalStaff) * 100}%` }}
                                            className="h-full bg-indigo-400"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Elite Faculty Card */}
                    <div className="bg-indigo-600 p-5 rounded-2xl text-white">
                        <Award className="w-6 h-6 mb-3 opacity-70" />
                        <h3 className="text-base font-bold">Elite Faculty</h3>
                        <p className="text-xs font-medium opacity-80 mt-1.5 leading-relaxed">
                            Current ratio is <span className="text-slate-100 font-bold bg-white/20 px-1.5 py-0.5 rounded">1:18</span> staff-to-student.
                        </p>
                    </div>

                    {/* Bar Chart Summary */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-widest">Staff Per Dept</h3>
                        <div className="h-36">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.distribution} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: 11 }}
                                    />
                                    <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* HOD Directory */}
                <div className="lg:col-span-2 space-y-3">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Departmental Heads</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.hods.map((hod: any, i: number) => {
                            const displayName = hod.fullName || hod.username || 'Unknown';
                            const initial = displayName[0].toUpperCase();
                            return (
                                <motion.div
                                    key={hod._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {initial}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-slate-800">{displayName}</h3>
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{hod.department || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                                            <Mail className="w-3 h-3" /> {hod.email || '—'}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                                            <Shield className="w-3 h-3" /> Last login: {hod.lastLogin ? new Date(hod.lastLogin).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/profile/${hod._id}`)}
                                        className="w-full mt-3 py-2 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all font-bold"
                                    >
                                        View Full Performance
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrincipalStaff;
