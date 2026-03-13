import { useEffect, useState, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { type HeaderOptions } from '../../components/layout/DashboardLayout';
import { AuthContext } from '../../context/AuthContext';
import { ClipboardList, Clock, Zap, LayoutDashboard, Database, Info } from 'lucide-react';
import SectionCard from '../../components/ui/SectionCard';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LabAssistantDashboard = () => {
    const { token, user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const { setHeaderOptions } = useOutletContext<{ setHeaderOptions: (opts: HeaderOptions) => void }>();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderOptions({
            title: 'Lab Assistant Dashboard',
            subtitle: (
                <span>Welcome back, <span className="text-slate-900 font-bold">{user?.fullName || user?.username}</span> &bull; Support & Operations</span>
            )
        });
    }, [user, setHeaderOptions]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API}/api/morning-attendance/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [token]);

    const quickActions = [
        { icon: ClipboardList, label: 'Record Attendance', desc: 'Sync morning class counts', link: '/labassistant/morning-attendance', color: 'bg-blue-500' },
        { icon: Info, label: 'Report Issue', desc: 'Log equipment maintenance', link: '/labassistant/maintenance', color: 'bg-[#0B1437]' },
        { icon: Database, label: 'Lab Inventory', desc: 'Update asset registry', link: '/labassistant/equipment', color: 'bg-[#4318FF]' },
    ];

    return (
        <div className="space-y-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-6">
                    <SectionCard title="Quick Operations" icon={<Zap className="text-amber-500" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            {quickActions.map((action) => (
                                <div 
                                    key={action.label}
                                    className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all cursor-pointer group"
                                    onClick={() => navigate(action.link)}
                                >
                                    <div className={`w-10 h-10 rounded-xl ${action.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <action.icon size={20} />
                                    </div>
                                    <h4 className="text-[14px] font-bold text-slate-900 mb-1">{action.label}</h4>
                                    <p className="text-[11px] font-medium text-slate-500 leading-snug">{action.desc}</p>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Recent Activity" icon={<Clock className="text-blue-500" />}>
                        <div className="space-y-3 pt-2">
                            {loading ? (
                                <p className="text-center py-4 text-slate-400 text-sm italic">Syncing activity records...</p>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No recent records detected</p>
                                </div>
                            ) : (
                                history.slice(0, 5).map((item) => (
                                    <div key={item._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 bg-institutional/30 text-primary rounded-lg flex items-center justify-center">
                                                <LayoutDashboard size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-900">{item.department} - {item.year} ({item.section})</p>
                                                <p className="text-[11px] font-medium text-slate-500">{new Date(item.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[13px] font-bold text-green-600">{item.presentCount} Present</p>
                                            <p className="text-[11px] font-medium text-slate-400">{item.totalStudents} Total</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </SectionCard>
                </div>

                <div className="space-y-6 text-left">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
                         <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                            <ClipboardList className="text-primary" />
                         </div>
                         <h3 className="text-xl font-bold mb-2">Morning Protocol</h3>
                         <p className="text-slate-400 text-sm leading-relaxed mb-6">Ensure all class attendance summaries are synced before 10:30 AM daily for departmental analytics.</p>
                         <button 
                            onClick={() => navigate('/labassistant/morning-attendance')}
                            className="w-full bg-primary text-white py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg"
                         >
                            Sync Attendance
                         </button>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Operations Status</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-600 uppercase">System Status</span>
                                <span className="flex items-center gap-1.5 text-[11px] font-black text-green-600 uppercase tracking-tighter">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Operational
                                </span>
                            </div>
                            <div className="w-full bg-slate-50 h-1 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full w-[95%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabAssistantDashboard;
