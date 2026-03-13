
import React, { cloneElement } from 'react';

interface ListItemProps {
    title: string;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
    badges?: { label: string; variant?: 'success' | 'warning' | 'info' | 'default' | 'danger' }[];
    actions?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    description?: React.ReactNode;
}

const ListItem = ({ title, subtitle, icon, badges, actions, onClick, className = '', description }: ListItemProps) => {
    const badgeStyles = {
        success: 'bg-green-50 text-green-700 border-green-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        info: 'bg-blue-50 text-blue-700 border-blue-100',
        danger: 'bg-red-50 text-red-700 border-red-100',
        default: 'bg-gray-50 text-gray-600 border-gray-100'
    };

    return (
        <div 
            onClick={onClick}
            className={`flex flex-col md:flex-row items-start md:items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0 ${onClick ? 'cursor-pointer active:scale-[0.995]' : ''} ${className}`}
        >
            {icon && (
                <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 group-hover:text-primary transition-colors">
                    {cloneElement(icon as any, { size: 18, strokeWidth: 2 })}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    {badges && badges.map((badge, idx) => (
                        <span 
                            key={idx} 
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${badgeStyles[badge.variant || 'default']}`}
                        >
                            {badge.label}
                        </span>
                    ))}
                    {subtitle && (
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                            {subtitle}
                        </div>
                    )}
                </div>
                <h4 className="text-[14px] font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                    {title}
                </h4>
                {description && (
                    <div className="mt-1 text-[12px] font-medium text-gray-500 line-clamp-1">
                        {description}
                    </div>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2 w-full md:w-auto mt-3 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default ListItem;
