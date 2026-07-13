import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  fullWidth = false,
  ...props
}: ButtonProps) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap active:scale-[0.98]';

  const variants = {
    primary:   'bg-color-primary text-white hover:bg-color-primary-hover shadow-sm shadow-primary/20',
    secondary: 'bg-color-primary-light text-color-primary hover:bg-opacity-80',
    ghost:     'text-color-text-muted hover:bg-color-border-light hover:text-color-text',
    error:     'bg-color-error text-white hover:bg-opacity-90 shadow-sm shadow-error/20',
    outline:   'border border-color-border bg-transparent text-color-text hover:bg-color-border-light hover:border-color-border-hover',
  };

  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'h-9 px-4 text-[13px]',
    lg: 'h-10 px-5 text-[14px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon && <span className="flex-shrink-0 flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
