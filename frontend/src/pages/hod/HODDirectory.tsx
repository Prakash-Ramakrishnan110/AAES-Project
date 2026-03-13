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
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FolderOpen className="w-7 h-7 text-slate-800" />
                        Department Directory
                    </h1>
                    <p className="text-slate-500 mt-0.5 text-sm">
                        All members of <span className="font-semibold text-slate-700">{user?.department}</span> department
                    </p>
                </div>

                {/* Stats Chips */}
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-md border border-slate-200 shadow-sm">
                        <Users className="w-4 h-4 text-slate-700" />
                        <span className="text-sm font-bold text-slate-800">{staff.length} Staff</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-md border border-slate-200 shadow-sm">
                        <GraduationCap className="w-4 h-4 text-slate-700" />
                        <span className="text-sm font-bold text-slate-800">{students.length} Students</span>
                    </div>
                </div>
            </div>

            {/* Tabs + Search Bar */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-md text-sm">
                        <button
                            onClick={() => { setActiveTab('staff'); setYearFilter(''); }}
                            className={`px-4 py-2 rounded font-bold transition-colors ${activeTab === 'staff' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Staff ({staff.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`px-4 py-2 rounded font-bold transition-colors ${activeTab === 'students' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> Students ({students.length})</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 ml-auto">
                        {activeTab === 'students' && (
                            <select
                                className="text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none"
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
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none w-52"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-semibold">Loading directory...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-md flex items-center justify-center border border-slate-200">
                            {activeTab === 'staff'
                                ? <Users className="w-8 h-8 text-slate-300" />
                                : <GraduationCap className="w-8 h-8 text-slate-300" />}
                        </div>
                        <p className="font-bold text-slate-600">No {activeTab} found</p>
                        <p className="text-sm text-slate-400 font-medium">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 divide-y divide-x-0 md:divide-y-0 md:divide-x divide-slate-200">
                        {filteredData.map((u, index) => {
                            const name = u.fullName || u.username;
                            const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
                            return (
                                <div key={u._id}>
                                    <Link
                                        to={`/profile/${u._id}`}
                                        className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group border-b border-slate-100"
                                    >
                                        {/* Avatar */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-md bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden`}>
                                            {u.profileImage
                                                ? <img src={`${API}${u.profileImage}`} alt={name} className="w-full h-full object-cover" />
                                                : getInitials(name)
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-900 truncate group-hover:text-slate-700 transition-colors text-sm">
                                                    {name}
                                                </h3>
                                                {u.isActive === false && (
                                                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Inactive</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate font-medium">
                                                <Mail className="w-3 h-3 flex-shrink-0" />
                                                {u.email}
                                            </p>
                                            {activeTab === 'students' && (
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    {u.academicYear && (
                                                        <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                            {u.academicYear}
                                                        </span>
                                                    )}
                                                    {u.semester && (
                                                        <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <BookOpen className="w-3 h-3" /> Sem {u.semester}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {activeTab === 'staff' && u.staffId && (
                                                <p className="text-xs text-slate-400 mt-1 font-semibold">ID: {u.staffId}</p>
                                            )}
                                        </div>

                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer count */}
                {!loading && filteredData.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-200 text-xs font-semibold text-slate-500 text-right bg-slate-50">
                        Showing {filteredData.length} of {activeTab === 'staff' ? staff.length : students.length} {activeTab}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HODDirectory;
