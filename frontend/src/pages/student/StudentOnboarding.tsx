import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Phone, BookOpen, Layers, Camera, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentOnboarding = () => {
    const { user, login } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const [phone, setPhone] = useState(user?.phone || '');
    const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
    const [schooling, setSchooling] = useState(user?.schooling || '');
    const [currentCgpa, setCurrentCgpa] = useState(user?.currentCgpa || '');
    const [historyOfArrears, setHistoryOfArrears] = useState(user?.historyOfArrears || '');

    // Optional
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(user?.profileImage || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If somehow they don't have a user context yet, push them to login
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        // If they are already complete, push them to dashboard
        if (user.phone && user.bloodGroup && user.schooling && user.currentCgpa && user.historyOfArrears) {
            navigate('/student/dashboard');
        }
    }, [user, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('phone', phone);
            formData.append('bloodGroup', bloodGroup);
            formData.append('schooling', schooling);
            formData.append('currentCgpa', currentCgpa);
            formData.append('historyOfArrears', historyOfArrears);

            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const res = await axios.put(`${API}/api/profile/me`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update AuthContext user data
            if (token && res.data) {
                // The profile API returns partial user info. We need to merge it with what we know.
                const updatedUser = { ...user, ...res.data };
                login(token, updatedUser as any);
                // Navigate will happen automatically via useEffect, or we force it here:
                navigate('/student/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-md shadow-sm overflow-hidden border border-slate-200">
                <div className="px-8 py-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-md flex items-center justify-center border border-slate-200">
                            <User className="w-7 h-7" />
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-center text-slate-900 mb-2">Complete Your Profile</h1>
                    <p className="text-center text-slate-500 mb-8 text-sm font-medium">
                        Welcome {user?.fullName || user?.username}! Please provide a few more details before accessing your dashboard.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm text-center border border-red-200 font-medium">
                                {error}
                            </div>
                        )}

                        {/* Profile Image (Optional) */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <div className="w-20 h-20 rounded-md border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                    {previewUrl ? (
                                        <img src={previewUrl.startsWith('data:') || previewUrl.startsWith('blob:') ? previewUrl : `${API}${previewUrl}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-7 h-7 text-slate-400" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Profile Picture (Optional)</span>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900" />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+91 9876543210"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-md py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Blood Group */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Blood Group</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900" />
                                    <input
                                        type="text"
                                        required
                                        value={bloodGroup}
                                        onChange={e => setBloodGroup(e.target.value)}
                                        placeholder="e.g. O+"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors font-medium"
                                    />
                                </div>
                            </div>

                            {/* Schooling */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Schooling Details</label>
                                <div className="relative group">
                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900" />
                                    <input
                                        type="text"
                                        required
                                        value={schooling}
                                        onChange={e => setSchooling(e.target.value)}
                                        placeholder="e.g. CBSE / State Board"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors font-medium"
                                    />
                                </div>
                            </div>

                            {/* CGPA */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Current CGPA</label>
                                <div className="relative group">
                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={currentCgpa}
                                        onChange={e => setCurrentCgpa(e.target.value)}
                                        placeholder="e.g. 8.5"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors font-medium"
                                    />
                                </div>
                            </div>

                            {/* History of Arrears */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">History of Arrears</label>
                                <div className="relative group">
                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900" />
                                    <input
                                        type="number"
                                        required
                                        value={historyOfArrears}
                                        onChange={e => setHistoryOfArrears(e.target.value)}
                                        placeholder="Total Arrears (0 if none)"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-md transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Complete Profile
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentOnboarding;
