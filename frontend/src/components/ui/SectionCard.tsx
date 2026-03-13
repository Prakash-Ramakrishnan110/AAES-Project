
import React, { cloneElement } from 'react';
import { motion } from 'framer-motion';

interface SectionCardProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    dark?: boolean;
}

const SectionCard = ({ title, subtitle, icon, actions, children, className = '', dark = false }: SectionCardProps) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`dashboard-card overflow-hidden ${dark ? 'bg-[#1B2559] text-white border-none' : ''} ${className}`}
        >
            <div className="p-4 flex items-center justify-between gap-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`text-gray-400 group-hover:text-primary transition-colors`}>
                            {cloneElement(icon as any, { size: 18, strokeWidth: 2 })}
                        </div>
                    )}
                    <div>
                        <h3 className={`text-[14px] font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                        {subtitle && <p className={`text-[10px] font-medium mt-0.5 uppercase tracking-wider text-gray-400`}>{subtitle}</p>}
                    </div>
                </div>
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
            <div className="p-4">
                {children}
            </div>
        </motion.div>
    );
};

export default SectionCard;
