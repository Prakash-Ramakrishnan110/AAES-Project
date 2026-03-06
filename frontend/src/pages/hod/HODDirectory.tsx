import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Search, Mail, GraduationCap, Users, BookOpen, ChevronRight, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HODDirectory = () => {
    const { token, user } = useContext(AuthContext)!;
    const [activeTab, setActiveTab] = useState<'staff' | 'students'>('staff');
    const [staff, setStaff] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('');

    useEffect(() => {
        fetchDirectory();
    }, [activeTab]);

    const fetchDirectory = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (activeTab === 'staff') {
                const { data } = await axios.get(`${API}/api/profile/dept/staff`, config);
                setStaff(data);
            } else {
                const { data } = await axios.get(`${API}/api/profile/dept/students`, config);
                setStudents(data);
            }
        } catch (error) {
            console.error("Error fetching directory", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = (activeTab === 'staff' ? staff : students).filter(item => {
        const matchesSearch =
            (item.fullName?.toLowerCase() || item.username.toLowerCase()).includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = yearFilter === '' || item.academicYear === yearFilter;
        return matchesSearch && (activeTab === 'staff' || matchesYear);
    });

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const AVATAR_COLORS = [
        'from-blue-500 to-indigo-500',
        'from-purple-500 to-pink-500',
        'from-emerald-500 to-teal-500',
        'from-orange-400 to-red-500',
        'from-cyan-500 to-blue-500',
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FolderOpen className="w-7 h-7 text-blue-600" />
                        Department Directory
                    </h1>
                    <p className="text-gray-500 mt-0.5 text-sm">
                        All members of <span className="font-semibold text-gray-700">{user?.department}</span> department
                    </p>
                </div>

                {/* Stats Chips */}
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">{staff.length} Staff</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold text-indigo-700">{students.length} Students</span>
                    </div>
                </div>
            </div>

            {/* Tabs + Search Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 p-1 rounded-xl text-sm">
                        <button
                            onClick={() => { setActiveTab('staff'); setYearFilter(''); }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'staff' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Staff ({staff.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'students' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> Students ({students.length})</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 ml-auto">
                        {activeTab === 'students' && (
                            <select
                                className="text-sm px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={yearFilter}
                                onChange={e => setYearFilter(e.target.value)}
                            >
                                <option value="">All Years</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        )}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-52"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Loading directory...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                            {activeTab === 'staff'
                                ? <Users className="w-8 h-8 text-gray-400" />
                                : <GraduationCap className="w-8 h-8 text-gray-400" />}
                        </div>
                        <p className="font-semibold text-gray-600">No {activeTab} found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 divide-y divide-x-0 md:divide-y-0 md:divide-x divide-gray-100">
                        {filteredData.map((u, index) => {
                            const name = u.fullName || u.username;
                            const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
                            return (
                                <motion.div
                                    key={u._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04, duration: 0.3 }}
                                >
                                    <Link
                                        to={`/profile/${u._id}`}
                                        className="flex items-center gap-4 p-5 hover:bg-blue-50/50 transition-all group border-b border-gray-50"
                                    >
                                        {/* Avatar */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden`}>
                                            {u.profileImage
                                                ? <img src={`${API}${u.profileImage}`} alt={name} className="w-full h-full object-cover" />
                                                : getInitials(name)
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors text-sm">
                                                    {name}
                                                </h3>
                                                {u.isActive === false && (
                                                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-medium">Inactive</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                                <Mail className="w-3 h-3 flex-shrink-0" />
                                                {u.email}
                                            </p>
                                            {activeTab === 'students' && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    {u.academicYear && (
                                                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-medium">
                                                            {u.academicYear}
                                                        </span>
                                                    )}
                                                    {u.semester && (
                                                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                                                            <BookOpen className="w-3 h-3" /> Sem {u.semester}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {activeTab === 'staff' && u.staffId && (
                                                <p className="text-xs text-gray-400 mt-0.5">ID: {u.staffId}</p>
                                            )}
                                        </div>

                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Footer count */}
                {!loading && filteredData.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-right">
                        Showing {filteredData.length} of {activeTab === 'staff' ? staff.length : students.length} {activeTab}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HODDirectory;
