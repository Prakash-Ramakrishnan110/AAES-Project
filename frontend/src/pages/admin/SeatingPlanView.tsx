import React, { useEffect } from 'react';
import axios from 'axios';
import { 
    Users, RefreshCw, Shield,
    CheckCircle2, Plus,
    Navigation, Cpu, Box, Globe,
    Zap, Download
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const normalizedAPI = API.endsWith('/api') ? API : `${API}/api`;

const SeatingPlanView: React.FC = () => {
    useEffect(() => {
        fetchArrangements();
    }, []);

    const fetchArrangements = async () => {
        try {
            await axios.get(`${normalizedAPI}/exam/invigilators`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
        } catch (error) {
            console.error('Failed to load plans');
        }
    };

    const seatingData = [
        { room: '401', block: 'PRIMARY_CLUSTER', seats: 24, filled: 18, subjects: ['CS101', 'EC202'], status: 'OPTIMAL' },
        { room: '402', block: 'PRIMARY_CLUSTER', seats: 24, filled: 22, subjects: ['CS101', 'ME304'], status: 'HIGH_DENSITY' }
    ];

    return (
        <div className="space-y-10 animate-in luxe-container pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-8">
                <div>
                     <div className="flex items-center gap-2 mb-2 font-semibold uppercase tracking-widest text-[10px] text-primary">
                        <span className="w-10 h-px bg-primary opacity-30"></span>
                        Spatial Orchestration Node
                    </div>
                    <h1 className="text-3xl font-semibold text-foreground tracking-tighter m-0 uppercase flex items-center gap-3">
                        Seating Architecture Engine
                        <Badge variant="outline" className="text-[10px] py-1 px-3 border-primary/20 text-primary ml-2 uppercase tracking-widest bg-primary/5">
                            SPATIAL_V4
                        </Badge>
                    </h1>
                    <p className="text-[13px] font-medium text-muted-foreground mt-1.5 flex items-center gap-3">
                        Temporal spatial orchestration for academic node distribution and exam security
                        <span className="w-1 h-3 bg-border"></span>
                        <span className="text-primary font-semibold uppercase tracking-widest flex items-center gap-2">
                             <Navigation size={12} className="animate-pulse" />
                             Synchronized Mapping
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline"  className="font-semibold uppercase tracking-widest text-[11px] h-10 px-6 border-border/60 hover:bg-primary/5">
  <Download size={16} className="mr-2" /> Export Spatial Protocol
</Button>
                    <Button   className="font-semibold uppercase tracking-widest text-[11px] h-10 px-8 shadow-lg shadow-primary/20">
  <RefreshCw size={16} className="mr-2" /> Re-orchestrate Cluster
</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {seatingData.map((hall, i) => (
                    <Card key={i} className="border-border/60 shadow-2xl overflow-hidden bg-background/40 backdrop-blur-md relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] blur-3xl rounded-full -mr-32 -mt-32"></div>
                        <div className="px-8 py-6 bg-background/30 border-b border-border/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-sm bg-primary/5 border border-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                    <Box size={28} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-[18px] font-semibold text-foreground tracking-tighter uppercase leading-none">Vector {hall.room}</h3>
                                        <Badge className={`text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 ${hall.status === 'HIGH_DENSITY' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                            {hall.status}
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                                        <Globe size={12} className="text-primary/60" /> {hall.block}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-60">Occupancy Flux</p>
                                    <div className="flex items-center gap-3 justify-end">
                                        <span className="text-2xl font-semibold text-foreground tracking-tighter leading-none">{hall.filled} / {hall.seats}</span>
                                        <div className="h-4 w-px bg-border"></div>
                                        <span className="text-[12px] font-semibold text-primary tracking-widest">{Math.round((hall.filled/hall.seats)*100)}%</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {hall.subjects.map((s, idx) => (
                                        <Badge key={idx} variant={idx === 0 ? 'primary' : 'success'} className="font-semibold uppercase tracking-widest text-[9px] py-1.5 px-3 shadow-sm">
                                            {s}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02] pointer-events-none grayscale invert mix-blend-overlay"></div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5 relative z-10">
                                {Array.from({ length: hall.seats }).map((_, sIdx) => {
                                    const isOccupied = sIdx < hall.filled;
                                    const subjectColor = sIdx % 2 === 0 ? 'bg-primary shadow-primary/40' : 'bg-emerald-500 shadow-emerald-500/40';
                                    
                                    return (
                                        <div 
                                            key={sIdx}
                                            className={`group/seat relative h-24 rounded-sm border transition-all duration-500 overflow-hidden ${
                                                isOccupied 
                                                ? 'bg-white border-border/80 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-primary/40' 
                                                : 'bg-background/30 border-border/40 border-dashed hover:bg-white hover:border-solid hover:border-primary/20'
                                            }`}
                                        >
                                            {isOccupied ? (
                                                <>
                                                    <div className={`absolute top-0 left-0 w-full h-1 ${subjectColor} shadow-[0_1px_5px_rgba(0,0,0,0.1)]`} />
                                                    <div className="absolute top-1 right-1 opacity-10 group-hover/seat:opacity-20 transition-opacity">
                                                        <Users size={48} />
                                                    </div>
                                                    <div className="h-full flex flex-col items-center justify-center p-4 relative z-10">
                                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Node {String(sIdx + 1).padStart(2, '0')}</span>
                                                        <span className="text-[15px] font-semibold text-foreground tracking-tighter leading-none group-hover/seat:text-primary transition-colors">21CS0{sIdx + 12}</span>
                                                        <div className="mt-2 w-full h-0.5 bg-border opacity-30 transform scale-x-0 group-hover/seat:scale-x-100 transition-transform origin-left"></div>
                                                    </div>
                                                    <div className="absolute bottom-1 right-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${sIdx % 2 === 0 ? 'bg-primary' : 'bg-emerald-500'} animate-pulse`}></div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center opacity-30 group-hover/seat:opacity-60 transition-all">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] italic">NULL_SEAT</span>
                                                    <Plus size={12} className="mt-2 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="flex gap-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">{hall.subjects[0]} SQUADRON</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(var(--emerald-500-rgb),0.5)]" />
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">{hall.subjects[1]} SQUADRON</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-border" />
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">AVAILABLE SLOTS</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                                    <Shield size={14} className="text-emerald-500" />
                                    Collision Protocol: Active
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-60">
                <Card className="p-6 bg-background/30 border-border/40 flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-sm bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Architecture Hash</p>
                        <p className="text-[12px] font-semibold text-foreground uppercase tracking-tighter leading-none">SEAT_0X9F44</p>
                    </div>
                </Card>
                <Card className="p-6 bg-background/30 border-border/40 flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-sm bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Integrity Status</p>
                        <p className="text-[12px] font-semibold text-foreground uppercase tracking-tighter leading-none">VALIDATED_NOMINAL</p>
                    </div>
                </Card>
                <Card className="p-6 bg-background/30 border-border/40 flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-sm bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Orchestration Yield</p>
                        <p className="text-[12px] font-semibold text-foreground uppercase tracking-tighter leading-none">94.2%_EFFICIENCY</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SeatingPlanView;

