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
            whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={`${!hasBg ? 'bg-white' : ''} rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${hover ? 'hover:shadow-xl hover:shadow-blue-500/5 transition-shadow duration-300' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {(title || action) && (
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
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

export default Card;
