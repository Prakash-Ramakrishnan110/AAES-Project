import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Phone, Building, Calendar, Edit2, Save, Camera, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useParams, useNavigate } from 'react-router-dom';
import StudentProfile from './StudentProfile';
import StaffProfile from './StaffProfile';
import HODProfile from './HODProfile';
import AdminProfile from './AdminProfile';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
    const { token, user: authUser, updateUser } = useContext(AuthContext)!;
    const { id } = useParams(); // For viewing other users (Admin/HOD)
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Edit Form State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: ''
    });
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Advisor-specific student editing
    const [isAdvisorEditingReg, setIsAdvisorEditingReg] = useState(false);
    const [tempRegNumber, setTempRegNumber] = useState('');
    const [isUpdatingReg, setIsUpdatingReg] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // If ID is present and different from current user, fetch that user (if HOD/Admin)
            // Otherwise fetch 'me'
            const endpoint = id && id !== authUser?.id
                ? `${API}/api/profile/user/${id}`
                : `${API}/api/profile/me`;

            console.log(`[Profile] Fetching from: ${endpoint}`);
            const { data } = await axios.get(endpoint, config);
            console.log(`[Profile] Success: Found user ${data.username}`);
            setProfile(data);
            setFormData({
                fullName: data.fullName || '',
                phone: data.phone || ''
            });
            setImagePreview(null);
            setProfileImageFile(null);
        } catch (error: any) {
            console.error("[Profile] Error fetching profile:", error.response?.status, error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getDashboardPath = () => {
        if (!authUser) return '/';
        switch (authUser.role) {
            case 'admin': return '/admin/dashboard';
            case 'hod': return '/hod/dashboard';
            case 'staff': return '/staff/dashboard';
            case 'student': return '/student/dashboard';
            case 'principal': return '/principal/dashboard';
            default: return '/';
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            const updatedData = new FormData();
            updatedData.append('fullName', formData.fullName);
            updatedData.append('phone', formData.phone);
            if (profileImageFile) {
                updatedData.append('profileImage', profileImageFile);
            }

            const { data } = await axios.put(`${API}/api/profile/me`, updatedData, config);
            setProfile({ ...profile, ...data });
            setIsEditing(false);
            setImagePreview(null);
            setProfileImageFile(null);
            // Update AuthContext so topbar/sidebar reflect new name immediately
            updateUser({
                fullName: data.fullName || formData.fullName,
                phone: data.phone || formData.phone,
                profileImage: data.profileImage || profile.profileImage
            });
            setToastMessage({ text: 'Profile Updated Successfully!', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error) {
            console.error(error);
            setToastMessage({ text: 'Failed to update profile', type: 'error' });
        }
    };

    const handleAdvisorRegUpdate = async () => {
        if (!tempRegNumber.trim()) return;
        setIsUpdatingReg(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/advisor/student/${profile._id}/register-number`, { registerNumber: tempRegNumber }, config);
            setProfile({ ...profile, registerNumber: tempRegNumber });
            setIsAdvisorEditingReg(false);
            setToastMessage({ text: 'Register Number Updated!', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error: any) {
            setToastMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
        } finally {
            setIsUpdatingReg(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!profile) return (
        <div className="p-12 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
            <div className="p-4 bg-red-50 rounded-full mb-4">
                <ArrowLeft className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-500 mb-8">The user profile you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate(getDashboardPath())}>
                Return to Dashboard
            </Button>
        </div>
    );

    const isOwnProfile = !id || id === authUser?.id;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 relative min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 px-4 py-2 hover:bg-white rounded-xl text-gray-600 hover:text-indigo-600 transition-all duration-200 shadow-sm border border-gray-100 hover:border-indigo-100"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-semibold text-sm">Back</span>
                </button>
                
                <button
                    onClick={() => navigate(getDashboardPath())}
                    className="group flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-gray-600 hover:text-indigo-600 transition-all duration-200 shadow-sm border border-gray-100 hover:border-indigo-100"
                >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="font-semibold text-sm">Dashboard</span>
                </button>
            </div>
            {/* Custom Toast Notification */}
            {toastMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-lg font-medium border text-sm flex items-center gap-2
                        ${toastMessage.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                    {toastMessage.text}
                </motion.div>
            )}

            {/* Top Navigation */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(getDashboardPath())}
                    className="group flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-all duration-200 shadow-sm border border-transparent hover:border-gray-200 mt-2"
                >
                    <div className="bg-white p-1 rounded-md shadow-sm border border-gray-100 group-hover:bg-gray-50 flex items-center justify-center transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                    </div>
                    <span className="font-medium text-sm">Dashboard</span>
                </button>
            </div>

            {/* Header Card */}
            <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white bg-gray-200 flex items-center justify-center text-gray-400 text-4xl font-bold shadow-md overflow-hidden bg-white">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : profile.profileImage && profile.profileImage.trim() !== '' ? (
                                    <img src={`${API}${profile.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    profile.username?.charAt(0).toUpperCase()
                                )}
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-2 right-2 p-1.5 bg-white rounded-lg shadow border border-gray-200 text-gray-600 hover:text-blue-600">
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex-1 pt-2 md:pt-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold text-gray-900">{profile.fullName || profile.username}</h1>
                                        <div className="flex items-center gap-2">
                                            {isAdvisorEditingReg ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input
                                                        value={tempRegNumber}
                                                        onChange={e => setTempRegNumber(e.target.value)}
                                                        className="px-2 py-0.5 text-[10px] font-bold border border-indigo-300 rounded outline-none focus:ring-1 focus:ring-indigo-400 w-24"
                                                        placeholder="Enter ID..."
                                                        autoFocus
                                                    />
                                                    <button onClick={handleAdvisorRegUpdate} disabled={isUpdatingReg} className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
                                                        <Save className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => setIsAdvisorEditingReg(false)} className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                                                        <ArrowLeft className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {profile.registerNumber && (
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold tracking-wider uppercase border border-gray-200 mt-1">
                                                            {profile.registerNumber}
                                                        </span>
                                                    )}
                                                    {authUser?.role === 'staff' && profile.role === 'student' && !isOwnProfile && (
                                                        <button 
                                                            onClick={() => {
                                                                setTempRegNumber(profile.registerNumber || '');
                                                                setIsAdvisorEditingReg(true);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors mt-1"
                                                            title="Edit Register Number"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                                        <span className="capitalize px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold tracking-wider border border-blue-100">
                                            {profile.role}
                                        </span>
                                        {profile.department && (
                                            <span className="flex items-center gap-1 text-sm">
                                                <Building className="w-3.5 h-3.5" /> {profile.department}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {isOwnProfile && !isEditing && (
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-6 mt-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <Input
                                label="Full Name"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            />
                            <Input
                                label="Phone Number"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            setProfileImageFile(e.target.files[0]);
                                            setImagePreview(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }}
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8 mt-8">
                            {/* Contact Info */}
                            <div className="w-full lg:w-1/3 xl:w-1/4 space-y-4 shrink-0">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Email Address</p>
                                            <p className="font-medium text-gray-900">{profile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Phone Number</p>
                                            <p className="font-medium text-gray-900">{profile.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Joined</p>
                                            <p className="font-medium text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Info */}
                            <div className="w-full lg:w-2/3 xl:w-3/4 space-y-4">
                                {profile.role === 'student' && (
                                    <>
                                        {/* Student Specific Academic Details summary */}
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Academic Details</h3>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                <div>
                                                    <p className="text-xs text-gray-500">Register Number</p>
                                                    <p className="font-semibold text-gray-900">{profile.registerNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Academic Year</p>
                                                    <p className="font-semibold text-gray-900">{profile.academicYear || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Semester</p>
                                                    <p className="font-semibold text-gray-900">{profile.semester || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Batch / Section</p>
                                                    <p className="font-semibold text-gray-900">{profile.batch || '-'} {profile.section ? `/ ${profile.section}` : ''}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <StudentProfile stats={profile.stats || {}} studentId={id || authUser?.id || ''} token={token || ''} />
                                    </>
                                )}
                                {profile.role === 'staff' && (
                                    <>
                                        {/* Staff Specific Handling Details */}
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Academic Handling</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-xs text-gray-500">Academic Year(s)</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {profile.stats?.subjectsList?.length > 0
                                                            ? [...new Set(profile.stats.subjectsList.map((s: any) => s.academicYear || s.year || 'N/A'))].join(', ')
                                                            : 'No active years'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Semester(s)</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {profile.stats?.subjectsList?.length > 0
                                                            ? [...new Set(profile.stats.subjectsList.map((s: any) => s.semester))].sort().join(', ')
                                                            : 'No active semesters'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <StaffProfile stats={profile.stats || {}} />
                                    </>
                                )}
                                {profile.role === 'hod' && <HODProfile stats={profile.stats || {}} department={profile.department} />}
                                {profile.role === 'admin' && <AdminProfile stats={profile.stats || {}} />}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Profile;
