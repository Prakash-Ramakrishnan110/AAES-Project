import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Eye, 
    FileText, 
    Search, 
    BarChart3, 
    UploadCloud, 
    Zap,
    Sparkles
} from 'lucide-react';

interface StageConfig {
    label: string;
    description: string;
    icon: any;
    color: string;
}

const stages: StageConfig[] = [
    { label: 'Shield', description: 'Applying Adaptive HTR Preprocessing...', icon: UploadCloud, color: 'indigo' },
    { label: 'Vision', description: 'Llava Deep Visual Analysis active...', icon: Eye, color: 'blue' },
    { label: 'Diagrams', description: 'Extracting sketches & structures...', icon: Search, color: 'cyan' },
    { label: 'OCR', description: 'Neural Handwriting Extraction...', icon: FileText, color: 'sky' },
    { label: 'Logic', description: 'Verifying Symbolic Math Reasoning...', icon: Zap, color: 'violet' },
    { label: 'Integrity', description: 'Cross-referencing knowledge base...', icon: Search, color: 'purple' },
    { label: 'Grading', description: 'Gemma 2B Neural Evaluation core...', icon: BarChart3, color: 'indigo' },
    { label: 'Insights', description: 'Generating Reasoning & Feedback...', icon: Sparkles, color: 'emerald' },
];

const GemmaLogo = () => (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="#4285F4"/>
        <path d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM20 28C15.58 28 12 24.42 12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28Z" fill="white"/>
        <path d="M24 16H16V24H24V16Z" fill="white"/>
    </svg>
);

const MistralLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 90L50 10L90 90H70L50 50L30 90H10Z" fill="#ff6b00"/>
    </svg>
);

interface AiProcessingOverlayProps {
    isProcessing: boolean;
    onComplete: () => void;
}

const AiProcessingOverlay: React.FC<AiProcessingOverlayProps> = ({ isProcessing, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isProcessing && currentIndex < stages.length) {
            const duration = currentIndex === 6 ? 2500 : 1500; // Longer for evaluation
            const timer = setTimeout(() => {
                if (currentIndex < stages.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    setTimeout(onComplete, 1000);
                }
            }, duration);
            return () => clearTimeout(timer);
        } else if (!isProcessing) {
            setCurrentIndex(0);
        }
    }, [isProcessing, currentIndex, onComplete]);

    if (!isProcessing) return null;

    const currentStage = stages[currentIndex];
    const isEvaluation = currentIndex === 6; // 'Grading' stage

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-2xl px-6"
            >
                <div className="w-full max-w-sm flex flex-col items-center">
                    
                    {/* Minimalist Focal Point - The AI Lens */}
                    <div className="relative mb-12">
                        {/* Outer Glowing Rings */}
                        <motion.div 
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -inset-12 bg-indigo-500/10 rounded-full blur-3xl"
                        />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="absolute -inset-8 border border-slate-200 rounded-full border-dashed opacity-50"
                        />
                        
                        {/* The Core Orb */}
                        <motion.div 
                            key={currentIndex}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="relative w-32 h-32 bg-white rounded-full shadow-[0_16px_48px_-12px_rgba(0,0,0,0.1)] flex items-center justify-center border border-slate-100/50"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isEvaluation ? 'logos' : 'icon'}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="flex items-center justify-center gap-4"
                                >
                                    {isEvaluation ? (
                                        <div className="flex gap-4">
                                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                                <GemmaLogo />
                                            </motion.div>
                                            <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
                                                <MistralLogo />
                                            </motion.div>
                                        </div>
                                    ) : (
                                        <currentStage.icon className="w-10 h-10 text-slate-800" />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                            
                            {/* Pulsing Pulse Effect */}
                            <motion.div 
                                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 rounded-full bg-slate-400"
                            />
                        </motion.div>
                    </div>

                    {/* Integrated Text Stage */}
                    <div className="text-center space-y-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStage.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-[0.3em] mb-1">
                                    {currentStage.label}
                                </h3>
                                <p className="text-xs font-medium text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                                    {currentStage.description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Progress Micro-bar */}
                    <div className="mt-12 w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            animate={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
                            className="h-full bg-slate-900 rounded-full"
                        />
                    </div>

                    <div className="mt-8">
                        <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
                            {currentIndex + 1} / {stages.length}
                        </span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AiProcessingOverlay;

