import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card = ({ children, className = '', onClick, hover = false }: CardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-surface border border-border rounded-md shadow-sm 
        ${hover || onClick ? 'hover:border-border-hover hover:shadow-md transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
