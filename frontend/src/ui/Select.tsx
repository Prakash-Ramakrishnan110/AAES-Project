import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  errorMessage?: string;
  options: { label: string; value: string | number }[];
}

export const Select = ({ label, errorMessage, options, className = '', ...props }: SelectProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-[12px] font-medium text-text-muted">
          {label} {props.required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full appearance-none
            bg-surface 
            border 
            ${errorMessage ? 'border-danger focus:ring-danger/20' : 'border-border'} 
            rounded 
            px-2.5 h-8 
            text-[13px] text-text
            transition-colors duration-150 
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
            disabled:bg-background disabled:text-text-muted
            ${className}
          `}
          {...props}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle w-3.5 h-3.5 pointer-events-none" />
      </div>
      {errorMessage && <span className="text-[11px] text-danger mt-0.5">{errorMessage}</span>}
    </div>
  );
};
