import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  className?: string;
}

export const Badge = ({ children, variant = 'primary', className = '' }: BadgeProps) => {
  const variants = {
    primary:   "bg-color-primary-light text-color-primary border-color-primary/10",
    secondary: "bg-color-border-light text-color-text-muted border-color-border",
    success:   "bg-color-success-light text-color-success border-color-success/10",
    warning:   "bg-color-warning-light text-color-warning border-color-warning/10",
    error:     "bg-color-error-light text-color-error border-color-error/10",
    outline:   "bg-transparent text-color-text-subtle border-color-border",
  };

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold tracking-wide uppercase border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

