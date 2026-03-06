import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { UserCog, CheckCircle, AlertCircle, Save, RefreshCw, Users, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const YEAR_COLORS: Record<string, { bg: string; border: string; text: string; activeBg: string; activeBorder: string }> = {
    '1st Year': { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', activeBg: 'bg-blue-600', activeBorder: 'border-blue-600' },
    '2nd Year': { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', activeBg: 'bg-purple-600', activeBorder: 'border-purple-600' },
    '3rd Year': { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', activeBg: 'bg-emerald-600', activeBorder: 'border-emerald-600' },
    '4th Year': { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', activeBg: 'bg-orange-500', activeBorder: 'border-orange-500' },
};

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HODClassAdvisors = () => {
    const { token, user } = useContext(AuthContext)!;
    const [staffList, setStaffList] = useState<any[]>([]);
    const [advisors, setAdvisors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeYear, setActiveYear] = useState<string>('1st Year');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => { fetchData(); }, [token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [staffRes, advisorRes] = await Promise.all([
                axios.get(`${API}/api/users?role=staff&status=all`, config),
                axios.get(`${API}/api/advisor/assignments`, config)
            ]);
            setStaffList(staffRes.data);
            setAdvisors(advisorRes.data);
            if (staffRes.data.length > 0) setSelectedStaff(staffRes.data[0]._id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getAdvisorForYear = (year: string) => advisors.find(a => a.academicYear === year);

    const handleAssign = async () => {
        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API}/api/advisor/assign`, {
                academicYear: activeYear,
                staffId: selectedStaff
            }, config);
            await fetchData();
            showToast('Advisor assigned successfully!', 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to assign advisor.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const assignedCount = YEARS.filter(y => getAdvisorForYear(y)).length;

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -16, x: '100%' }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg font-medium text-sm flex items-center gap-2 border ${toast.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                            }`}
                    >
                        {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UserCog className="w-7 h-7 text-indigo-600" />
                        Class Advisor Management
                    </h1>
                    <p className="text-gray-500 mt-0.5 text-sm">
                        Assign faculty advisors for each year — <span className="font-semibold text-gray-700">{user?.department}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-700 font-semibold">
                        {assignedCount} / {YEARS.length} Years Covered
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Year Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {YEARS.map(year => {
                    const adv = getAdvisorForYear(year);
                    const isActive = activeYear === year;
                    const colors = YEAR_COLORS[year];
                    return (
                        <motion.button
                            key={year}
                            whileHover={{ y: -3, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveYear(year)}
                            className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 overflow-hidden ${isActive
                                ? `${colors.activeBorder} shadow-lg`
                                : `${colors.border} ${colors.bg} hover:shadow-md shadow-sm`
                                }`}
                        >
                            {/* Background color fill for active */}
                            {isActive && (
                                <div className={`absolute inset-0 ${colors.activeBg}`} />
                            )}
                            <div className="relative z-10">
                                <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${isActive ? 'text-white/70' : colors.text}`}>
                                    {year}
                                </div>
                                {adv ? (
                                    <>
                                        <div className={`font-bold text-sm leading-tight ${isActive ? 'text-white' : 'text-gray-800'}`}>
                                            {adv.staff?.fullName || adv.staff?.username}
                                        </div>
                                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isActive ? 'text-white/80' : 'text-green-600'}`}>
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Assigned
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className={`text-sm font-medium ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                                            Not assigned
                                        </div>
                                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isActive ? 'text-white/70' : 'text-amber-500'}`}>
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Unassigned
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Two-panel: Staff list + Assign panel */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Staff List */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <h2 className="font-semibold text-gray-800 text-sm">Department Staff</h2>
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {staffList.length}
                            </span>
                        </div>
                        <Link
                            to="/hod/staff"
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                        >
                            Manage <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="p-8 flex flex-col items-center gap-3 text-gray-400">
                            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : staffList.length === 0 ? (
                        <div className="p-10 flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="font-semibold text-gray-500 text-sm">No staff in {user?.department}</p>
                            <p className="text-xs text-gray-400 text-center max-w-48">
                                First add staff members from the Staff management page
                            </p>
                            <Link
                                to="/hod/staff"
                                className="mt-1 flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Staff
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                            {staffList.map((staff, index) => {
                                const isSelected = selectedStaff === staff._id;
                                const advisorFor = advisors.find(a => a.staff?._id === staff._id);
                                return (
                                    <motion.button
                                        key={staff._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => setSelectedStaff(staff._id)}
                                        className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-all ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {(staff.fullName || staff.username).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-semibold text-sm ${isSelected ? 'text-indigo-800' : 'text-gray-800'}`}>
                                                {staff.fullName || staff.username}
                                            </div>
                                            <div className="text-xs text-gray-400 truncate">{staff.email}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            {advisorFor && (
                                                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                                                    {advisorFor.academicYear}
                                                </span>
                                            )}
                                            {isSelected && (
                                                <CheckCircle className="w-4 h-4 text-indigo-500" />
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Assignment Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className={`px-5 py-4 ${YEAR_COLORS[activeYear].activeBg}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <UserCog className="w-4 h-4 text-white" />
                                <h2 className="font-semibold text-white text-sm">{activeYear}</h2>
                            </div>
                            <p className="text-white/70 text-xs">
                                {getAdvisorForYear(activeYear)
                                    ? `Currently: ${getAdvisorForYear(activeYear)?.staff?.username}`
                                    : 'No advisor assigned yet'}
                            </p>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Current State */}
                            {getAdvisorForYear(activeYear) ? (
                                <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                                        {(getAdvisorForYear(activeYear)?.staff?.fullName || getAdvisorForYear(activeYear)?.staff?.username || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-green-800">
                                            {getAdvisorForYear(activeYear)?.staff?.fullName || getAdvisorForYear(activeYear)?.staff?.username}
                                        </div>
                                        <div className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Advisor for {activeYear}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 text-amber-700 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    No advisor assigned for {activeYear}
                                </div>
                            )}

                            {/* Warning if replacing */}
                            {getAdvisorForYear(activeYear) && selectedStaff && getAdvisorForYear(activeYear)?.staff?._id !== selectedStaff && (
                                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-700 flex items-start gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    Assigning will replace <strong>{getAdvisorForYear(activeYear)?.staff?.username}</strong>
                                </div>
                            )}

                            {/* Selected Staff Preview */}
                            {selectedStaff && staffList.length > 0 && (
                                <div className="p-3 border border-indigo-100 bg-indigo-50 rounded-xl">
                                    <p className="text-xs text-indigo-500 mb-1 font-medium">Selected Staff:</p>
                                    <p className="text-sm font-semibold text-indigo-800">
                                        {staffList.find(s => s._id === selectedStaff)?.fullName ||
                                            staffList.find(s => s._id === selectedStaff)?.username}
                                    </p>
                                </div>
                            )}

                            {/* Assign Button */}
                            <button
                                onClick={handleAssign}
                                disabled={saving || !selectedStaff || staffList.length === 0}
                                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm ${selectedStaff && staffList.length > 0
                                    ? `${YEAR_COLORS[activeYear].activeBg} text-white hover:opacity-90 shadow-md`
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {saving ? (
                                    <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Confirm for {activeYear}</>
                                )}
                            </button>

                            {staffList.length === 0 && (
                                <Link to="/hod/staff" className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-2">
                                    <Plus className="w-4 h-4" /> Add staff first
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Quick Summary */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">All Assignments</h3>
                        {YEARS.map(year => {
                            const adv = getAdvisorForYear(year);
                            const colors = YEAR_COLORS[year];
                            return (
                                <div key={year} className="flex items-center justify-between text-sm">
                                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${colors.bg} ${colors.text}`}>
                                        {year}
                                    </span>
                                    <span className={`font-medium ${adv ? 'text-gray-700' : 'text-gray-300'}`}>
                                        {adv ? (adv.staff?.fullName || adv.staff?.username) : '— Unassigned'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODClassAdvisors;
