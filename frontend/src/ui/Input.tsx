import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = ({
  label,
  errorMessage,
  helperText,
  icon,
  className = '',
  ...props
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[12px] font-semibold text-color-text-muted px-0.5">
          {label} {props.required && <span className="text-color-error">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-color-text-subtle group-focus-within:text-color-primary transition-colors duration-200">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 14 }) : icon}
          </div>
        )}
        <input
          className={`
            w-full h-9 rounded-md border text-[13px] 
            transition-all duration-200 ease-out
            bg-surface-glass backdrop-blur-sm
            ${icon ? 'pl-9 pr-3' : 'px-3'} 
            ${errorMessage 
              ? 'border-color-error focus:ring-4 focus:ring-color-error/10' 
              : 'border-color-border focus:border-color-primary focus:ring-4 focus:ring-color-primary/10 hover:border-color-border-hover'} 
            placeholder:text-color-text-subtle 
            disabled:bg-color-border-light disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
      {errorMessage && <span className="text-[11px] font-medium text-color-error mt-0.5">{errorMessage}</span>}
      {helperText && !errorMessage && <span className="text-[11px] text-color-text-subtle mt-0.5">{helperText}</span>}
    </div>
  );
};
