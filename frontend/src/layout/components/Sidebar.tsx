import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, ChevronRight } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    navigation: { label: string; icon: React.ReactNode; path: string; children?: any[] }[];
}

export const Sidebar = ({ isOpen, onClose, navigation }: SidebarProps) => {
    const location = useLocation();
 
    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)' }}
                className="hidden xl:flex flex-col h-screen fixed left-0 top-0 z-50 bg-sidebar border-r border-sidebar-border overflow-hidden shadow-xl shadow-black/[0.01]"
            >
                <div className="h-[var(--header-height)] flex items-center px-4 border-b border-sidebar-border shrink-0 bg-sidebar">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 bg-sidebar-primary rounded-md flex items-center justify-center shrink-0 shadow-lg">
                            <LayoutDashboard size={18} className="text-sidebar-primary-foreground" />
                        </div>
                        {isOpen && (
                            <div className="flex flex-col">
                                <span className="font-extrabold text-[14px] text-sidebar-foreground whitespace-nowrap tracking-tighter">
                                    AAES CORE
                                </span>
                                <span className="text-[9px] font-semibold text-sidebar-primary uppercase tracking-widest leading-none">
                                    V1.0.4
                                </span>
                            </div>
                        )}
                    </div>
                </div>
 
                <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                    <nav className="space-y-1.5">
                        {navigation.map((item, idx) => (
                            <SidebarLink 
                                key={idx} 
                                item={item} 
                                isCollapsed={!isOpen} 
                                isActive={location.pathname === item.path || (item.children?.some((c: any) => location.pathname === c.path))}
                            />
                        ))}
                    </nav>
                </div>
                
                <div className={`p-4 border-t border-sidebar-border bg-sidebar-accent/10 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 invisible h-0 p-0'}`}>
                    <div className="bg-sidebar-accent/50 border border-sidebar-border rounded-md p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-semibold text-sidebar-foreground uppercase tracking-widest">Node Health</span>
                        </div>
                        <div className="h-1 w-full bg-sidebar-border rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[92%] rounded-full" />
                        </div>
                    </div>
                </div>
            </motion.aside>
 
            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-color-text/40 backdrop-blur-sm z-[60] xl:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-sidebar z-[70] xl:hidden flex flex-col border-r border-sidebar-border shadow-2xl"
                        >
                            <div className="h-[var(--header-height)] flex items-center justify-between px-5 border-b border-sidebar-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-sidebar-primary rounded-md flex items-center justify-center shadow-lg">
                                        <LayoutDashboard size={18} className="text-sidebar-primary-foreground" />
                                    </div>
                                    <span className="font-extrabold text-[15px] text-sidebar-foreground tracking-tighter uppercase">AAES Core</span>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-sidebar-accent rounded-md transition-all duration-200 text-sidebar-foreground/60 hover:text-sidebar-foreground active:scale-95">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-6 px-4">
                                <nav className="space-y-1.5">
                                    {navigation.map((item, idx) => (
                                        <SidebarLink 
                                            key={idx} 
                                            item={item} 
                                            isActive={location.pathname === item.path || (item.children?.some((c: any) => location.pathname === c.path))}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
 
const SidebarLink = ({ item, isCollapsed, isActive }: any) => {
    return (
        <Link 
            to={item.path}
            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative active:scale-[0.97]
                ${isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm' 
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}
            `}
        >
            <div className={`shrink-0 transition-all duration-200 ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'}`}>
                {React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 }) : item.icon}
            </div>
            {!isCollapsed && <span className="text-[13px] font-medium tracking-wide">{item.label}</span>}
            {isActive && !isCollapsed && <ChevronRight size={14} className="ml-auto opacity-70" />}
            
            {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-popover text-popover-foreground text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-xl border border-border translate-x-[-4px] group-hover:translate-x-0">
                    {item.label}
                </div>
            )}
        </Link>
    );
};

