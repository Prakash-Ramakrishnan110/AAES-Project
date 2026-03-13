import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    onClick?: () => void;
}

const Card = ({ children, className = '', hover = false, title, subtitle, action, onClick }: CardProps) => {
    // Check if a background class is already provided in className
    const hasBg = className.includes('bg-');

    return (
        <motion.div
            onClick={onClick}
            whileHover={hover ? {} : {}}
            className={`${!hasBg ? 'bg-white' : ''} rounded-md shadow-sm border border-slate-200 overflow-hidden ${hover ? 'hover:border-slate-300 transition-colors duration-200' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {(title || action) && (
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        {title && <h3 className="text-[15px] font-semibold text-slate-800">{title}</h3>}
                        {subtitle && <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </motion.div>
    );
};

export { Card };
