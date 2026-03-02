import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Phone, BookOpen, Layers, Camera, CheckCircle } from 'lucide-react';

const API = 'http://localhost:5000';

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
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="px-8 py-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <User className="w-8 h-8" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Complete Your Profile</h1>
                    <p className="text-center text-gray-500 mb-8 text-sm">
                        Welcome {user?.fullName || user?.username}! Please provide a few more details before accessing your dashboard.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Profile Image (Optional) */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group-hover:bg-gray-100 transition-colors">
                                    {previewUrl ? (
                                        <img src={previewUrl.startsWith('data:') || previewUrl.startsWith('blob:') ? previewUrl : `${API}${previewUrl}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <span className="text-xs text-gray-400 font-medium">Profile Picture (Optional)</span>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+91 9876543210"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Blood Group */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                    <input
                                        type="text"
                                        required
                                        value={bloodGroup}
                                        onChange={e => setBloodGroup(e.target.value)}
                                        placeholder="e.g. O+"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Schooling */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Schooling Details</label>
                                <div className="relative group">
                                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                    <input
                                        type="text"
                                        required
                                        value={schooling}
                                        onChange={e => setSchooling(e.target.value)}
                                        placeholder="e.g. CBSE / State Board"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* CGPA */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current CGPA</label>
                                <div className="relative group">
                                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={currentCgpa}
                                        onChange={e => setCurrentCgpa(e.target.value)}
                                        placeholder="e.g. 8.5"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* History of Arrears */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">History of Arrears</label>
                                <div className="relative group">
                                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                                    <input
                                        type="number"
                                        required
                                        value={historyOfArrears}
                                        onChange={e => setHistoryOfArrears(e.target.value)}
                                        placeholder="Total Arrears (0 if none)"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
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
