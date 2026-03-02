
import { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    Menu, Bell, Search, LogOut, ChevronDown,
    User, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            whileHover={{ x: 5 }}
            onClick={() => hasItems && setIsOpen(!isOpen)}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-sm ${active || isChildActive
                ? 'bg-blue-600/10 text-blue-600 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <div className="flex items-center space-x-3">
                <div className={`${active || isChildActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} `}>
                    {icon}
                </div>
                <span>{label}</span>
            </div>
            {hasItems && (
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
        </motion.div>
    );

    return (
        <div className="space-y-1">
            {hasItems ? content : <Link to={to}>{content}</Link>}

            <AnimatePresence>
                {hasItems && isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-11 space-y-1"
                    >
                        {items.map((item, idx) => (
                            <Link key={idx} to={item.to}>
                                <div className={`py-2 px-4 rounded-lg text-sm transition-all ${location.pathname === item.to ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
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
}

const DashboardLayout = ({ children, menuItems, role }: DashboardLayoutProps) => {
    const { logout, user } = useContext(AuthContext)!;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();

    // Auto-close sidebar on mobile route change
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="h-screen bg-gray-50 flex font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarOpen ? 240 : 0,
                    opacity: isSidebarOpen ? 1 : 0
                }}
                className="bg-white border-r border-gray-200 fixed h-full z-30 hidden md:block overflow-hidden"
            >
                <div className="p-4 flex items-center space-x-3 border-b border-gray-100 h-16">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg flex items-center justify-center shadow-sm">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                <path d="M4 19.5V4.5C4 4.22386 4.22386 4 4.5 4H9.5C10.3284 4 11 4.67157 11 5.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 19.5V4.5C20 4.22386 19.7761 4 19.5 4H14.5C13.6716 4 13 4.67157 13 5.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11 19.5C11 18.6716 11.6716 18 12.5 18C13.3284 18 14 18.6716 14 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7 10L9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 10L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7 14L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 14L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                                AAES<span className="text-indigo-600">.</span>
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Menu
                    </div>
                    {menuItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            {...item}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Sidebar Overlay & Drawer - Wrapped in md:hidden to prevent Desktop interference */}
            <div className="md:hidden">
                <AnimatePresence>
                    {isSidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="fixed inset-0 bg-black/50 z-40"
                            />
                            <motion.aside
                                initial={{ x: -240 }}
                                animate={{ x: 0 }}
                                exit={{ x: -240 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="fixed inset-y-0 left-0 w-[240px] bg-white z-50 border-r border-gray-200 overflow-y-auto"
                            >
                                <div className="p-4 flex items-center justify-between border-b border-gray-100 h-16">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg flex items-center justify-center shadow-sm">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                                <path d="M4 19.5V4.5C4 4.22386 4.22386 4 4.5 4H9.5C10.3284 4 11 4.67157 11 5.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M20 19.5V4.5C20 4.22386 19.7761 4 19.5 4H14.5C13.6716 4 13 4.67157 13 5.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M11 19.5C11 18.6716 11.6716 18 12.5 18C13.3284 18 14 18.6716 14 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M7 10L9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M15 10L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M7 14L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M15 14L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                                                AAES<span className="text-indigo-600">.</span>
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                        <LogOut className="w-5 h-5 rotate-180" />
                                    </button>
                                </div>
                                <nav className="p-4 space-y-1">
                                    {menuItems.map((item, index) => (
                                        <SidebarItem
                                            key={index}
                                            {...item}
                                            active={location.pathname === item.to}
                                        />
                                    ))}
                                </nav>
                                <div className="p-4 border-t border-gray-100">
                                    <button
                                        onClick={logout}
                                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Sign Out</span>
                                    </button>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-[240px]' : ''} min-w-0`}>
                {/* Topbar */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden md:flex items-center space-x-2 text-gray-400 bg-gray-100 px-4 py-2 rounded-xl w-64 md:w-96">
                            <Search className="w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none focus:outline-none w-full text-sm text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-700 leading-none">{user?.fullName || user?.username}</p>
                                    {user?.role === 'staff' && user?.isAdvisor ? (
                                        <p className="text-xs text-indigo-600 mt-0.5 font-medium">
                                            Staff · Class Advisor – {user.advisorYear}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-0.5 capitalize">{role}</p>
                                    )}
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {/* Dropdown */}
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
                                    >
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">My Account</p>
                                        </div>
                                        <Link to="/profile" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Profile
                                        </Link>
                                        <Link to="/settings" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                            <Settings className="w-4 h-4" /> Settings
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
