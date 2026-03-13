
import { useState, useContext, useEffect, cloneElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    Menu, Bell, Search, LogOut, ChevronDown,
    User, Settings, X, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface HeaderOptions {
    title: string;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
}

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    to: string;
    active?: boolean;
    items?: { label: string; to: string }[];
}

const SidebarItem = ({ icon, label, to, active, items }: SidebarItemProps) => {
    const location = useLocation();
    const hasItems = items && items.length > 0;
    const isChildActive = hasItems && items.some((item: { to: string }) => location.pathname === item.to);
    const [isOpen, setIsOpen] = useState(isChildActive);

    const content = (
        <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => hasItems && setIsOpen(!isOpen)}
            className={`sidebar-link transition-all ${active || isChildActive
                ? 'sidebar-link-active'
                : ''
                }`}
        >
            <div className={`flex items-center space-x-3 ${active || isChildActive ? 'text-primary' : 'text-gray-500'}`}>
                {cloneElement(icon as any, { size: 18, strokeWidth: active || isChildActive ? 2.5 : 2 })}
                <span className="tracking-tight">{label}</span>
            </div>
            {hasItems && (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            )}
        </motion.div>
    );

    return (
        <div className="relative">
            {hasItems ? content : <Link to={to}>{content}</Link>}

            <AnimatePresence>
                {hasItems && isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-10 space-y-0.5 mt-0.5"
                    >
                        {items.map((item, idx) => (
                            <Link key={idx} to={item.to}>
                                <div className={`py-1.5 px-3 rounded-md text-[12px] font-medium transition-colors ${location.pathname === item.to 
                                    ? 'text-primary bg-blue-50' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                                    {item.label}
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface DashboardLayoutProps {
    children: React.ReactNode;
    menuItems: SidebarItemProps[];
    role: string;
    headerTitle?: string;
    headerSubtitle?: React.ReactNode;
    headerActions?: React.ReactNode;
}

const DashboardLayout = ({ children, menuItems, role, headerTitle, headerSubtitle, headerActions }: DashboardLayoutProps) => {
    const { logout, user } = useContext(AuthContext)!;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Notifications State
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: any) => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    // Auto-close sidebar on mobile route change
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1200) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* SaaS Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarOpen ? 220 : 0,
                    x: isSidebarOpen ? 0 : -220
                }}
                className={`sidebar-compact border-r border-gray-200 ${!isSidebarOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            >
                <div className="flex flex-col h-full bg-white">
                    <div className="p-6 flex items-center h-[60px] border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <LayoutDashboard className="text-white w-4 h-4" />
                            </div>
                            <h1 className="text-lg font-semibold tracking-tight text-slate-900">AAES</h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar">
                        <nav className="space-y-0.5">
                            {menuItems.map((item, index) => (
                                <SidebarItem
                                    key={index}
                                    {...item}
                                    active={location.pathname === item.to}
                                />
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={logout}
                            className="flex items-center justify-center space-x-2 px-4 py-2 w-full rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-semibold text-[13px]"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Sidebar Overlay & Drawer */}
            <div className="xl:hidden">
                <AnimatePresence>
                    {isSidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="fixed inset-0 bg-[#0B1437]/40 backdrop-blur-sm z-40"
                            />
                            <motion.aside
                                initial={{ x: -300 }}
                                animate={{ x: 0 }}
                                exit={{ x: -300 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="fixed inset-y-0 left-0 w-[290px] bg-white z-50 overflow-y-auto shadow-premium"
                            >
                                <div className="p-8 flex items-center justify-between h-24 border-b border-[#F4F7FE]">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-premium">
                                             <LayoutDashboard className="text-white w-6 h-6" />
                                        </div>
                                        <span className="text-2xl font-bold text-slate-900 uppercase">AAES</span>
                                    </div>
                                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-[#F4F7FE] rounded-xl transition-colors">
                                        <X className="w-5 h-5 text-[#A3AED0]" />
                                    </button>
                                </div>
                                <nav className="p-6 space-y-2">
                                    {menuItems.map((item, index) => (
                                        <SidebarItem
                                            key={index}
                                            {...item}
                                            active={location.pathname === item.to}
                                        />
                                    ))}
                                </nav>
                                <div className="p-8 mt-auto">
                                    <button
                                        onClick={logout}
                                        className="flex items-center justify-center space-x-3 px-6 py-4 w-full rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all font-semibold text-sm"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'xl:ml-[220px]' : ''} min-w-0 h-screen overflow-hidden`}>
                <header className="h-[60px] bg-white border-b border-gray-200 sticky top-0 z-40 px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden xl:flex p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
 
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-[16px] font-semibold text-slate-900 truncate leading-tight">
                                {headerTitle || 'AAES Institutional Portal'}
                            </h1>
                            {headerSubtitle && (
                                <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">
                                    {headerSubtitle}
                                </div>
                            )}
                        </div>
                    </div>
 
                    <div className="flex items-center gap-3">
                        {headerActions && (
                            <div className="hidden md:flex items-center border-r border-gray-100 pr-3 mr-1">
                                {headerActions}
                            </div>
                        )}
 
                        <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md w-64 transition-all focus-within:ring-1 focus-within:ring-slate-900 focus-within:border-slate-900 group">
                            <Search className="w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none focus:outline-none w-full text-[13px] font-medium text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
 
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="xl:hidden p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="p-3.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all relative"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                                )}
                            </button>
 
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 mt-6 w-96 bg-white rounded-lg shadow-lg border border-slate-100 p-0 z-50 overflow-hidden"
                                    >
                                        <div className="px-8 py-6 border-b border-[#F4F7FE] flex justify-between items-center bg-institutional/30">
                                            <p className="text-[16px] font-semibold text-slate-900">Notifications</p>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-[12px] font-medium text-primary hover:underline"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
                                            {notifications.length === 0 ? (
                                                <div className="px-6 py-12 text-center text-[#A3AED0]">
                                                    <p className="text-[14px] font-bold">All caught up!</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n._id}
                                                        onClick={() => markAsRead(n._id)}
                                                        className={`px-6 py-4 hover:bg-[#F4F7FE] cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className={`text-[13px] leading-tight ${!n.read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                                                {n.title}
                                                            </p>
                                                            {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>}
                                                        </div>
                                                        <p className="text-[12px] text-[#707EAE] line-clamp-2">{n.message}</p>
                                                        <p className="text-[11px] font-medium text-slate-400 mt-2 uppercase">
                                                            {new Date(n.createdAt).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative flex items-center gap-3 pl-4 border-l border-gray-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-semibold text-slate-900 leading-none">{user?.fullName || user?.username}</p>
                                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-1">{role}</p>
                            </div>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[12px] shadow-sm hover:ring-4 hover:ring-blue-100 transition-all"
                            >
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </button>
 
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-soft border border-slate-200 p-1 z-50"
                                    >
                                        <div className="px-4 py-2 border-b border-gray-100 mb-1 sm:hidden">
                                            <p className="text-[13px] font-semibold text-slate-900">{user?.fullName || user?.username}</p>
                                            <p className="text-[10px] font-medium text-gray-500 uppercase mt-0.5">{role}</p>
                                        </div>
                                        <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                                            <User className="w-4 h-4 text-gray-400" /> My Profile
                                        </Link>
                                        <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                                            <Settings className="w-4 h-4 text-gray-400" /> Account Settings
                                        </Link>
                                        <div className="h-px bg-gray-100 my-1 mx-1"></div>
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* SaaS Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
                    <div className="max-w-[1600px] mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
