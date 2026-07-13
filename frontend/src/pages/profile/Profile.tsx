import { useState, useEffect, useContext } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Phone, Building, Calendar, Edit2, Save, Camera, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import StudentProfile from './StudentProfile';
import StaffProfile from './StaffProfile';
import HODProfile from './HODProfile';
import AdminProfile from './AdminProfile';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
    const { token, user: authUser, updateUser } = useContext(AuthContext)!;
    const { id } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: ''
    });
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (options: any) => void }>();

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const isOwnProfile = !id || id === authUser?.id;

    useEffect(() => {
        if (profile) {
            setHeaderOptions({
                title: profile.fullName || profile.username,
                subtitle: `PROTOCOL: ${profile.role.toUpperCase()}`,
                actions: isOwnProfile && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="border-primary/20 text-primary hover:bg-primary/5">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                )
            });
        }
    }, [profile, isEditing, isOwnProfile]);

    const fetchProfile = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const endpoint = id && id !== authUser?.id
                ? `${API}/api/profile/user/${id}`
                : `${API}/api/profile/me`;

            const { data } = await axios.get(endpoint, config);
            setProfile(data);
            setFormData({
                fullName: data.fullName || '',
                phone: data.phone || ''
            });
            setImagePreview(null);
            setProfileImageFile(null);
        } catch (error: any) {
            console.error("[Profile] Error fetching profile:", error.message);
        } finally {
            setIsLoading(false);
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
            updateUser({
                fullName: data.fullName || formData.fullName,
                phone: data.phone || formData.phone,
                profileImage: data.profileImage || profile.profileImage
            });
            setToastMessage({ text: 'Profile Updated Successfully!', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error) {
            setToastMessage({ text: 'Failed to update profile', type: 'error' });
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!profile) return (
        <div className="p-12 text-center bg-white rounded-2xl border border-border shadow-sm">
            <div className="p-4 bg-red-50 rounded-full mb-4 inline-block">
                <ArrowLeft className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-500 mb-8 lowercase tracking-tight">The user profile you're looking for doesn't exist.</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in pb-12">
            {toastMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className={`fixed top-20 right-6 z-[100] px-6 py-3 rounded-xl shadow-lg font-medium border text-sm flex items-center gap-2
                        ${toastMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                    {toastMessage.text}
                </motion.div>
            )}

            {/* Header Card */}
            <div className="relative bg-white rounded-sm shadow-xl border border-border/60 overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                </div>
                <div className="px-10 pb-10">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4 gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-sm border-8 border-white bg-slate-100 flex items-center justify-center text-slate-400 text-5xl font-black shadow-2xl overflow-hidden relative z-10 transition-transform duration-500 group-hover:scale-105">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : profile.profileImage && profile.profileImage.trim() !== '' ? (
                                    <img src={`${API}${profile.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    profile.username?.charAt(0).toUpperCase()
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute bottom-4 right-4 z-20 p-2.5 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-all hover:scale-110">
                                    <Camera className="w-5 h-5" />
                                    <input type="file" accept="image/*" className="hidden" 
                                        onChange={e => {
                                            if (e.target.files?.[0]) {
                                                setProfileImageFile(e.target.files[0]);
                                                setImagePreview(URL.createObjectURL(e.target.files[0]));
                                            }
                                        }} 
                                    />
                                </label>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{profile.fullName || profile.username}</h1>
                                        {profile.registerNumber && (
                                            <span className="px-3 py-1 bg-slate-900 text-white rounded-sm text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg">
                                                {profile.registerNumber}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-500 mt-2 font-bold uppercase tracking-widest text-[11px] opacity-60">
                                        <span className="flex items-center gap-2"><Building size={14} className="text-primary" /> {profile.department || 'GLOBAL'}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-2"><Mail size={14} className="text-primary" /> {profile.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-8 mt-10 bg-slate-50 p-10 rounded-sm border border-border/40">
                            <Input label="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                            <Input label="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button type="submit" className="px-8"><Save className="w-4 h-4 mr-2" /> Save Protocol</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-12 mt-12">
                            {/* Contact Info */}
                            <div className="w-full lg:w-1/4 space-y-6 shrink-0">
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 opacity-40">Identity Context</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-sm border border-border/40">
                                        <div className="p-2 bg-white text-primary rounded-sm shadow-sm"><Mail size={16} /></div>
                                        <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Access</p><p className="font-bold text-slate-900 text-sm">{profile.email}</p></div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-sm border border-border/40">
                                        <div className="p-2 bg-white text-primary rounded-sm shadow-sm"><Phone size={16} /></div>
                                        <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Direct Comms</p><p className="font-bold text-slate-900 text-sm">{profile.phone || 'N/A'}</p></div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-sm border border-border/40">
                                        <div className="p-2 bg-white text-primary rounded-sm shadow-sm"><Calendar size={16} /></div>
                                        <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Protocol Start</p><p className="font-bold text-slate-900 text-sm">{new Date(profile.createdAt).toLocaleDateString()}</p></div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Info */}
                            <div className="flex-1 space-y-8 min-w-0">
                                {profile.role === 'student' && (
                                    <>
                                        <div className="bg-white p-8 rounded-sm shadow-xl border border-border/60">
                                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 opacity-40">Academic Matrix</h3>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                                <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Index ID</p><p className="font-black text-slate-900">{profile.registerNumber || 'N/A'}</p></div>
                                                <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Cycle</p><p className="font-black text-slate-900">{profile.academicYear || 'N/A'}</p></div>
                                                <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Protocol Tier</p><p className="font-black text-slate-900">{profile.semester || 'N/A'}</p></div>
                                                <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Matrix Ref</p><p className="font-black text-slate-900">{profile.batch || '-'} {profile.section ? `/ ${profile.section}` : ''}</p></div>
                                            </div>
                                        </div>
                                        <StudentProfile stats={profile.stats || {}} studentId={id || authUser?.id || ''} token={token || ''} />
                                    </>
                                )}
                                {profile.role === 'staff' && <StaffProfile stats={profile.stats || {}} />}
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
