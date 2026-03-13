import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-0.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full px-3 py-2 rounded-md border bg-white text-slate-900 placeholder-slate-400 text-sm
                            focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900
                            transition-colors duration-200 shadow-sm
                            ${icon ? 'pl-10' : ''}
                            ${error ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-300'}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-500 ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
