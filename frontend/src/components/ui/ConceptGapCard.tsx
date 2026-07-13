import React from 'react';
import { motion } from 'framer-motion';
import { Target, ArrowRight, ExternalLink } from 'lucide-react';

interface ConceptGapProps {
    concepts: {
        name: string;
        score: number;
        feedback: string;
        resource?: string;
    }[];
}

const ConceptGapCard: React.FC<ConceptGapProps> = ({ concepts }) => {
    return (
        <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Concept Mastery Map</h3>
                    <p className="text-xs font-medium text-slate-500">AI-driven identification of knowledge gaps</p>
                </div>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Target size={20} />
                </div>
            </div>

            <div className="space-y-4 pt-2">
                {concepts.map((concept, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group"
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">{concept.name}</span>
                            <span className={`text-[10px] font-semibold ${concept.score > 80 ? 'text-emerald-500' : concept.score > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                {concept.score}% Proficiency
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${concept.score}%` }}
                                className={`h-full rounded-full ${
                                    concept.score > 80 ? 'bg-emerald-500' : 
                                    concept.score > 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                            />
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 flex items-start gap-2">
                            <ArrowRight size={10} className="shrink-0 mt-0.5 text-slate-400" />
                            <p>{concept.feedback}</p>
                        </div>
                        {concept.resource && (
                            <a 
                                href={concept.resource}
                                className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50/50 px-2 py-1 rounded-md"
                            >
                                <ExternalLink size={10} />
                                Review Learning Material
                            </a>
                        )}
                        {idx < concepts.length - 1 && <div className="mt-4 border-b border-slate-50" />}
                    </motion.div>
                ))}
            </div>

            {concepts.length === 0 && (
                <div className="py-8 text-center">
                    <p className="text-xs text-slate-400 font-medium italic">Upload more assignments to generate your mastery map.</p>
                </div>
            )}
        </div>
    );
};

export default ConceptGapCard;

