import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const icons: Record<ToastType, React.ReactElement> = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
};

const styles: Record<ToastType, string> = {
    success: 'border-l-4 border-emerald-500 bg-white',
    error: 'border-l-4 border-rose-500 bg-white',
    warning: 'border-l-4 border-amber-500 bg-white',
    info: 'border-l-4 border-blue-500 bg-white',
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const show = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).substring(2);
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => remove(id), 4000);
    }, [remove]);

    const ctx: ToastContextType = {
        success: (msg) => show('success', msg),
        error: (msg) => show('error', msg),
        warning: (msg) => show('warning', msg),
        info: (msg) => show('info', msg),
    };

    return (
        <ToastContext.Provider value={ctx}>
            {children}
            <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 80, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl max-w-sm w-full ${styles[toast.type]}`}
                        >
                            {icons[toast.type]}
                            <p className="text-sm font-semibold text-slate-700 flex-1 leading-snug">{toast.message}</p>
                            <button
                                onClick={() => remove(toast.id)}
                                className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
};
