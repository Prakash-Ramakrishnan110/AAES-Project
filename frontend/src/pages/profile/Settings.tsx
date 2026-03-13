import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Bell, Palette, User,
    Mail,
    Check, AlertCircle,
    ArrowLeft, Award, Briefcase, GraduationCap, Building2
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
            // Refresh form values from the server's response to confirm what was saved
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
            const msg = error.response?.data?.message || 'Update failed';
            setToastMessage({ text: msg, type: 'error' });
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
        if (passwordData.newPassword.length < 6) {
            setToastMessage({ text: 'Password must be at least 6 characters', type: 'error' });
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
        { id: 'account', label: 'Account', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    ];

    const getRoleIcon = () => {
        switch (authUser?.role) {
            case 'admin': return <Award size={14} />;
            case 'hod': return <Building2 size={14} />;
            case 'staff': return <Briefcase size={14} />;
            case 'student': return <GraduationCap size={14} />;
            default: return <User size={14} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
            {/* Simple Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`fixed bottom-8 right-8 z-50 px-5 py-3 rounded-lg shadow-lg border flex items-center gap-3 font-medium
                            ${toastMessage.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-700'}`}
                    >
                        {toastMessage.type === 'success' ? <Check className="text-green-500" size={18} /> : <AlertCircle className="text-red-500" size={18} />}
                        {toastMessage.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5">
                                {getRoleIcon()} {authUser?.role}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">Configure your account and application preferences.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Simplified Sidebar */}
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                            : 'text-gray-600 hover:bg-white hover:text-gray-900'}`}
                                >
                                    <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Main Card */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 md:p-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        {activeTab === 'account' && (
                                            <div className="space-y-8">
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900">Account Information</h2>
                                                    <p className="text-sm text-gray-500">Update your basic profile and contact details.</p>
                                                </div>

                                                <form onSubmit={handleUpdateAccount} className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <Input
                                                            label="Full Name"
                                                            value={accountData.fullName}
                                                            onChange={e => setAccountData({ ...accountData, fullName: e.target.value })}
                                                            placeholder="John Doe"
                                                            className="text-sm"
                                                        />
                                                        <Input
                                                            label="Phone Number"
                                                            value={accountData.phone}
                                                            onChange={e => setAccountData({ ...accountData, phone: e.target.value })}
                                                            placeholder="+1 234 567 890"
                                                            className="text-sm"
                                                        />
                                                        {authUser?.role === 'student' && (
                                                            <>
                                                                <Input
                                                                    label="Blood Group"
                                                                    value={accountData.bloodGroup}
                                                                    onChange={e => setAccountData({ ...accountData, bloodGroup: e.target.value })}
                                                                    placeholder="e.g. O+"
                                                                    className="text-sm"
                                                                />
                                                                <Input
                                                                    label="Schooling Details"
                                                                    value={accountData.schooling}
                                                                    onChange={e => setAccountData({ ...accountData, schooling: e.target.value })}
                                                                    placeholder="e.g. CBSE / State Board"
                                                                    className="text-sm"
                                                                />
                                                                <Input
                                                                    label="Current CGPA"
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={accountData.currentCgpa}
                                                                    onChange={e => setAccountData({ ...accountData, currentCgpa: e.target.value })}
                                                                    placeholder="e.g. 8.5"
                                                                    className="text-sm"
                                                                />
                                                                <Input
                                                                    label="History of Arrears"
                                                                    type="number"
                                                                    value={accountData.historyOfArrears}
                                                                    onChange={e => setAccountData({ ...accountData, historyOfArrears: e.target.value })}
                                                                    placeholder="Total Arrears (0 if none)"
                                                                    className="text-sm"
                                                                />
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-4">
                                                        <Mail size={18} className="text-gray-400" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                                            <p className="text-sm font-semibold text-gray-700">{authUser?.email}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                                        <Button
                                                            type="submit"
                                                            isLoading={isLoading}
                                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                                                        >
                                                            Save Changes
                                                        </Button>
                                                    </div>
                                                </form>

                                                <div className="pt-8 border-t border-gray-100">
                                                    <h3 className="text-sm font-bold text-red-600 mb-1">Danger Zone</h3>
                                                    <p className="text-xs text-gray-500 mb-4">Permanent actions regarding your account.</p>
                                                    <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">
                                                        Deactivate Account
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'security' && (
                                            <div className="space-y-8">
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>
                                                    <p className="text-sm text-gray-500">Keep your account secure by updating your password.</p>
                                                </div>

                                                <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                                                    <Input
                                                        label="Current Password"
                                                        type="password"
                                                        value={passwordData.currentPassword}
                                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        required
                                                    />
                                                    <Input
                                                        label="New Password"
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        required
                                                    />
                                                    <Input
                                                        label="Confirm New Password"
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        required
                                                    />
                                                    <div className="flex justify-end pt-4">
                                                        <Button
                                                            type="submit"
                                                            isLoading={isLoading}
                                                            className="px-6 py-2 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg"
                                                        >
                                                            Update Password
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {activeTab === 'notifications' && (
                                            <div className="space-y-8">
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
                                                    <p className="text-sm text-gray-500">Choose how and when you want to be notified.</p>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">General</h3>
                                                        <ToggleRow
                                                            label="Email Alerts"
                                                            description="Critical account and security updates."
                                                            isEnabled={preferences.notifications.email}
                                                            onToggle={() => handleUpdatePreferences({
                                                                ...preferences,
                                                                notifications: { ...preferences.notifications, email: !preferences.notifications.email }
                                                            })}
                                                        />
                                                        <ToggleRow
                                                            label="In-App Notifications"
                                                            description="System notices and message indicators."
                                                            isEnabled={preferences.notifications.inApp}
                                                            onToggle={() => handleUpdatePreferences({
                                                                ...preferences,
                                                                notifications: { ...preferences.notifications, inApp: !preferences.notifications.inApp }
                                                            })}
                                                        />
                                                    </div>

                                                    <div className="space-y-4 pt-4">
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role Specific</h3>
                                                        {authUser?.role === 'student' && (
                                                            <ToggleRow
                                                                label="Academic Alerts"
                                                                description="Updates on marks and attendance."
                                                                isEnabled={preferences.notifications.academicAlerts}
                                                                onToggle={() => handleUpdatePreferences({
                                                                    ...preferences,
                                                                    notifications: { ...preferences.notifications, academicAlerts: !preferences.notifications.academicAlerts }
                                                                })}
                                                            />
                                                        )}
                                                        {authUser?.role === 'staff' && (
                                                            <ToggleRow
                                                                label="Teaching Alerts"
                                                                description="Student submissions and mentorship."
                                                                isEnabled={preferences.notifications.teachingAlerts}
                                                                onToggle={() => handleUpdatePreferences({
                                                                    ...preferences,
                                                                    notifications: { ...preferences.notifications, teachingAlerts: !preferences.notifications.teachingAlerts }
                                                                })}
                                                            />
                                                        )}
                                                        {authUser?.role === 'hod' && (
                                                            <ToggleRow
                                                                label="Department Updates"
                                                                description="Faculty reports and department stats."
                                                                isEnabled={preferences.notifications.deptAlerts}
                                                                onToggle={() => handleUpdatePreferences({
                                                                    ...preferences,
                                                                    notifications: { ...preferences.notifications, deptAlerts: !preferences.notifications.deptAlerts }
                                                                })}
                                                            />
                                                        )}
                                                        {authUser?.role === 'admin' && (
                                                            <ToggleRow
                                                                label="System Governance"
                                                                description="User registrations and security logs."
                                                                isEnabled={preferences.notifications.systemAlerts}
                                                                onToggle={() => handleUpdatePreferences({
                                                                    ...preferences,
                                                                    notifications: { ...preferences.notifications, systemAlerts: !preferences.notifications.systemAlerts }
                                                                })}
                                                            />
                                                        )}
                                                        <ToggleRow
                                                            label="Assignments"
                                                            description="New tasks and upcoming deadlines."
                                                            isEnabled={preferences.notifications.assignments}
                                                            onToggle={() => handleUpdatePreferences({
                                                                ...preferences,
                                                                notifications: { ...preferences.notifications, assignments: !preferences.notifications.assignments }
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'appearance' && (
                                            <div className="space-y-10">
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
                                                    <p className="text-sm text-gray-500">Customize the look and feel of your workspace.</p>
                                                </div>

                                                <div className="space-y-8">
                                                    <section className="space-y-4">
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Interface Theme</h3>
                                                        <div className="flex gap-4">
                                                            {['light', 'dark', 'system'].map((t) => (
                                                                <button
                                                                    key={t}
                                                                    disabled={t === 'dark'}
                                                                    onClick={() => handleUpdatePreferences({
                                                                        ...preferences,
                                                                        appearance: { ...preferences.appearance, theme: t }
                                                                    })}
                                                                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-bold capitalize transition-all
                                                                        ${preferences.appearance.theme === t
                                                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                                            : 'border-gray-100 hover:border-gray-200 text-gray-500'}
                                                                        ${t === 'dark' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                >
                                                                    {t} {t === 'dark' && '(Soon)'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </section>

                                                    <section className="space-y-4">
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Font Scaling</h3>
                                                        <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                                                            {['small', 'medium', 'large'].map((size) => (
                                                                <button
                                                                    key={size}
                                                                    onClick={() => handleUpdatePreferences({
                                                                        ...preferences,
                                                                        appearance: { ...preferences.appearance, fontSize: size }
                                                                    })}
                                                                    className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all
                                                                        ${preferences.appearance.fontSize === size
                                                                            ? 'bg-white text-gray-900 shadow-sm'
                                                                            : 'text-gray-500 hover:text-gray-700'}`}
                                                                >
                                                                    {size}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </section>

                                                    <div className="pt-4">
                                                        <ToggleRow
                                                            label="Compact View"
                                                            description="Minimize spacing to show more content."
                                                            isEnabled={preferences.appearance.compactView}
                                                            onToggle={() => handleUpdatePreferences({
                                                                ...preferences,
                                                                appearance: { ...preferences.appearance, compactView: !preferences.appearance.compactView }
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-20 text-center text-xs text-gray-400 font-medium">
                AAES Settings &bull; v1.0.0
            </footer>
        </div>
    );
};

const ToggleRow = ({ label, description, isEnabled, onToggle }: any) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <p className="text-sm font-bold text-gray-800">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <button
            onClick={onToggle}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    </div>
);

export default Settings;
