import React, { useContext } from 'react';
import { Menu, Bell, Search, LogOut, User, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
    role: string;
    onMenuClick: () => void;
    isSidebarOpen: boolean;
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const Header = ({ role, onMenuClick, title, actions }: HeaderProps) => {
    const { user, logout } = useContext(AuthContext)!;

    return (
        <header className="h-[var(--header-height)] bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-5 flex items-center justify-between shrink-0 shadow-sm shadow-black/[0.02]">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onMenuClick}
                    className="xl:hidden"
                >
                    <Menu className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="hidden md:flex items-center gap-2 text-[12px] text-muted-foreground font-medium uppercase tracking-wider">
                        <span>AAES</span>
                        <ChevronRight size={12} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-[14px] font-semibold text-foreground m-0 truncate tracking-tight">
                            {title || 'Dashboard'}
                        </h1>
                    </div>
                </div>
            </div>
 
            <div className="flex items-center gap-4">
                {actions && (
                    <div className="hidden md:flex items-center gap-2 pr-4 border-r border-border">
                        {actions}
                    </div>
                )}
 
                <div className="hidden lg:flex items-center gap-2 bg-muted/50 border border-border px-3 h-8 rounded-md w-64 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring transition-all duration-200 group">
                    <Search className="w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary" />
                    <input
                        type="text"
                        placeholder="Quick search..."
                        className="bg-transparent border-none focus:outline-none w-full text-[12.5px] text-foreground placeholder:text-muted-foreground font-medium"
                    />
                </div>
 
                <button className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 relative group active:scale-95">
                    <Bell className="w-4.5 h-4.5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse"></span>
                </button>
 
                <div className="relative group/user flex items-center gap-3 pl-4 border-l border-border">
                    <div className="text-right hidden sm:block">
                        <p className="text-[13px] font-semibold text-foreground leading-none mb-0.5">{user?.fullName || user?.username}</p>
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-widest opacity-80">{role}</p>
                    </div>
                    
                    <div className="relative">
                        <Avatar className="cursor-pointer border-2 border-transparent group-hover/user:border-primary/20 transition-all duration-300 h-9 w-9">
                            <AvatarImage src={user?.profileImage || ''} />
                            <AvatarFallback>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        
                        <div className="absolute right-0 top-full mt-2 w-48 bg-popover rounded-md shadow-xl border border-border opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 z-50 p-1.5 scale-95 group-hover/user:scale-100 origin-top-right">
                            <div className="px-3 py-2 border-b border-border mb-1 lg:hidden">
                                <p className="text-[12px] font-semibold text-foreground truncate">{user?.fullName || user?.username}</p>
                                <p className="text-[10px] font-medium text-muted-foreground">{role}</p>
                            </div>
                            <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all duration-200">
                                <User size={15} /> My Profile
                            </Link>
                            <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all duration-200">
                                <SettingsIcon size={15} /> System Config
                            </Link>
                            <div className="h-px bg-border my-1.5"></div>
                            <button 
                               onClick={logout}
                               className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-semibold text-destructive hover:bg-destructive/10 rounded-md transition-all duration-200"
                            >
                                <LogOut size={15} /> Terminate Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

