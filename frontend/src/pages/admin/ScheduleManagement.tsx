import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, RefreshCcw, Layers, 
    LayoutGrid, Activity, ShieldCheck, 
    ChevronRight, Info, Building2, Users, BookOpen,
    Download, MoreHorizontal
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../ui/StatCard';
import { Badge } from '../../components/ui/badge';

interface ScheduleNode {
    id: string;
    subject: string;
    code: string;
    faculty: string;
    type: 'Theory' | 'Practical' | 'Seminar';
    room: string;
    period: number;
    day: string;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const ScheduleManagement = () => {
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState('MONDAY');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Mock data for Temporal Matrix
    const [scheduleNodes] = useState<ScheduleNode[]>([
        { id: '1', subject: 'Advanced Algorithms', code: 'CS-401', faculty: 'Dr. Sarah Wilson', type: 'Theory', room: 'B-Block 201', period: 1, day: 'MONDAY' },
        { id: '2', subject: 'Cloud Infrastructure', code: 'CS-405', faculty: 'Prof. James Chen', type: 'Theory', room: 'C-Block 104', period: 2, day: 'MONDAY' },
        { id: '3', subject: 'Network Security Lab', code: 'CS-403', faculty: 'Dr. Alan Turing', type: 'Practical', room: 'L-Block 502', period: 3, day: 'MONDAY' },
        { id: '4', subject: 'Network Security Lab', code: 'CS-403', faculty: 'Dr. Alan Turing', type: 'Practical', room: 'L-Block 502', period: 4, day: 'MONDAY' },
        { id: '5', subject: 'Quantum Computing', code: 'CS-412', faculty: 'Prof. Richard Feynman', type: 'Seminar', room: 'S-Block 301', period: 6, day: 'MONDAY' },
        { id: '6', subject: 'Machine Learning', code: 'CS-408', faculty: 'Dr. Grace Hopper', type: 'Theory', room: 'B-Block 205', period: 1, day: 'TUESDAY' },
        // ... more nodes could be added
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const getNodesForSlot = (day: string, period: number) => {
        return scheduleNodes.filter(n => n.day === day && n.period === period);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-pulse luxe-container pb-12">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <Clock size={48} className="text-primary animate-spin relative" />
            </div>
            <div className="text-center">
                <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-primary mb-1">Synchronizing Temporal Matrix</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Awaiting cycle alignment...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in luxe-container pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 font-medium uppercase tracking-widest text-[10px] text-primary">
                        <span className="w-10 h-px bg-primary opacity-30"></span>
                        Admin Infrastructure Node
                    </div>
                    <h1 className="text-3xl font-semibold text-foreground tracking-tighter m-0 uppercase flex items-center gap-3">
                        Temporal Matrix
                        <Badge variant="outline" className="text-[10px] py-1 px-3 border-primary/20 text-primary uppercase tracking-[0.2em] bg-primary/5">
                            CONTROL V4.0 LUX
                        </Badge>
                    </h1>
                    <p className="text-[13px] font-medium text-muted-foreground mt-1.5 flex items-center gap-3">
                        Managing high-bandwidth instructional cycles and faculty allocation
                        <span className="w-1 h-3 bg-border"></span>
                        <span className="text-emerald-500 font-semibold uppercase tracking-widest flex items-center gap-2">
                             <ShieldCheck size={12} /> Matrix Status: Synchronized
                        </span>
                    </p>
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" size="sm" className="font-medium uppercase tracking-widest text-[10px] h-10 px-6 border-border/60 hover:bg-primary/5 transition-all">
                        <Download size={14} className="mr-2" /> Export Matrix
                    </Button>
                    <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="font-semibold uppercase tracking-widest text-[11px] h-10 px-8 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                        <RefreshCcw size={14} className="mr-2" /> Add Session
                    </Button>
                </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Active Sessions" 
                    value={scheduleNodes.length} 
                    icon={<Layers size={20} />} 
                    trend={{ value: "NOMINAL", isUp: true }}
                    description="Current temporal nodes"
                />
                <StatCard 
                    label="Faculty Util." 
                    value="92.4%" 
                    icon={<Users size={20} />} 
                    trend={{ value: "OPTIMAL", isUp: true }}
                    description="Institutional bandwidth"
                />
                <StatCard 
                    label="Conflict Density" 
                    value="0.00" 
                    icon={<Activity size={20} />} 
                    trend={{ value: "ZERO", isUp: true }}
                    description="Matrix integrity level"
                />
                <StatCard 
                    label="Sync Latency" 
                    value="14ms" 
                    icon={<Clock size={20} />} 
                    trend={{ value: "STABLE", isUp: true }}
                    description="Global cycle alignment"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Control Sidebar */}
                <Card className="lg:col-span-3 p-8 border-border/60 shadow-2xl bg-background/40 backdrop-blur-md sticky top-24 overflow-hidden relative group/card">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-50"></div>
                    
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/60">
                        <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <LayoutGrid size={20} />
                        </div>
                        <div>
                            <h2 className="text-[14px] font-semibold text-foreground tracking-tight uppercase m-0">Matrix Ops</h2>
                            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Control instructional flow</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] ml-1">Temporal Filter</label>
                            <div className="grid grid-cols-1 gap-2">
                                {DAYS.map(day => (
                                    <button 
                                        key={day}
                                        onClick={() => setActiveDay(day)}
                                        className={`w-full px-4 py-3 rounded-sm text-[11px] font-semibold uppercase tracking-widest text-left transition-all duration-300 flex justify-between items-center group/btn ${activeDay === day ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-background/40 border border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
                                    >
                                        {day}
                                        <ChevronRight size={14} className={`transition-transform duration-300 ${activeDay === day ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover/btn:opacity-50 group-hover/btn:translate-x-0'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/40 space-y-4">
                             <div className="p-4 rounded-sm bg-primary/5 border border-primary/10">
                                <p className="text-[10px] font-medium text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Info size={12} /> Matrix Insights
                                </p>
                                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                                    Cycle <span className="text-foreground font-semibold tracking-tight">PHASE-01</span> has no overlapping nodes detected. All faculty clusters are within operational thresholds.
                                </p>
                             </div>
                             <Button className="w-full h-12 font-semibold uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20">
                                <RefreshCcw size={14} className="mr-2" /> Global Re-Sync
                             </Button>
                        </div>
                    </div>
                </Card>

                {/* Matrix Grid */}
                <Card className="lg:col-span-9 flex flex-col h-full overflow-hidden border-border/60 shadow-2xl bg-background/40 backdrop-blur-md">
                    <div className="px-8 py-6 border-b border-border bg-background/30 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32 opacity-30"></div>
                        <div className="relative z-10">
                            <h2 className="text-[15px] font-semibold text-foreground tracking-tighter m-0 uppercase flex items-center gap-3">
                                <Clock size={20} className="text-primary" />
                                {activeDay} SEQUENCE MATRIX
                            </h2>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mt-1">High-bandwidth instructional timeline</p>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                             <div className="flex p-1 bg-background/40 backdrop-blur-md border border-border/60 rounded-sm">
                                <button className="p-2 rounded-sm bg-primary text-primary-foreground shadow-lg"><LayoutGrid size={16} /></button>
                                <button className="p-2 rounded-sm text-muted-foreground hover:bg-primary/5 transition-colors"><MoreHorizontal size={16} /></button>
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar min-h-[600px] p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {PERIODS.map(period => {
                                const nodes = getNodesForSlot(activeDay, period);
                                return (
                                    <div key={period} className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b border-border/40">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">SLOT-0{period}</span>
                                            <span className="text-[9px] font-medium text-secondary-foreground/40 uppercase tracking-widest">{0 + period}:15 AM</span>
                                        </div>
                                        
                                        <AnimatePresence mode="popLayout">
                                            {nodes.length > 0 ? (
                                                nodes.map(node => (
                                                    <motion.div
                                                        key={node.id}
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className={`p-5 rounded-sm border-l-4 shadow-xl transition-all duration-300 group/node cursor-pointer relative overflow-hidden ${node.type === 'Practical' ? 'bg-indigo-500/5 border-indigo-500 hover:bg-indigo-500/10' : node.type === 'Seminar' ? 'bg-amber-500/5 border-amber-500 hover:bg-amber-500/10' : 'bg-primary/5 border-primary hover:bg-primary/10'}`}
                                                    >
                                                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover/node:opacity-20 transition-opacity">
                                                            <Layers size={48} />
                                                        </div>
                                                        <div className="relative z-10">
                                                            <Badge variant="outline" className={`text-[8px] font-semibold mb-3 px-2 py-0 uppercase tracking-widest ${node.type === 'Practical' ? 'border-indigo-500/20 text-indigo-500' : node.type === 'Seminar' ? 'border-amber-500/20 text-amber-500' : 'border-primary/20 text-primary'}`}>
                                                                {node.type}
                                                            </Badge>
                                                            <h4 className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight leading-tight line-clamp-1">{node.subject}</h4>
                                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                                <BookOpen size={10} className="text-primary/60" /> {node.code}
                                                            </p>
                                                            
                                                            <div className="mt-5 space-y-2 pt-4 border-t border-border/20">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-[9px] font-semibold text-primary">
                                                                        {node.faculty.charAt(node.faculty.indexOf(' ') + 1)}
                                                                    </div>
                                                                    <span className="text-[10px] font-medium text-foreground uppercase tracking-tight">{node.faculty}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                                                                    <Building2 size={10} className="text-primary/60" /> {node.room}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="h-[200px] border border-dashed border-border/40 rounded-sm flex flex-col items-center justify-center opacity-20 grayscale transition-all hover:opacity-40">
                                                    <Clock size={32} className="mb-3" />
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest">Temporal Void</span>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Add Session Modal (Demo of Use) */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-background border border-border shadow-2xl rounded-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-border bg-muted/30">
                                <h3 className="text-lg font-semibold uppercase tracking-widest flex items-center gap-2">
                                    <Layers size={18} className="text-primary" />
                                    Add New Session
                                </h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                                    Inject new temporal node into matrix
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject Name</label>
                                    <input type="text" className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Data Structures" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Code</label>
                                        <input type="text" className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="CS-101" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                                        <select className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                                            <option>Theory</option>
                                            <option>Practical</option>
                                            <option>Seminar</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Faculty Name</label>
                                    <input type="text" className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Dr. John Doe" />
                                </div>
                            </div>
                            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button onClick={() => {
                                    setIsAddModalOpen(false);
                                    // In a real app, this would append to the scheduleNodes
                                }}>Add Session Node</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScheduleManagement;
