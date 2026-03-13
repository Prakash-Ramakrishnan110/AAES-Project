import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, User, Users, GraduationCap, ChevronRight, Loader2, LayoutDashboard } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Force Password Change State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [tempToken, setTempToken] = useState('');

    const { login } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const processLogin = async (emailVal: string, passwordVal: string) => {
        setError('');
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const response = await axios.post(`${API}/api/auth/login`, {
                email: emailVal,
                password: passwordVal
            });
            const { token, ...userData } = response.data;

            if (userData.requiresPasswordChange) {
                setTempToken(token);
                setIsChangingPassword(true);
                setIsLoading(false);
                return;
            }

            login(token, userData);

            switch (userData.role) {
                case 'admin': navigate('/admin/dashboard'); break;
                case 'hod': navigate('/hod/dashboard'); break;
                case 'staff': navigate('/staff/dashboard'); break;
                case 'student': navigate('/student/dashboard'); break;
                case 'principal': navigate('/principal/dashboard'); break;
                case 'lab-assistant': navigate('/labassistant/dashboard'); break;
                default: navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials.');
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        processLogin(email, password);
    };

    const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters long.'); return; }

        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${tempToken}` } };
            const response = await axios.post(`${API}/api/auth/change-password`, { newPassword }, config);
            const { token, ...userData } = response.data;
            login(token, userData);
            switch (userData.role) {
                case 'admin': navigate('/admin/dashboard'); break;
                case 'hod': navigate('/hod/dashboard'); break;
                case 'staff': navigate('/staff/dashboard'); break;
                case 'student': navigate('/student/dashboard'); break;
                case 'principal': navigate('/principal/dashboard'); break;
                case 'lab-assistant': navigate('/labassistant/dashboard'); break;
                default: navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password.');
            setIsLoading(false);
        }
    };

    const handleDemoLogin = (role: string) => {
        const creds = { email: '', password: 'password123' };
        switch (role) {
            case 'admin': creds.email = 'admin@aaes.com'; break;
            case 'hod': creds.email = 'hod.cse@aaes.com'; break;
            case 'staff': creds.email = 'staff@aaes.com'; break;
            case 'student': creds.email = 'student@aaes.com'; break;
            case 'principal': creds.email = 'principal@aaes.com'; break;
            case 'lab-assistant': 
                creds.email = 'lab@aaes.com'; 
                creds.password = 'lab123';
                break;
        }
        processLogin(creds.email, creds.password);
    };

    const roles = [
        { id: 'admin', label: 'Admin', full: 'Administrator', icon: <Shield className="w-4 h-4" /> },
        { id: 'hod', label: 'HOD', full: 'Dept Head', icon: <Users className="w-4 h-4" /> },
        { id: 'principal', label: 'Principal', full: 'Institutional', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'staff', label: 'Faculty', full: 'Academic Staff', icon: <User className="w-4 h-4" /> },
        { id: 'student', label: 'Student', full: 'Portal Access', icon: <User className="w-4 h-4" /> },
        { id: 'lab-assistant', label: 'Lab Asst', full: 'Lab Assistant', icon: <LayoutDashboard className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-indigo-100 overflow-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#001d66 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }}></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.06)] border border-slate-200/50 overflow-hidden relative"
            >
                {/* Optimized Left Panel: Compact Grid */}
                <div className="p-8 lg:p-12 bg-slate-50/40 border-r border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">AAES</h1>
                                <p className="text-[8px] uppercase font-bold text-slate-400 tracking-widest mt-1">Academic Portal</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-950 tracking-tight mb-2">Institutional Entrance</h2>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                                Access the secure academic management system via role-based authentication or manual credentials.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {roles.map((acc, index) => (
                                <button
                                    key={acc.id}
                                    onClick={() => handleDemoLogin(acc.id)}
                                    disabled={isLoading}
                                    className={`
                                        flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200/60 bg-white 
                                        hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm transition-all duration-200 group
                                        ${index === roles.length - 1 && roles.length % 2 !== 0 ? 'col-span-2 flex-row items-center py-3' : ''}
                                        disabled:opacity-50
                                    `}
                                >
                                    <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                        {acc.icon}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[13px] font-bold text-slate-700 group-hover:text-slate-950">{acc.label}</p>
                                        <p className="text-[10px] text-slate-400 font-medium group-hover:text-slate-500">{acc.full}</p>
                                    </div>
                                    {index === roles.length - 1 && roles.length % 2 !== 0 && (
                                        <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-900 transition-all" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 flex items-center justify-between text-slate-400 border-t border-slate-200/50 pt-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Security Architecture</span>
                            <span className="text-[10px] font-bold flex items-center gap-1.5 mt-1 text-emerald-600/80">
                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                Institutional Node Active
                            </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 italic">v4.0.2</span>
                    </div>
                </div>

                {/* Tightened Right Panel: Auth Form */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    {!isChangingPassword ? (
                        <div className="w-full max-sm mx-auto">
                            <div className="mb-10 text-center lg:text-left">
                                <h3 className="text-xl font-bold text-slate-950 tracking-tight mb-1">Member Access</h3>
                                <p className="text-slate-500 text-[13px] font-medium">Verify credentials for session activation</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 ml-1">Work Identifier</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 pl-11 pr-4 text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-300 shadow-sm"
                                            placeholder="institutional.email@portal"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Access Key</label>
                                        <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-slate-950 transition-colors">Reset Key?</button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 pl-11 pr-11 text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-300 shadow-sm"
                                            placeholder="••••••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 px-1 py-1">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-200 text-slate-900 focus:ring-slate-900 cursor-pointer" />
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Maintain Active Session</span>
                                </div>

                                <button
                                    disabled={isLoading}
                                    className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl text-[13px] font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Initialize Login Sequence'
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm mx-auto">
                            <div className="mb-10 lg:text-left text-center">
                                <h3 className="text-xl font-bold text-slate-950 tracking-tight mb-1">Key Initialization</h3>
                                <p className="text-slate-500 text-[13px] font-medium">Reset your temporary credentials</p>
                            </div>

                            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 pl-11 pr-11 text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-300 shadow-sm"
                                            placeholder="Establish New Key"
                                            required
                                        />
                                    </div>

                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 pl-11 pr-4 text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-300 shadow-sm"
                                            placeholder="Confirm Access Key"
                                            required
                                        />
                                    </div>

                                    <button
                                        disabled={isLoading}
                                        className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl text-[13px] font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 mt-2"
                                    >
                                        Finalize Key Reset
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
