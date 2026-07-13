import { useState, useContext, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    Shield, Bell, Palette, User,
    Mail, Check, AlertCircle,
    Award, Briefcase, GraduationCap, Building2, Save
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Settings = () => {
    const { token, user: authUser } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'appearance'>('account');
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (options: any) => void }>();

    useEffect(() => {
        setHeaderOptions({
            title: "System Settings",
            subtitle: "PROTOCOL: CONFIGURATION_AND_PREFERENCES",
            actions: null
        });
    }, [setHeaderOptions]);

    // Form States
    const [accountData, setAccountData] = useState({
        fullName: '',
        phone: '',
        bloodGroup: '',
        schooling: '',
        currentCgpa: '',
        historyOfArrears: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [preferences, setPreferences] = useState({
        notifications: {
            email: true,
            inApp: true,
            assignments: true,
            announcements: true,
            academicAlerts: true,
            teachingAlerts: true,
            deptAlerts: true,
            systemAlerts: true
        },
        appearance: {
            theme: 'light',
            fontSize: 'medium',
            compactView: false
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API}/api/auth/profile`, config);
            setAccountData({
                fullName: data.fullName || '',
                phone: data.phone || '',
                bloodGroup: data.bloodGroup || '',
                schooling: data.schooling || '',
                currentCgpa: data.currentCgpa || '',
                historyOfArrears: data.historyOfArrears || ''
            });
            if (data.preferences) {
                setPreferences({
                    ...preferences,
                    ...data.preferences,
                    notifications: {
                        ...preferences.notifications,
                        ...(data.preferences.notifications || {})
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching settings", error);
        }
    };

    const handleUpdatePreferences = async (newPrefs: any) => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/auth/settings`, {
                preferences: newPrefs
            }, config);
            setPreferences(newPrefs);
            setToastMessage({ text: 'Preferences saved', type: 'success' });
        } catch (error: any) {
            setToastMessage({ text: 'Failed to save', type: 'error' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put(`${API}/api/auth/settings`, accountData, config);
            setAccountData({
                fullName: data.fullName || '',
                phone: data.phone || '',
                bloodGroup: data.bloodGroup || '',
                schooling: data.schooling || '',
                currentCgpa: data.currentCgpa || '',
                historyOfArrears: data.historyOfArrears || ''
            });
            setToastMessage({ text: `Profile saved successfully`, type: 'success' });
        } catch (error: any) {
            setToastMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setToastMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API}/api/auth/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, config);
            setToastMessage({ text: 'Password updated successfully', type: 'success' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setToastMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const tabs = [
        { id: 'account', label: 'Account Identity', icon: <User size={18} /> },
        { id: 'security', label: 'Security Firewall', icon: <Shield size={18} /> },
        { id: 'notifications', label: 'Comms Protocol', icon: <Bell size={18} /> },
        { id: 'appearance', label: 'Visual Interface', icon: <Palette size={18} /> },
    ];

    return (
        <div className="space-y-8 animate-in pb-12">
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        className={`fixed top-20 right-6 z-[100] px-6 py-3 rounded-xl shadow-lg font-bold border text-xs flex items-center gap-3 uppercase tracking-widest
                            ${toastMessage.type === 'success' ? 'bg-white border-green-500/20 text-green-600' : 'bg-white border-red-500/20 text-red-600'}`}
                    >
                        {toastMessage.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                        {toastMessage.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 shrink-0 space-y-1">
                    <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Configuration</h3>
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-sm transition-all text-left group
                                    ${isActive
                                        ? 'bg-slate-900 text-white shadow-xl translate-x-1'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 group-hover:translate-x-1'}`}
                            >
                                <span className={isActive ? 'text-primary' : 'text-slate-300'}>{tab.icon}</span>
                                <span className="text-[11px] font-bold uppercase tracking-wider">{tab.label}</span>
                            </button>
                        );
                    })}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-white rounded-sm shadow-2xl border border-border/60 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'account' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Identity Management</h2>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">Update your core profile information</p>
                                        </div>

                                        <form onSubmit={handleUpdateAccount} className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Input label="Full Name" value={accountData.fullName} onChange={e => setAccountData({ ...accountData, fullName: e.target.value })} />
                                                <Input label="Phone Number" value={accountData.phone} onChange={e => setAccountData({ ...accountData, phone: e.target.value })} />
                                                {authUser?.role === 'student' && (
                                                    <>
                                                        <Input label="Blood Group" value={accountData.bloodGroup} onChange={e => setAccountData({ ...accountData, bloodGroup: e.target.value })} />
                                                        <Input label="Schooling" value={accountData.schooling} onChange={e => setAccountData({ ...accountData, schooling: e.target.value })} />
                                                        <Input label="Current CGPA" type="number" step="0.01" value={accountData.currentCgpa} onChange={e => setAccountData({ ...accountData, currentCgpa: e.target.value })} />
                                                        <Input label="Arrears Count" type="number" value={accountData.historyOfArrears} onChange={e => setAccountData({ ...accountData, historyOfArrears: e.target.value })} />
                                                    </>
                                                )}
                                            </div>

                                            <div className="p-6 bg-slate-50 rounded-sm border border-slate-200/60 flex items-center gap-6">
                                                <div className="p-3 bg-white text-primary rounded-sm shadow-sm"><Mail size={20} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authentication ID</p>
                                                    <p className="text-sm font-bold text-slate-900">{authUser?.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-8 border-t border-slate-100">
                                                <Button type="submit" isLoading={isLoading} className="px-10 py-6 text-xs uppercase font-black tracking-widest italic">
                                                    Update Protocol <Save className="ml-2 w-4 h-4" />
                                                </Button>
                                            </div>
                                        </form>

                                        <div className="pt-10 border-t border-slate-100 italic opacity-40 hover:opacity-100 transition-opacity">
                                            <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">Danger Tier</h3>
                                            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-600 transition-colors">
                                                Request Account Decommission
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Security Firewall</h2>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">Manage your authentication credentials</p>
                                        </div>

                                        <form onSubmit={handlePasswordChange} className="max-w-md space-y-8">
                                            <Input label="Current Access Key" type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
                                            <Input label="New Access Key" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
                                            <Input label="Re-Verify Key" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
                                            <div className="flex justify-end pt-4">
                                                <Button type="submit" isLoading={isLoading} className="px-10 py-6 text-xs uppercase font-black tracking-widest italic">
                                                    Cycle Credentials
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Comms Protocol</h2>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">Fine-tune your information flow</p>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Signals</h3>
                                            <ToggleRow label="Email Broadcast" description="Receive critical protocol alerts via email" isEnabled={preferences.notifications.email} onToggle={() => handleUpdatePreferences({ ...preferences, notifications: { ...preferences.notifications, email: !preferences.notifications.email } })} />
                                            <ToggleRow label="Internal HUD" description="Display notifications within the system dashboard" isEnabled={preferences.notifications.inApp} onToggle={() => handleUpdatePreferences({ ...preferences, notifications: { ...preferences.notifications, inApp: !preferences.notifications.inApp } })} />
                                            
                                            <div className="h-4" />
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">System Specifics</h3>
                                            <ToggleRow label="Academic Updates" description="Signals regarding marks and attendance" isEnabled={preferences.notifications.academicAlerts} onToggle={() => handleUpdatePreferences({ ...preferences, notifications: { ...preferences.notifications, academicAlerts: !preferences.notifications.academicAlerts } })} />
                                            <ToggleRow label="Task Assignments" description="New directives and deadline warnings" isEnabled={preferences.notifications.assignments} onToggle={() => handleUpdatePreferences({ ...preferences, notifications: { ...preferences.notifications, assignments: !preferences.notifications.assignments } })} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'appearance' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Visual Interface</h2>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">Personalize your HUD perspective</p>
                                        </div>

                                        <div className="space-y-10">
                                            <section className="space-y-6">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Atmosphere Mode</h3>
                                                <div className="flex gap-4">
                                                    {['light', 'dark', 'matrix'].map((t) => (
                                                        <button key={t} disabled={t !== 'light'} onClick={() => handleUpdatePreferences({ ...preferences, appearance: { ...preferences.appearance, theme: t } })}
                                                            className={`flex-1 py-6 px-4 rounded-sm border font-black uppercase tracking-[0.2em] text-[10px] transition-all
                                                                ${preferences.appearance.theme === t ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'text-slate-400 border-slate-100 hover:border-slate-300'}
                                                                ${t !== 'light' ? 'opacity-20 cursor-not-allowed' : ''}`}
                                                        >
                                                            {t} {t !== 'light' && '(Locked)'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </section>

                                            <ToggleRow label="Data Density" description="Compress interface for maximum information visibility" isEnabled={preferences.appearance.compactView} onToggle={() => handleUpdatePreferences({ ...preferences, appearance: { ...preferences.appearance, compactView: !preferences.appearance.compactView } })} />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

const ToggleRow = ({ label, description, isEnabled, onToggle }: any) => (
    <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
        <div>
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{label}</p>
            <p className="text-[10px] text-slate-500 italic mt-0.5">{description}</p>
        </div>
        <button onClick={onToggle} className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 outline-none ${isEnabled ? 'bg-primary' : 'bg-slate-200'}`}>
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-900 shadow-lg transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

export default Settings;
