import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    CreditCard, DollarSign, Activity, ShieldCheck, 
    RefreshCcw, Search, 
    ArrowUpRight, ArrowDownRight,
    TrendingUp, Wallet, Receipt, Building2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../ui/StatCard';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/Input';

interface LedgerNode {
    id: string;
    studentName: string;
    rollNumber: string;
    department: string;
    semester: number;
    totalFee: number;
    paid: number;
    pending: number;
    status: 'Cleared' | 'Pending' | 'Overdue';
    lastTransaction: string;
}

const FinancialCore = () => {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Mock data for Nexus Ledger
    const [ledgerNodes] = useState<LedgerNode[]>([
        { id: '1', studentName: 'Aditya Verma', rollNumber: '2021CS101', department: 'COMPUTER SCIENCE', semester: 6, totalFee: 45000, paid: 45000, pending: 0, status: 'Cleared', lastTransaction: '2024-03-15' },
        { id: '2', studentName: 'Priya Sharma', rollNumber: '2021CS104', department: 'COMPUTER SCIENCE', semester: 6, totalFee: 45000, paid: 30000, pending: 15000, status: 'Pending', lastTransaction: '2024-02-10' },
        { id: '3', studentName: 'Rahul Kumar', rollNumber: '2021ME205', department: 'MECHANICAL', semester: 4, totalFee: 42000, paid: 10000, pending: 32000, status: 'Overdue', lastTransaction: '2023-12-05' },
        { id: '4', studentName: 'Sneha Reddy', rollNumber: '2022EC312', department: 'ELECTRONICS', semester: 2, totalFee: 48000, paid: 48000, pending: 0, status: 'Cleared', lastTransaction: '2024-01-20' },
        { id: '5', studentName: 'Vikram Singh', rollNumber: '2021CS108', department: 'COMPUTER SCIENCE', semester: 6, totalFee: 45000, paid: 0, pending: 45000, status: 'Overdue', lastTransaction: 'N/A' },
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const filteredNodes = ledgerNodes.filter(n => 
        n.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-pulse luxe-container pb-12">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <CreditCard size={48} className="text-primary animate-spin relative" />
            </div>
            <div className="text-center">
                <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-primary mb-1">Mapping Nexus Ledger</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Polling financial telemetry...</p>
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
                        Institutional Finance Node
                    </div>
                    <h1 className="text-3xl font-semibold text-foreground tracking-tighter m-0 uppercase flex items-center gap-3">
                        Nexus Ledger
                        <Badge variant="outline" className="text-[10px] py-1 px-3 border-primary/20 text-primary uppercase tracking-[0.2em] bg-primary/5">
                            FINCORE V4.0 LUX
                        </Badge>
                    </h1>
                    <p className="text-[13px] font-medium text-muted-foreground mt-1.5 flex items-center gap-3">
                        Managing high-liquidity financial nodes and fee propagation protocols
                        <span className="w-1 h-3 bg-border"></span>
                        <span className="text-emerald-500 font-semibold uppercase tracking-widest flex items-center gap-2">
                             <ShieldCheck size={12} /> Ledger Status: Integrity Verified
                        </span>
                    </p>
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" size="sm" className="font-medium uppercase tracking-widest text-[10px] h-10 px-6 border-border/60 hover:bg-primary/5 transition-all">
                        <Receipt size={14} className="mr-2" /> Audit Ledger
                    </Button>
                    <Button size="sm" className="font-semibold uppercase tracking-widest text-[11px] h-10 px-8 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                        <RefreshCcw size={14} className="mr-2" /> Propagate Updates
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Liquidity Index" 
                    value={`$${ledgerNodes.reduce((s, n) => s + n.paid, 0).toLocaleString()}`} 
                    icon={<Wallet size={20} />} 
                    trend={{ value: "+8.2%", isUp: true }}
                    description="Aggregate realized revenue"
                />
                <StatCard 
                    label="Fee Prop. Rate" 
                    value="76.5%" 
                    icon={<TrendingUp size={20} />} 
                    trend={{ value: "STABLE", isUp: true }}
                    description="Institutional collection efficiency"
                />
                <StatCard 
                    label="Deficit Nodes" 
                    value={ledgerNodes.filter(n => n.status === 'Overdue').length} 
                    icon={<ArrowDownRight size={20} className="text-destructive" />} 
                    trend={{ value: "CRITICAL", isUp: false }}
                    description="Accounts requiring intervention"
                />
                <StatCard 
                    label="Trans. Density" 
                    value="142/day" 
                    icon={<Activity size={20} />} 
                    trend={{ value: "NOMINAL", isUp: true }}
                    description="Real-time financial activity"
                />
            </div>

            <Card className="flex flex-col h-full overflow-hidden border-border/60 shadow-2xl bg-background/40 backdrop-blur-md">
                <div className="px-8 py-6 border-b border-border bg-background/30 flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32 opacity-30"></div>
                    <div className="relative z-10">
                        <h2 className="text-[15px] font-semibold text-foreground tracking-tighter m-0 uppercase flex items-center gap-3">
                            <CreditCard size={20} className="text-primary" />
                            Ledger Databank Registry
                        </h2>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mt-1">Fragmented student financial nodes</p>
                    </div>
                    <div className="w-full sm:w-80 relative z-10">
                        <Input 
                            placeholder="SEARCH LEDGER ID..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="bg-white/50 pl-10 h-10 text-[11px] font-semibold uppercase tracking-widest border-border/60 focus:border-primary transition-all shadow-sm"
                            icon={<Search size={14} className="text-primary/60" />}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background/60 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">Financial Identity</th>
                                <th className="px-8 py-5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">Phase Allocation</th>
                                <th className="px-8 py-5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] text-center">Protocol Status</th>
                                <th className="px-8 py-5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] text-right">Metric Balance</th>
                                <th className="px-8 py-5 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">Nexus Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {filteredNodes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-semibold italic opacity-30">
                                        Zero financial nodes detected in registry
                                    </td>
                                </tr>
                            ) : (
                                filteredNodes.map((node, idx) => (
                                    <motion.tr 
                                        key={node.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        className="hover:bg-primary/[0.02] transition-all duration-300 group/row cursor-pointer relative border-l-2 border-transparent hover:border-primary"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="h-12 w-12 bg-primary/5 border border-primary/20 rounded-sm flex items-center justify-center text-primary group-hover/row:scale-110 transition-all duration-500 shadow-xl shadow-primary/5">
                                                    <DollarSign size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-semibold text-foreground group-hover/row:text-primary transition-colors uppercase tracking-tight">{node.studentName}</p>
                                                    <Badge variant="outline" className="text-[9px] font-semibold px-2 mt-1 border-primary/20 text-primary uppercase tracking-widest bg-primary/5">
                                                        {node.rollNumber}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-semibold text-foreground uppercase tracking-tight flex items-center gap-2">
                                                    <Building2 size={12} className="text-primary/60" /> {node.department}
                                                </p>
                                                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60 ml-5">
                                                    SEMESTER NODE: 0{node.semester}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <Badge 
                                                    className={`text-[9px] font-semibold px-4 py-1.5 uppercase tracking-[0.2em] shadow-lg border-2 ${node.status === 'Cleared' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : node.status === 'Overdue' ? 'bg-destructive/10 border-destructive/20 text-destructive animate-pulse' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}
                                                >
                                                    {node.status}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="space-y-1">
                                                <p className="text-[15px] font-semibold text-foreground tracking-tighter tabular-nums group-hover/row:text-primary transition-colors">${node.paid.toLocaleString()}</p>
                                                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60 flex items-center justify-end gap-1.5">
                                                    DEBT: <span className={node.pending > 0 ? 'text-destructive font-semibold' : 'text-emerald-500 font-semibold'}>${node.pending.toLocaleString()}</span>
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all duration-500 transform translate-x-2 group-hover/row:translate-x-0">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="text-[10px] font-semibold uppercase tracking-widest text-primary hover:bg-primary/10 h-10 px-5 border border-primary/10"
                                                >
                                                    <ArrowUpRight size={14} className="mr-2" /> Transfer
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    className="text-[10px] font-semibold uppercase tracking-widest h-10 px-6 shadow-lg shadow-primary/20"
                                                >
                                                    <Receipt size={14} className="mr-2" /> Reciept
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-6 bg-background/30 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-3">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        Nexus Security Protocol: SHA-256 Verified
                        <span className="w-1 h-3 bg-border py-2"></span>
                        Last Propagation: {new Date().toLocaleTimeString()}
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest opacity-50">Liquidity Depth</span>
                        <div className="w-32 h-2 bg-border/40 rounded-full overflow-hidden shadow-inner p-0.5 border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '76.5%' }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default FinancialCore;
