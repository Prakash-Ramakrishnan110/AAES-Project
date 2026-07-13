import React, { useState, useEffect, useContext } from 'react';
import { 
    Plus, Search, Bell, Trash2, 
    Send, Radio, Globe,
    Info, Calendar, ArrowRight, User,
    Megaphone, CheckCircle2,
    RefreshCw, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../ui/Modal';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const normalizedAPI = API.endsWith('/api') ? API : `${API}/api`;

interface Announcement {
    _id: string;
    title: string;
    content: string;
    type: 'System' | 'Urgent' | 'Academic' | 'General';
    targetRoles: string[];
    sender: {
        username: string;
        fullName: string;
    };
    createdAt: string;
}

const Communications = () => {
    const { token } = useContext(AuthContext)!;
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        type: 'General' as const,
        targetRoles: ['all']
    });

    useEffect(() => {
        fetchAnnouncements();
    }, [token]);

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${normalizedAPI}/announcements`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post(`${normalizedAPI}/announcements`, newAnnouncement, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            setNewAnnouncement({ title: '', content: '', type: 'General', targetRoles: ['all'] });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error creating announcement:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('CRITICAL: Confirm broadcast termination sequence?')) return;
        try {
            await axios.delete(`${normalizedAPI}/announcements/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    const filteredAnnouncements = announcements.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getBadgeVariant = (type: Announcement['type']) => {
        switch (type) {
            case 'Urgent': return 'destructive';
            case 'System': return 'default';
            case 'Academic': return 'success';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-10 animate-in luxe-container pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-8">
                <div>
                     <div className="flex items-center gap-2 mb-2 font-medium uppercase tracking-widest text-[10px] text-primary">
                        <span className="w-10 h-px bg-primary opacity-30"></span>
                        Nexus Broadcast Protocol
                    </div>
                    <h1 className="text-3xl font-semibold text-foreground tracking-tighter m-0 uppercase flex items-center gap-3">
                        Communications Node
                        <Badge variant="outline" className="text-[10px] py-1 px-3 border-primary/20 text-primary ml-2 uppercase tracking-widest bg-primary/5">
                            Broadcast Core
                        </Badge>
                    </h1>
                    <p className="text-[13px] font-medium text-muted-foreground mt-1.5 flex items-center gap-3">
                        Real-time synchronization and nodal broadcast management hub
                        <span className="w-1 h-3 bg-border"></span>
                        <span className="text-primary font-semibold uppercase tracking-widest flex items-center gap-2">
                             <Radio size={12} className="animate-pulse" />
                             Synchronized Nexus
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="relative w-full sm:w-72 group">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                            <Search size={16} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            placeholder="PROBE PROTOCOLS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 bg-white/50 border border-border rounded-sm pl-11 pr-4 text-[11px] font-semibold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/40 group-hover:border-primary/30"
                        />
                    </div>
                    <Button  onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />} className="font-semibold uppercase tracking-widest h-11 px-8 shadow-lg shadow-primary/20">
                        Initialize Broadcast
                    </Button>
                </div>
            </div>

            <Card className="border-border/60 shadow-2xl overflow-hidden bg-background/40 backdrop-blur-md min-h-[600px] relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] blur-3xl rounded-full -mr-32 -mt-32"></div>
                <div className="px-8 py-6 border-b border-border bg-background/30 flex justify-between items-center relative">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-sm bg-primary/5 flex items-center justify-center text-primary border border-primary/10 transition-transform hover:rotate-12">
                             <Megaphone size={24} />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-foreground tracking-tight m-0 uppercase">Temporal Protocol Registry</h2>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.2em] mt-0.5 opacity-60">Historical Data Flux</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{filteredAnnouncements.length} ACTIVE BROADCASTS</span>
                        <div className="h-4 w-px bg-border"></div>
                        <Button variant="ghost" size="sm" onClick={fetchAnnouncements}  className="h-8 p-0 w-8 hover:bg-primary/5 text-primary" >
  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}  />
