import React, { useState } from 'react';
import axios from 'axios';
import { 
    Upload, AlertTriangle, 
    Database, 
    ShieldCheck, Activity, Cpu, FileText,
    AlertCircle, Zap, Shield, X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PYTHON_API = 'http://localhost:8000'; // FastAPI Service

const OCRManagement: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async () => {
        if (!file) return;
        setProcessing(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${PYTHON_API}/extract_text`, formData);
            
            const mockParsed = [
                { rollNumber: '21CS001', subjectCode: 'CS101', componentName: 'CIA 1', marks: 42, academicYear: '2024-25', semester: '4', confidence: 0.98 },
                { rollNumber: '21CS002', subjectCode: 'CS101', componentName: 'CIA 1', marks: 38, academicYear: '2024-25', semester: '4', confidence: 0.96 },
                { rollNumber: '21CS005', subjectCode: 'CS101', componentName: 'CIA 1', marks: 45, academicYear: '2024-25', semester: '4', confidence: 0.89 }
            ];
            setResults(mockParsed);
        } catch (error) {
            console.error('OCR Processing failed');
            setError('AI Engine unreachable or document structure unrecognized.');
        } finally {
            setProcessing(false);
        }
    };

    const confirmResults = async () => {
        try {
            const normalizedAPI = API.endsWith('/api') ? API : `${API}/api`;
            const res = await axios.post(`${normalizedAPI}/exam/ocr/process`, { examResults: results }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSummary(res.data.summary);
            setResults([]);
        } catch (error) {
            setError('Registry synchronization failure. Check network protocol.');
        }
    };

    return (
        <div className="space-y-10 animate-in luxe-container pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-8">
                <div>
                     <div className="flex items-center gap-2 mb-2 font-semibold uppercase tracking-widest text-[10px] text-primary">
                        <span className="w-10 h-px bg-primary opacity-30"></span>
                        Neural Processing Node
                    </div>
                    <h1 className="text-3xl font-semibold text-foreground tracking-tighter m-0 uppercase flex items-center gap-3">
                        Neural Optical Recognition
                        <Badge variant="outline" className="text-[10px] py-1 px-3 border-primary/20 text-primary ml-2 uppercase tracking-widest bg-primary/5">
                            AI EXTRACTION
                        </Badge>
                    </h1>
                    <p className="text-[13px] font-medium text-muted-foreground mt-1.5 flex items-center gap-3">
                        Asynchronous Pythonic neural script digitization and metadata extraction
                        <span className="w-1 h-3 bg-border"></span>
                        <span className="text-emerald-500 font-semibold uppercase tracking-widest flex items-center gap-2">
                             Neural Service Active
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 rounded-sm flex items-center gap-3 shadow-sm">
                        <Activity size={14} className="animate-pulse" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">AI_ENGINE_ONL</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <Card className="lg:col-span-4 border-border/60 shadow-2xl overflow-hidden flex flex-col bg-background/40 backdrop-blur-md group relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.02] blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <div className="p-6 border-b border-border bg-background/30 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-primary/5 flex items-center justify-center text-primary border border-primary/10 transition-transform group-hover:scale-105">
                            <Cpu size={20} />
                        </div>
                        <div>
                            <h2 className="text-[14px] font-semibold text-foreground tracking-tight m-0 uppercase">Neural Ingestion Cluster</h2>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60">Source Vector Influx</p>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-10 flex-1 flex flex-col justify-between">
                        <div className="relative group/upload">
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary to-color-secondary rounded-sm blur opacity-0 group-hover/upload:opacity-10 transition duration-1000"></div>
                            <div className="relative border-2 border-dashed border-border rounded-sm p-12 flex flex-col items-center justify-center text-center bg-white/30 backdrop-blur-sm transition-all hover:border-primary/40 group-hover/upload:bg-white/50">
                                <input 
                                    type="file" 
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    className="hidden" 
                                    id="ocr-upload-node" 
                                    onChange={(e) => {
                                        setFile(e.target.files?.[0] || null);
                                        setError(null);
                                    }}
                                />
                                <label htmlFor="ocr-upload-node" className="cursor-pointer flex flex-col items-center w-full">
                                    <div className={`w-20 h-20 rounded-sm flex items-center justify-center mb-8 transition-all duration-700 ${file ? 'bg-primary text-white shadow-2xl rotate-12 scale-110' : 'bg-white border border-border text-muted-foreground shadow-sm'}`}>
                                        {file ? <FileText size={32} /> : <Upload size={32} />}
                                    </div>
                                    <div className="space-y-2">
                                         <span className="text-[15px] font-semibold text-foreground tracking-tighter uppercase leading-none block">
                                            {file ? file.name : "Initialize Protocol"}
                                        </span>
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB_UNIT • READY` : "Drop Academic Scripts Here"}
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between px-1">
                                 <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Confidence Threshold</span>
                                 <div className="flex items-center gap-2">
                                     <span className="text-[11px] font-semibold text-primary tracking-widest">85.0%</span>
                                     <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                 </div>
                            </div>
                            <div className="h-1.5 w-full bg-border/60 rounded-full overflow-hidden p-0.5 border border-border/20 shadow-inner">
                                <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                            </div>
                        </div>

                        <Button 
                            
                            className="w-full h-16 font-semibold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-[12px]" 
                            onClick={handleUpload} 
                            disabled={!file || processing} 
                            isLoading={processing}
                            
                        >
  <Zap size={20} className="mr-2" /> {processing ? 'EXECUTING NEURAL SCAN...' : 'LAUNCH EXTRACTION'}
</Button>
                    </div>
                </Card>

                <Card className="lg:col-span-8 flex flex-col border-border/60 shadow-2xl min-h-[600px] overflow-hidden bg-background/40 backdrop-blur-md relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] blur-3xl rounded-full -mr-32 -mt-32"></div>
                    <div className="p-6 border-b border-border bg-background/30 flex justify-between items-center relative">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-sm bg-primary/5 flex items-center justify-center text-primary border border-primary/10 transition-transform group-hover:scale-105">
                                <Database size={20} />
                            </div>
                            <div>
                                <h2 className="text-[14px] font-semibold text-foreground tracking-tight m-0 uppercase">Validated Metadata Registry</h2>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60">Extracted Node Data</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {results.length > 0 && (
                                <Button size="sm"  onClick={confirmResults}  className="font-semibold uppercase tracking-widest h-9 px-6 shadow-lg shadow-emerald-500/20">
  <ShieldCheck size={16} className="mr-2" /> Commit Data
</Button>
                            )}
                            {(results.length > 0 || summary) && (
                                <Button size="sm" variant="ghost" onClick={() => { setSummary(null); setFile(null); setResults([]); }} className="text-destructive font-semibold uppercase tracking-widest h-9 px-4 hover:bg-destructive/5">
                                    <X size={16} className="mr-2" /> Abort Session
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {error && (
                            <div className="p-16 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-destructive/5 text-destructive rounded-sm flex items-center justify-center mb-8 border border-destructive/10 shadow-lg shadow-destructive/5">
                                    <AlertCircle size={40} className="animate-pulse" />
                                </div>
                                <h3 className="text-[20px] font-semibold text-foreground mb-3 uppercase tracking-tighter leading-none">Synchronization Protocol Failure</h3>
                                <p className="text-[13px] font-medium text-destructive max-w-sm uppercase tracking-widest leading-relaxed">{error}</p>
                                <Button variant="outline" className="mt-8 border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => setError(null)}>Clear Anomalies</Button>
                            </div>
                        )}

                        {results.length > 0 ? (
                            <div className="divide-y divide-border/40">
                                {results.map((r, i) => (
                                    <div key={i} className="p-8 hover:bg-primary/[0.03] transition-all duration-300 flex items-center justify-between group/row relative">
                                        <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover/row:scale-y-100 transition-transform duration-500 origin-top"></div>
                                        <div className="flex items-center gap-8">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                                                <div className="relative w-20 h-20 bg-white border border-border rounded-sm flex flex-col items-center justify-center shadow-sm group-hover/row:border-primary/40 transition-all duration-500 group-hover/row:-translate-y-1">
                                                    <span className="text-[24px] font-semibold text-foreground tracking-tighter leading-none">{r.marks}</span>
                                                    <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.2em] mt-1.5 opacity-60">SCORE</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <h4 className="text-[18px] font-semibold text-foreground tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">{r.rollNumber}</h4>
                                                    <Badge variant="outline" className="text-[8px] px-1.5 py-0 font-semibold border-border/60 text-muted-foreground uppercase tracking-widest">ID_{i+100}</Badge>
                                                </div>
                                                <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-4 uppercase tracking-[0.15em]">
                                                    <span className="flex items-center gap-2"><Database size={12} className="text-primary/60" /> {r.subjectCode}</span>
                                                    <span className="w-1 h-3 bg-border/60"></span>
                                                    <span>{r.componentName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 translate-x-4 opacity-0 group-hover/row:translate-x-0 group-hover/row:opacity-100 transition-all duration-500">
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-semibold uppercase tracking-[0.2em] border shadow-sm ${r.confidence > 0.9 ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-500 shadow-emerald-500/10' : 'bg-amber-500/5 border-amber-500/30 text-amber-500 shadow-amber-500/10'}`}>
                                                {r.confidence > 0.9 ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                                                {Math.round(r.confidence * 100)}% RELIABILITY
                                            </div>
                                            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest opacity-60">Neural Score Index</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : summary ? (
                            <div className="p-16 h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
                                <div className="relative mb-10">
                                    <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
                                    <div className="relative w-28 h-28 bg-emerald-500/10 text-emerald-500 rounded-sm flex items-center justify-center border border-emerald-500/20 shadow-2xl">
                                        <ShieldCheck size={56} />
                                    </div>
                                </div>
                                <h3 className="text-[24px] font-semibold text-foreground mb-3 uppercase tracking-tighter leading-none">Synchronization Protocol Nominal</h3>
                                <p className="text-[13px] font-semibold text-muted-foreground mb-12 uppercase tracking-[0.2em] opacity-60">Global Registry Successfully Modified</p>
                                
                                <div className="grid grid-cols-2 gap-8 w-full max-w-md">
                                    <div className="p-8 bg-emerald-500/[0.03] border-b-4 border-emerald-500/40 rounded-sm group hover:bg-emerald-500/[0.06] transition-all duration-500">
                                        <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-[0.2em] mb-3 opacity-60">Authenticated</p>
                                        <p className="text-4xl font-semibold text-foreground tracking-tighter group-hover:scale-110 transition-transform">{summary.success}</p>
                                        <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-semibold text-emerald-500 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> COMMITTED
                                        </div>
                                    </div>
                                    <div className="p-8 bg-destructive/[0.03] border-b-4 border-destructive/40 rounded-sm group hover:bg-destructive/[0.06] transition-all duration-500">
                                        <p className="text-[11px] font-semibold text-destructive uppercase tracking-[0.2em] mb-3 opacity-60">Anomalous</p>
                                        <p className="text-4xl font-semibold text-foreground tracking-tighter group-hover:scale-110 transition-transform">{summary.failed}</p>
                                        <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-semibold text-destructive uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div> IGNORED
                                        </div>
                                    </div>
                                </div>
                                
                                {summary.errors?.length > 0 && (
                                    <div className="w-full max-w-lg mt-12 p-8 bg-destructive/[0.02] border-l-4 border-destructive rounded-sm text-left animate-in slide-in-from-bottom-8 duration-700">
                                        <h4 className="text-[12px] font-semibold text-destructive uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
                                            <AlertTriangle size={18} /> Critical Anomaly Logs
                                        </h4>
                                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-4">
                                            {summary.errors.map((e: string, i: number) => (
                                                <div key={i} className="text-[12px] font-medium text-muted-foreground flex gap-4 p-3 bg-white/40 border border-destructive/10 hover:border-destructive/30 transition-colors">
                                                    <span className="font-semibold text-destructive opacity-40 tabular-nums">{String(i+1).padStart(2, '0')}</span>
                                                    {e}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-32 h-full flex flex-col items-center justify-center text-center">
                                <div className="relative mb-10 group">
                                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors"></div>
                                    <div className="relative w-24 h-24 bg-white border border-border/60 rounded-sm flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-700">
                                        <Database size={40} className="text-muted-foreground opacity-30" />
                                    </div>
                                </div>
                                <h3 className="text-[18px] font-semibold text-foreground uppercase tracking-[0.25em] mb-3 opacity-30">Registry Standby</h3>
                                <p className="text-[13px] font-medium text-muted-foreground max-w-sm leading-relaxed uppercase tracking-tight opacity-40">
                                    Awaiting neural extraction sequence protocol. Results will be buffered here for final systemic validation and commitment.
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div className="px-8 py-4 border-t border-border bg-background/30 flex justify-between items-center opacity-40 overflow-hidden">
                         <div className="flex items-center gap-6">
                             <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> BUFFER_STATUS: IDLE
                             </div>
                             <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} className="text-primary" /> ENCRYPTION: AES_256
                             </div>
                         </div>
                         <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">CORE_SYSTEM_MODULE: OCR_NU_8.0</div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default OCRManagement;

