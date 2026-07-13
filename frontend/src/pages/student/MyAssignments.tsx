import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
    Clock, 
    ChevronRight, 
    BookOpen, 
    Search,
    ClipboardList,
    AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MyAssignments = () => {
    const { token } = useContext(AuthContext)!;
    const [assignments, setAssignments] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [assRes, subRes] = await Promise.all([
                axios.get(`${API}/assignments/student`, config),
                axios.get(`${API}/submissions/my`, config)
            ]);
            setAssignments(Array.isArray(assRes.data) ? assRes.data : []);
            setSubmissions(Array.isArray(subRes.data) ? subRes.data : []);
        } catch (error) {
            console.error('Error fetching student assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const getStatus = (assignmentId: string): { label: string, variant: any } => {
        const sub = submissions.find(s => (s.assignmentId?._id === assignmentId || s.assignmentId === assignmentId));
        if (!sub) return { label: 'Awaiting', variant: 'warning' };
        if (sub.status === 'graded') return { label: 'Executed', variant: 'success' };
        return { label: 'In Review', variant: 'primary' };
    };

    const filteredAssignments = assignments.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subjectId?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in luxe-container pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-8">
            <div>
                <div className="flex items-center gap-2 mb-2 font-medium uppercase tracking-widest text-[10px] text-primary">
                    <span className="w-10 h-px bg-primary opacity-30"></span>
                    Assignment Protocol
                </div>
                <h1 className="text-3xl font-semibold text-foreground tracking-tighter m-0 uppercase flex items-center gap-3">
                    My Active Units
                    <Badge variant="outline" className="text-[10px] py-1 px-3 border-primary/20 text-primary ml-2 uppercase tracking-widest bg-primary/5">
                        Synced Node
                    </Badge>
                </h1>
                <p className="text-[13px] font-medium text-muted-foreground mt-1.5 flex items-center gap-3">
                    Monitor and execute assigned academic evaluations
                    <span className="w-1 h-3 bg-border"></span>
                    <span className="text-primary font-semibold uppercase tracking-widest flex items-center gap-2">
                        <ClipboardList size={12} className="text-primary" />
                        Queue: {filteredAssignments.length} Nodes
                    </span>
                </p>
            </div>
            
            <div className="w-full md:w-96 relative">
                <Input 
                    placeholder="Filter protocol by title or subject..." 
                    value={searchTerm} 
                    onChange={(e: any) => setSearchTerm(e.target.value)} 
                    className="bg-background/50 pl-10 h-10 text-[13px] font-medium border-border/60"
                    icon={<Search size={14} className="text-muted-foreground" />}
                />
            </div>
        </div>

        <AnimatePresence mode="wait">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-background/20 rounded-sm animate-pulse border border-border/40 backdrop-blur-sm" />
                    ))}
                </div>
            ) : filteredAssignments.length === 0 ? (
                <Card className="py-24 text-center border-dashed border-border/40 bg-background/20 backdrop-blur-md">
                    <div className="w-20 h-20 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-primary opacity-20" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground tracking-tighter uppercase mb-2">Protocol Clear</h3>
                    <p className="text-[13px] font-medium text-muted-foreground max-w-sm mx-auto uppercase tracking-widest opacity-60">
                        {searchTerm ? "No units matching your criteria were found in the current sequence" : "No active assignment nodes detected in your deployment queue"}
                    </p>
                    {searchTerm && (
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="mt-8 font-semibold uppercase tracking-widest text-[10px] h-9 px-6 border-primary/20 hover:bg-primary/5 text-primary">
                            Reset Filter Matrix
                        </Button>
                    )}
                </Card>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filteredAssignments.map((ass, idx) => {
                        const status = getStatus(ass._id);
                        const deadlineDate = new Date(ass.submissionDeadline || ass.deadline);
                        const deadlinePassed = deadlineDate < new Date();
                        const isLate = deadlinePassed && status.label === 'Awaiting';
                        
                        return (
                            <Link to={`/student/assignments/${ass._id}`} key={ass._id} className="group">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="h-full"
                                >
                                    <Card className="hover:border-primary/40 transition-all duration-500 h-full flex flex-col cursor-pointer border-border/60 shadow-xl bg-background/40 backdrop-blur-md group-hover:translate-y-[-4px] overflow-hidden">
                                        <div className="relative p-7 flex-1">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-12 h-12 bg-primary/5 border border-primary/20 rounded-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg shadow-primary/5">
                                                    <ClipboardList size={22} />
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge variant={status.variant} className="text-[9px] font-semibold px-2.5 py-0.5 uppercase tracking-widest shadow-sm">{status.label}</Badge>
                                                    {isLate && <Badge variant="destructive" className="animate-pulse text-[9px] font-semibold px-2.5 py-0.5 uppercase tracking-widest">Overdue</Badge>}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 font-semibold uppercase tracking-widest text-[9px] text-muted-foreground opacity-60">
                                                    <BookOpen size={10} className="text-primary/60" />
                                                    {ass.subjectId?.name || 'General Subject'}
                                                </div>
                                                <h3 className="font-semibold text-[15px] text-foreground leading-snug group-hover:text-primary transition-all duration-300 uppercase tracking-tight line-clamp-2">
                                                    {ass.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="px-7 py-5 bg-background/40 border-t border-border/40 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Expiration</span>
                                                <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground uppercase tracking-tight">
                                                    <Clock size={12} className={isLate ? 'text-destructive' : 'text-primary opacity-70'} />
                                                    <span className={isLate ? 'text-destructive' : ''}>
                                                        {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-primary font-semibold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-500">
                                                <span>Execute</span>
                                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            </Link>
                        );
                    })}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
    );
};

export default MyAssignments;

