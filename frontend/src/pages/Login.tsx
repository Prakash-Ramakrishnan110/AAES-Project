import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, User, Users, GraduationCap, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showManual, setShowManual] = useState(false);

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
            // Animation delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: emailVal,
                password: passwordVal
            });
            const { token, ...userData } = response.data;

            if (userData.requiresPasswordChange) {
                // Intercept login and force password change
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

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${tempToken}` } };
            const response = await axios.post('http://localhost:5000/api/auth/change-password', { newPassword }, config);

            const { token, ...userData } = response.data;

            login(token, userData);

            switch (userData.role) {
                case 'admin': navigate('/admin/dashboard'); break;
                case 'hod': navigate('/hod/dashboard'); break;
                case 'staff': navigate('/staff/dashboard'); break;
                case 'student': navigate('/student/dashboard'); break;
                case 'principal': navigate('/principal/dashboard'); break;
                default: navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password.');
            setIsLoading(false);
        }
    };

    const handleDemoLogin = (role: string) => {
        let creds = { email: '', password: 'password123' };
        switch (role) {
            case 'admin': creds.email = 'admin@aaes.com'; break;
            case 'hod': creds.email = 'hod.cse@aaes.com'; break;
            case 'staff': creds.email = 'staff@aaes.com'; break;
            case 'mentor': creds.email = 'staff@aaes.com'; break;
            case 'student': creds.email = 'student@aaes.com'; break;
            case 'principal': creds.email = 'principal@aaes.com'; break;
        }
        processLogin(creds.email, creds.password);
    };

    const demoAccounts = [
        { id: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" />, color: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' },
        { id: 'hod', label: 'HOD', icon: <Users className="w-5 h-5" />, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' },
        { id: 'staff', label: 'Faculty / Mentor', icon: <User className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' },
        { id: 'principal', label: 'Principal', icon: <Shield className="w-5 h-5" />, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20' },
        { id: 'student', label: 'Student', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                {/* Clean Card */}
                <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-xl">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                        <path d="M4 19.5V4.5C4 4.22386 4.22386 4 4.5 4H9.5C10.3284 4 11 4.67157 11 5.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M20 19.5V4.5C20 4.22386 19.7761 4 19.5 4H14.5C13.6716 4 13 4.67157 13 5.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M11 19.5C11 18.6716 11.6716 18 12.5 18C13.3284 18 14 18.6716 14 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7 10L9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M15 10L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7 14L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M15 14L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
                                        AAES<span className="text-indigo-600">.</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-500 text-sm">
                            {isChangingPassword ? 'Please secure your account with a new password' : 'Select a demo account to get started'}
                        </p>
                    </div>

                    {!isChangingPassword ? (
                        <>
                            {/* Quick Login Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-8">
                                {demoAccounts.map((acc) => (
                                    <button
                                        key={acc.id}
                                        onClick={() => handleDemoLogin(acc.id)}
                                        disabled={isLoading}
                                        className={`
                                    flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-300 group
                                    ${acc.color.replace('bg-', 'hover:bg-').replace('text-', 'text-gray-700 hover:text-').replace('border-', 'border-gray-200 hover:border-')} 
                                    bg-gray-50 hover:shadow-md
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
                                `}
                                    >
                                        <div className="p-1.5 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all">
                                            {acc.icon}
                                        </div>
                                        <span className="font-bold text-[10px] text-gray-700">{acc.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-100"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <button
                                        onClick={() => setShowManual(!showManual)}
                                        className="px-4 py-1 bg-white text-gray-500 hover:text-gray-700 transition-colors rounded-full flex items-center gap-2 border border-gray-200 shadow-sm"
                                    >
                                        Or sign in manually <ChevronDown className={`w-3 h-3 transition-transform ${showManual ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showManual && (
                                    <motion.form
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        {error && (
                                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                                                {error}
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                    placeholder="Email Address"
                                                    required
                                                />
                                            </div>

                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                    placeholder="Password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>

                                            <Button
                                                isLoading={isLoading}
                                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
                                            >
                                                Sign In
                                            </Button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <AnimatePresence>
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={handlePasswordChangeSubmit}
                                className="space-y-4 overflow-hidden"
                            >
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="New Password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="Confirm New Password"
                                            required
                                        />
                                    </div>

                                    <Button
                                        isLoading={isLoading}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
                                    >
                                        Update Password & Continue
                                    </Button>
                                </div>
                            </motion.form>
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
