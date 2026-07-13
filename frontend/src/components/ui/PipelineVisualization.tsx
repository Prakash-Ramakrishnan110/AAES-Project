import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Loader2, AlertCircle, Zap } from 'lucide-react';

export type PipelineStage = 
  | 'upload' 
  | 'quality_check' 
  | 'image_processing' 
  | 'ocr' 
  | 'vision_understanding' 
  | 'math_logic'
  | 'similarity' 
  | 'evaluation' 
  | 'result';

interface Stage {
  key: PipelineStage;
  label: string;
}

const STAGES: Stage[] = [
  { key: 'upload', label: 'Identity Verification' },
  { key: 'quality_check', label: 'Image Quality Shield' },
  { key: 'image_processing', label: 'Adaptive HTR Preprocessing' },
  { key: 'ocr', label: 'Handwriting Extraction' },
  { key: 'vision_understanding', label: 'Diagram & Visual Analysis' },
  { key: 'math_logic', label: 'Symbolic Math Verification' },
  { key: 'similarity', label: 'Integrity Check' },
  { key: 'evaluation', label: 'Neural Grading Engine' },
  { key: 'result', label: 'Academic Insights Ready' },
];

interface PipelineVisualizationProps {
  currentStage: PipelineStage;
  completedStages: PipelineStage[];
  errorStage?: PipelineStage;
  isVisible: boolean;
}

const PipelineVisualization: React.FC<PipelineVisualizationProps> = ({
  currentStage,
  completedStages,
  errorStage,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-[#0B1437]/90 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-blue-400 fill-blue-400/20" />
            </div>
            Neural Evaluation Pipeline
          </h3>
          <p className="text-white/40 text-[11px] font-semibold uppercase tracking-[0.2em] mt-1 ml-11">
            Real-time inference active
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-semibold text-green-500 uppercase">Secure</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {STAGES.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.key);
          const isProcessing = currentStage === stage.key && !errorStage;
          const isError = errorStage === stage.key;

          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                isProcessing ? 'bg-blue-500/20 border border-blue-500/30' : 
                isError ? 'bg-red-500/20 border border-red-500/30' : 'bg-transparent'
              }`}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </motion.div>
                ) : isProcessing ? (
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                ) : isError ? (
                  <AlertCircle className="w-6 h-6 text-red-400" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-500" />
                )}
              </div>
              
              <div className="flex-grow">
                <p className={`font-medium ${
                  isCompleted ? 'text-green-400' : 
                  isProcessing ? 'text-blue-400 active-stage-glow' : 
                  isError ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {stage.label}
                </p>
                {isProcessing && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="h-1 bg-blue-500/30 rounded-full mt-2 overflow-hidden"
                  >
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="h-full w-1/3 bg-blue-400 rounded-full"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineVisualization;

