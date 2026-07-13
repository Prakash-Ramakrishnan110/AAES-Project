import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    ShieldCheck, CheckCircle2, 
    XCircle, Building2, Calendar, Award,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PublicVerification: React.FC = () => {
    const { hash } = useParams<{ hash: string }>();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (hash) verify();
    }, [hash]);

    const verify = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/degree/verify/${hash}`);
            setResult(res.data);
            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification Failed');
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-16 h-16 border-4 border-indigo-500 border-t-white rounded-full mb-6"
            />
            <div className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500">Authenticating Hash...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full"
            >
                {error ? (
                    <div className="bg-slate-900 p-12 rounded-[56px] border-2 border-rose-500/20 text-center shadow-2xl shadow-rose-900/20">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                            <XCircle className="w-10 h-10 text-rose-500" />
                        </div>
                        <h2 className="text-3xl font-semibold text-white mb-2 uppercase tracking-tighter">Verification Failed</h2>
                        <p className="text-slate-400 mb-8 font-medium">The provided cryptographic hash does not match any certificate in our secure database.</p>
                        <button onClick={() => window.location.href = '/'} className="px-8 py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-semibold uppercase tracking-widest hover:bg-slate-700 transition-all">
                            Return to Portal
                        </button>
                    </div>
                ) : (
                    <div className="bg-slate-900 rounded-[64px] border border-slate-800 shadow-2xl overflow-hidden">
                        <div className="bg-indigo-600 p-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-white" />
                                <div className="text-[10px] font-semibold text-white uppercase tracking-widest">Verified Academic Credential</div>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>

                        <div className="p-12">
                            <div className="flex items-center gap-8 mb-12">
                                <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-slate-700 overflow-hidden shrink-0">
                                    {result.degree.student?.profileImage ? (
                                        <img src={result.degree.student.profileImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-3xl font-semibold">
                                            {result.degree.student?.fullName?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-semibold text-white tracking-tighter uppercase">{result.degree.student?.fullName}</h2>
                                    <div className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mt-1">Roll: {result.degree.student?.rollNumber}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-12">
                                <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-800">
                                    <Award className="w-5 h-5 text-slate-500 mb-3" />
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Degree Conferred</div>
                                    <div className="text-sm font-semibold text-white uppercase">{result.degree.degreeName}</div>
                                </div>
                                <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-800">
                                    <Building2 className="w-5 h-5 text-slate-500 mb-3" />
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Department</div>
                                    <div className="text-sm font-semibold text-white uppercase">{result.degree.department}</div>
                                </div>
                                <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-800">
                                    <Calendar className="w-5 h-5 text-slate-500 mb-3" />
                                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Batch Year</div>
                                    <div className="text-sm font-semibold text-white">{result.degree.batch}</div>
                                </div>
                                <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-800 text-center flex flex-col justify-center border-l-4 border-l-indigo-500">
                                    <div className="text-[9px] font-semibold text-indigo-400 uppercase tracking-widest mb-1">Status</div>
                                    <div className="text-lg font-semibold text-white uppercase tracking-tighter">VALIDATED</div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
                                <div className="text-[9px] font-semibold text-slate-600 font-mono">HASH: {result.degree.verificationHash.substr(0, 32)}</div>
                                <div className="flex items-center gap-2 text-slate-500 group cursor-pointer hover:text-white transition-colors">
                                    <Search className="w-4 h-4" />
                                    <span className="text-[10px] font-semibold uppercase tracking-widest">Global Registry</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PublicVerification;

