import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    Plus, Trash2, Save, ArrowLeft,
    Percent, ShieldCheck, Activity, FileText, CheckCircle2,
    RefreshCcw, Layers, Zap, MoreHorizontal
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/badge';
import { StatCard } from '../../ui/StatCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface PatternAssessment {
    name: string;
    maxMarks: number;
    weightage: number;
    type: 'Exam' | 'Assignment' | 'Quiz' | 'Lab' | 'Project' | 'Other';
}

const InternalPattern = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext)!;
    
    const [subject, setSubject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    const [assessments, setAssessments] = useState<PatternAssessment[]>([]);

    useEffect(() => {
        const fetchSubjectAndPattern = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API}/api/subjects/${subjectId}`, config);
                
                if (data.department !== user?.department) {
                    throw new Error('Unauthorized access to module');
                }
                
                setSubject(data);
                if (data.internalPattern && data.internalPattern.length > 0) {
                    setAssessments(data.internalPattern);
                } else {
                    setAssessments([
                        { name: 'Internal 1', maxMarks: 50, weightage: 20, type: 'Exam' },
                        { name: 'Internal 2', maxMarks: 50, weightage: 20, type: 'Exam' },
                        { name: 'Model Exam', maxMarks: 100, weightage: 40, type: 'Exam' },
                        { name: 'Assignment', maxMarks: 20, weightage: 20, type: 'Assignment' }
                    ]);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch module details');
            } finally {
                setLoading(false);
            }
        };

        if (subjectId && token) {
            fetchSubjectAndPattern();
        }
    }, [subjectId, token, user]);

    const handleAddAssessment = () => {
        setAssessments([...assessments, { name: '', maxMarks: 100, weightage: 10, type: 'Other' }]);
    };

    const handleRemoveAssessment = (index: number) => {
        const newAssessments = [...assessments];
        newAssessments.splice(index, 1);
        setAssessments(newAssessments);
    };

    const handleAssessmentChange = (index: number, field: keyof PatternAssessment, value: any) => {
        const newAssessments = [...assessments];
        // @ts-ignore
        newAssessments[index][field] = value;
        setAssessments(newAssessments);
    };

    const handleSavePattern = async () => {
        const totalWeightage = assessments.reduce((sum, a) => sum + Number(a.weightage), 0);
        if (totalWeightage !== 100) {
            setError(`Total weightage must be exactly 100%. Current: ${totalWeightage}%`);
            setTimeout(() => setError(null), 4000);
            return;
        }

        const hasEmptyNames = assessments.some(a => !a.name.trim());
        if (hasEmptyNames) {
            setError('All assessments must have a name.');
            setTimeout(() => setError(null), 4000);
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API}/api/subjects/${subjectId}/pattern`, { internalPattern: assessments }, config);
            
            setSuccessMsg('Assessment pattern finalized and saved successfully.');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save pattern');
        } finally {
            setSaving(false);
        }
    };

    const totalWeightage = assessments.reduce((sum, a) => sum + Number(a.weightage), 0);
    const isValidWeightage = totalWeightage === 100;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-pulse luxe-container pb-12">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <RefreshCcw size={48} className="text-primary animate-spin relative" />
            </div>
            <div className="text-center">
                <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-primary mb-1">Synchronizing Pattern Registry</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Polling evaluation infrastructure modules...</p>
            </div>
        </div>
    );

    if (error && !subject) return (
        <div className="p-8 text-center text-destructive border border-destructive/20 bg-destructive/5 rounded-sm max-w-xl mx-auto flex flex-col items-center gap-4 mt-20 luxe-container backdrop-blur-md">
            <AlertCircle size={32} className="text-destructive" />
            <div className="space-y-1">
                <p className="text-[14px] font-semibold uppercase tracking-tighter text-foreground">{error}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">CRITICAL REGISTRY ACCESS FAILURE</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/hod/subjects')} className="mt-4 font-semibold uppercase tracking-widest text-[11px] h-10 px-8">
                <ArrowLeft size={16} className="mr-2" /> Return to Modules
            </Button>
        </div>
    );

    return (
        <div className="space-y-10 animate-in luxe-container pb-12">
            {(error || successMsg) && (
                <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-sm shadow-2xl border flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-right-full
                    ${successMsg ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${successMsg ? 'bg-emerald-500' : 'bg-destructive'} animate-pulse`}></div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest">{successMsg || error}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-8">
                <div className="space-y-4">
                    <button 
                        onClick={() => navigate('/hod/subjects')}
                        className="flex items-center gap-2 text-[10px] font-semibold text-primary uppercase tracking-[0.2em] group transition-all hover:translate-x-[-4px]"
                    >
                        <ArrowLeft size={14} className="group-hover:scale-110 transition-transform" /> 
                        Return to Registry
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-2 font-semibold uppercase tracking-widest text-[10px] text-primary">
                            <span className="w-10 h-px bg-primary opacity-30"></span>
                            Evaluation Protocol Configuration
                        </div>
                        <h1 className="text-3xl font-semibold text-foreground tracking-tighter m-0 uppercase flex items-center gap-3">
                            Assessment Structure
                            <Badge variant="outline" className={`text-[10px] py-1 px-3 uppercase tracking-widest bg-primary/5 ${isValidWeightage ? 'border-primary/20 text-primary' : 'border-destructive/20 text-destructive'}`}>
                                Total Weight: {totalWeightage}%
                            </Badge>
                        </h1>
                        <p className="text-[13px] font-medium text-muted-foreground mt-1.5 flex items-center gap-3">
                            Defining evaluation nodes for module <span className="text-foreground font-semibold uppercase tracking-tight">{subject?.code}: {subject?.name}</span>
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        size="lg"
                        onClick={handleSavePattern} 
                        disabled={saving || !isValidWeightage}
                        className="font-semibold uppercase tracking-widest text-[11px] h-12 px-10 shadow-lg shadow-primary/20"
                    >
                        {saving ? (
                            <RefreshCcw size={16} className="mr-2 animate-spin" />
                        ) : (
                            <Save size={16} className="mr-2" />
                        )}
                        {saving ? 'Synchronizing...' : 'Finalize Architecture'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Evaluation Nodes" 
                    value={assessments.length} 
                    icon={<Layers size={18} />} 
                    trend={{value: 'Configured', isUp: true}}
                    description="Active assessment clusters"
                />
                <StatCard 
                    label="Aggregate Weight" 
                    value={`${totalWeightage}%`} 
                    icon={<Percent size={18} />} 
                    trend={{value: isValidWeightage ? 'Compliant' : 'Invalid', isUp: isValidWeightage}}
                    description={isValidWeightage ? 'Protocol sum verified' : 'Requires synchronization'}
                />
                <StatCard 
                    label="Module Credits" 
                    value={subject?.credits || '0'} 
                    icon={<Activity size={18} />} 
                    trend={{value: 'Stable', isUp: true}}
                    description="Academic weight unit"
                />
                <StatCard 
                    label="Auth Status" 
                    value="HOD Verified" 
                    icon={<ShieldCheck size={18} />} 
                    trend={{value: 'Secure', isUp: true}}
                    description="Privileged access node"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <Card className="lg:col-span-1 border-border/60 overflow-hidden bg-background/40 backdrop-blur-md sticky top-10">
                    <div className="px-6 py-4 border-b border-border bg-background/30 flex items-center gap-3">
                        <Settings size={18} className="text-primary" />
                        <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-tighter m-0">Module Parameters</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-1.5">
                            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Protocol Code</div>
                            <div className="text-[14px] font-semibold text-foreground tracking-tight uppercase flex items-center gap-2">
                                <FileText size={14} className="text-primary/60" />
                                {subject?.code}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Identity Designation</div>
                            <div className="text-[14px] font-semibold text-foreground tracking-tight uppercase">
                                {subject?.name}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border/40 space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                <span>Academic Cycle</span>
                                <span className="text-foreground">SEM {subject?.semester}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                <span>Module Units</span>
                                <span className="text-foreground">{subject?.credits} CR</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                <span>Status</span>
                                <Badge variant="outline" className="text-[8px] py-0 px-2 border-emerald-500/20 text-emerald-500 uppercase tracking-widest bg-emerald-500/5">
                                    ACTIVE
                                </Badge>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-border/60 shadow-xl overflow-hidden bg-background/40 backdrop-blur-md flex flex-col">
                        <div className="px-8 py-6 border-b border-border bg-background/30 flex justify-between items-center">
                            <div>
                                <h2 className="text-[15px] font-semibold text-foreground tracking-tighter m-0 uppercase flex items-center gap-3">
                                    <Zap size={20} className="text-primary" />
                                    Evaluation Node Architecture
                                </h2>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">Fragmenting {subject?.name} into assessment clusters</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleAddAssessment} className="font-semibold uppercase tracking-widest text-[10px] h-9 px-5 border-primary/20 hover:border-primary/40 text-primary">
                                <Plus size={16} className="mr-2" /> Add Component Node
                            </Button>
                        </div>

                        <div className="p-8 space-y-6">
                            {assessments.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center gap-4 opacity-40">
                                    <Layers size={48} className="text-muted-foreground" />
                                    <div className="space-y-1">
                                        <p className="text-[13px] font-semibold uppercase tracking-widest">No assessment components defined.</p>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Initialize protocol by adding a component node</p>
                                    </div>
                                </div>
                            ) : (
                                assessments.map((assessment, index) => (
                                    <div 
                                        key={index} 
                                        className="relative group bg-background/60 border border-border/60 rounded-sm p-6 flex flex-col lg:flex-row items-end gap-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                                    >
                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.2em] px-2 py-0.5 border border-border/60 rounded bg-background/80">
                                                NODE #{index + 1}
                                            </div>
                                        </div>

                                        <div className="w-full lg:flex-1 space-y-2">
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] ml-1">Identity Designation</label>
                                            <Input
                                                placeholder="e.g. CORE ASSESSMENT"
                                                value={assessment.name}
                                                onChange={(e: any) => handleAssessmentChange(index, 'name', e.target.value)}
                                                className="bg-white/50 font-semibold text-[13px] uppercase h-11 border-border/60 hover:border-primary/40 focus:border-primary transition-all"
                                            />
                                        </div>
                                        
                                        <div className="w-full lg:w-48 space-y-2">
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] ml-1">Node Protocol Type</label>
                                            <div className="relative">
                                                <select 
                                                    className="w-full h-11 text-[13px] bg-white/50 border border-border border-border/60 rounded-sm px-4 text-foreground focus:outline-none appearance-none font-semibold uppercase transition-all hover:border-primary/40"
                                                    value={assessment.type} 
                                                    onChange={(e) => handleAssessmentChange(index, 'type', e.target.value as any)}
                                                >
                                                    <option value="Exam">Exam Cycle</option>
                                                    <option value="Assignment">Task Unit</option>
                                                    <option value="Quiz">Quick Sync</option>
                                                    <option value="Lab">Practical Node</option>
                                                    <option value="Project">Integrated Build</option>
                                                    <option value="Other">External Fragment</option>
                                                </select>
                                                <MoreHorizontal size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none rotate-90" />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 w-full lg:w-72">
                                            <div className="flex-1 space-y-2">
                                                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] ml-1 text-center lg:text-left">Marks Factor</label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={assessment.maxMarks}
                                                    onChange={(e: any) => handleAssessmentChange(index, 'maxMarks', Number(e.target.value))}
                                                    className="bg-white/50 font-semibold text-[14px] text-center h-11 border-border/60 hover:border-primary/40 transition-all tabular-nums"
                                                />
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] ml-1 text-center lg:text-left text-primary">Weight %</label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={assessment.weightage}
                                                    onChange={(e: any) => handleAssessmentChange(index, 'weightage', Number(e.target.value))}
                                                    className="bg-primary/5 text-primary font-semibold text-[14px] text-center h-11 border-primary/20 hover:border-primary/40 transition-all tabular-nums"
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleRemoveAssessment(index)}
                                            className="h-11 w-11 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border/60 group-hover:border-destructive/20"
                                            title="Nullify Node"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                ))
                            )}

                            <div className={`mt-8 p-6 rounded-sm border flex items-center justify-between transition-all duration-500 shadow-2xl backdrop-blur-md
                                ${isValidWeightage ? 'bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5' : 'bg-destructive/5 border-destructive/20 shadow-destructive/5'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-sm border flex items-center justify-center transition-all duration-500
                                        ${isValidWeightage ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
                                        {isValidWeightage ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[14px] font-semibold text-foreground uppercase tracking-tight">System Protocol Verification</h3>
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                            {isValidWeightage 
                                                ? 'Assessment distribution synchronized with department standards (100%).' 
                                                : `Total aggregate weightage must equal exactly 100%. Protocol current: ${totalWeightage}%`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">AGGREGATE SUM</div>
                                    <div className={`text-4xl font-semibold tabular-nums tracking-tighter transition-colors duration-500 ${isValidWeightage ? 'text-emerald-500' : 'text-destructive'}`}>
                                        {totalWeightage}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InternalPattern;

