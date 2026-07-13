import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type = 'success', onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: { border: 'border-l-success', icon: <Check className="text-success w-3.5 h-3.5" /> },
    error: { border: 'border-l-danger', icon: <XCircle className="text-danger w-3.5 h-3.5" /> },
    warning: { border: 'border-l-warning', icon: <AlertCircle className="text-warning w-3.5 h-3.5" /> },
    info: { border: 'border-l-primary', icon: <Info className="text-primary w-3.5 h-3.5" /> },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`
        fixed bottom-4 right-4 z-[110]
        flex items-center gap-2.5 
        px-4 py-2.5 
        bg-surface
        rounded-sm 
        shadow-sm 
        border border-border 
        border-l-[3px]
        ${styles[type].border}
      `}
    >
      {styles[type].icon}
      <span className="text-[12px] font-medium text-text">{message}</span>
      <button onClick={onClose} className="ml-2 text-text-muted hover:text-text transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
};

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  circle?: boolean;
}

export const LoadingSkeleton = ({ width = '100%', height = 16, className = '', circle = false }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse bg-background ${circle ? 'rounded-full' : 'rounded-sm'} ${className}`}
      style={{ width, height }}
    />
  );
};
