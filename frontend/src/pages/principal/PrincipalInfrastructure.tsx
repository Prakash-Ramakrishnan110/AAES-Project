import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Building2, Users, GraduationCap, BookOpen,
    ArrowUpRight
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PrincipalInfrastructure = () => {
    const { token } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [depts, setDepts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInfra = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/governance/principal/infrastructure`, config);
                setDepts(data);
            } catch (error) {
                console.error('Error fetching infra', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInfra();
    }, [token]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-5 space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-600" /> Infrastructure Health
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">Departmental resource utilization and deployment status.</p>
                </div>
                {/* Summary badge */}
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700">{depts.length} Departments Synced</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {depts.map((dept, i) => (
                    <motion.div
                        key={dept.name}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Resource Health</p>
                                    <p className="text-base font-bold text-emerald-600">{dept.resourceHealth}%</p>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 mb-3">{dept.name}</h3>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Users className="w-3.5 h-3.5 text-indigo-500 mb-1" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Staff</p>
                                    <p className="text-sm font-bold text-slate-900">{dept.staffCount}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500 mb-1" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Students</p>
                                    <p className="text-sm font-bold text-slate-900">{dept.studentCount}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <BookOpen className="w-3.5 h-3.5 text-indigo-500 mb-1" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Curriculum</p>
                                    <p className="text-sm font-bold text-slate-900">{dept.subjectCount}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                        Synced <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/principal/audit?dept=${encodeURIComponent(dept.name)}`)}
                                className="w-full mt-3 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5"
                            >
                                Full Dept Audit <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default PrincipalInfrastructure;
