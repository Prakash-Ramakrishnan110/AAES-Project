import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, message, actionLabel, onAction }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            {Icon && (
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5">
                    <Icon className="w-8 h-8 text-slate-300" />
                </div>
            )}
            <h3 className="text-base font-bold text-slate-700 mb-2">{title}</h3>
            {message && <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-5">{message}</p>}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-indigo-200 shadow-lg"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