</Button>
                    </div>
                </div>
                
                <div className="divide-y divide-border/30">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="p-8 animate-pulse flex items-start gap-6">
                                <div className="w-12 h-12 bg-border/20 rounded-sm shrink-0"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-border/20 rounded-sm w-1/4"></div>
                                    <div className="h-3 bg-border/20 rounded-sm w-full"></div>
                                    <div className="h-3 bg-border/20 rounded-sm w-3/4"></div>
                                </div>
                            </div>
                        ))
                    ) : filteredAnnouncements.length === 0 ? (
                        <div className="py-48 text-center relative overflow-hidden">
                             <div className="flex flex-col items-center justify-center opacity-30">
                                <Radio size={64} className="text-muted-foreground mb-6 stroke-[1.5]" />
                                <h3 className="text-[18px] font-semibold text-foreground uppercase tracking-widest mb-2">Silence Detected</h3>
                                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-tight">Zero broadcast signals localized within the current temporal segment.</p>
                            </div>
                        </div>
                    ) : (
                        filteredAnnouncements.map((ann) => (
                            <div key={ann._id} className="p-8 flex items-start gap-8 hover:bg-primary/[0.03] transition-all duration-300 group relative">
                                <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>
                                <div className={`relative w-14 h-14 rounded-sm border flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 shadow-sm
                                    ${ann.type === 'Urgent' ? 'bg-destructive/10 border-destructive/30 text-destructive shadow-destructive/10' : 
                                    ann.type === 'System' ? 'bg-primary/10 border-primary/30 text-primary shadow-primary/10' : 
                                    ann.type === 'Academic' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-emerald-500/10' : 
                                    'bg-white border-border/60 text-muted-foreground'}`}>
                                    <Bell size={24} className={ann.type === 'Urgent' ? 'animate-bounce' : ''} />
                                    {ann.type === 'Urgent' && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-6 mb-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h4 className="text-[17px] font-semibold text-foreground truncate uppercase tracking-tighter group-hover:text-primary transition-colors">{ann.title}</h4>
                                            <Badge variant={getBadgeVariant(ann.type)} className="text-[9px] px-2 py-0.5 font-semibold uppercase tracking-[0.2em] h-fit">
                                                {ann.type === 'General' ? 'STANDARD' : ann.type === 'Academic' ? 'SCHOLASTIC' : 
                                                 ann.type === 'Urgent' ? 'CRITICAL' : 'CORE_SYSTEM'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground shrink-0 uppercase tracking-widest opacity-60">
                                            <Calendar size={12} className="text-primary/60" />
                                            {new Date(ann.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <p className="text-[13px] font-medium text-muted-foreground mb-5 leading-relaxed max-w-4xl line-clamp-3 group-hover:line-clamp-none transition-all duration-500">{ann.content}</p>
                                    <div className="flex items-center gap-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                                        <div className="flex items-center gap-2">
                                            <User size={12} className="text-primary/60" />
                                            SOURCE: <span className="text-foreground">{ann.sender.fullName || ann.sender.username}</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-border opacity-40"></div>
                                        <div className="flex items-center gap-2">
                                            <Globe size={12} className="text-primary/60" />
                                            VECTOR: <span className="text-foreground">
                                                {ann.targetRoles[0] === 'all' ? 'GLOBAL FLEET' : 
                                                 ann.targetRoles[0] === 'staff' ? 'FACULTY NODES' : 'ACADEMIC NODES'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 flex items-center gap-2 self-center">
                                     <Button 
                                        onClick={() => handleDelete(ann._id)}
                                        variant="ghost" 
                                        className="h-10 w-10 p-0 rounded-sm hover:bg-destructive/10 text-destructive border border-transparent hover:border-destructive/20 transition-all"
                                        title="Terminate Broadcast"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="h-10 w-10 p-0 rounded-sm hover:bg-primary/10 text-primary border border-transparent hover:border-primary/20 transition-all"
                                        title="View Analytics"
                                    >
                                        <ArrowRight size={18} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="px-8 py-6 border-t border-border bg-background/30 flex justify-between items-center opacity-60">
                     <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Broadcast Relay Status: Nominal
                     </div>
                     <div className="flex items-center gap-6">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">Nexus Protocol: V5.2</span>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">Entropy: 0.2%</span>
                     </div>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initialize Broadcast sequence">
                <form onSubmit={handleCreate} className="space-y-6 pt-2">
                    <div className="flex items-center gap-4 p-5 bg-primary/5 border border-primary/20 rounded-sm mb-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 blur-2xl rounded-full -mr-8 -mt-8 opacity-50"></div>
                        <Info size={24} className="text-primary shrink-0 transition-transform group-hover:scale-110" />
                        <p className="text-[12px] font-medium text-muted-foreground m-0 leading-relaxed uppercase tracking-tighter">
                            Initializing a broadcast will propagate the data across all target nodes within the selected vector. Critical signals will trigger priority notifications.
                        </p>
                    </div>

                    <Input
                        label="Identity Subject"
                        required
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                        placeholder="e.g. CORE_SYSTEM_MAINTENANCE"
                        className="bg-white/50 font-semibold uppercase tracking-tight h-12"
                    />
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] ml-1">Protocol Tier</label>
                            <div className="relative group/tier">
                                <select 
                                    value={newAnnouncement.type}
                                    onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value as any})}
                                    className="w-full h-12 text-[11px] bg-white/50 border border-border rounded-sm px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all appearance-none font-semibold uppercase tracking-widest group-hover/tier:border-primary/40"
                                >
                                    <option value="General">STANDARD</option>
                                    <option value="System">CORE_SYSTEM</option>
                                    <option value="Urgent">CRITICAL</option>
                                    <option value="Academic">SCHOLASTIC</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground transition-all">
                                    <ChevronRight size={14} className="rotate-90 group-focus-within/tier:rotate-[-90deg]" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] ml-1">Target Vector</label>
                            <div className="relative group/vec">
                                <select 
                                    value={newAnnouncement.targetRoles[0]}
                                    onChange={(e) => setNewAnnouncement({...newAnnouncement, targetRoles: [e.target.value]})}
                                    className="w-full h-12 text-[11px] bg-white/50 border border-border rounded-sm px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all appearance-none font-semibold uppercase tracking-widest group-hover/vec:border-primary/40"
                                >
                                    <option value="all">GLOBAL FLEET</option>
                                    <option value="staff">FACULTY NODES</option>
                                    <option value="student">ACADEMIC NODES</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground transition-all">
                                    <ChevronRight size={14} className="rotate-90 group-focus-within/vec:rotate-[-90deg]" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] ml-1">Payload Content</label>
                        <textarea 
                            required
                            rows={5}
                            value={newAnnouncement.content}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                            className="w-full text-[13px] bg-white/50 border border-border rounded-sm px-4 py-3 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all resize-none placeholder:text-muted-foreground/40"
                            placeholder="Type the broadcast payload here..."
                        />
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-8 border-t border-border/60 mt-8">
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="text-[11px] font-semibold uppercase tracking-widest h-12 px-8">Cancel</Button>
                        <Button type="submit" loading={isSubmitting} className="font-semibold uppercase tracking-widest px-12 h-12 shadow-xl shadow-primary/20" >
  <Send size={18} className="mr-2" /> Execute Broadcast
</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Communications;
